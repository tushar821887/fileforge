import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import {
  getToolBySlug,
  ConversionJobResult,
  ConversionOptions,
  BatchConversionResponse,
} from '@formatflow/shared';
import type { UploadedFile } from '../../types/file.types.js';
import { StorageService } from '../storage/storage.service.js';
import { FileValidatorService } from '../validator/file-validator.service.js';
import { ImageEngine } from './engines/image.engine.js';
import { PdfEngine } from './engines/pdf.engine.js';
import { DocumentEngine } from './engines/document.engine.js';
import { ConfigService } from '@nestjs/config';

interface InternalJobState extends ConversionJobResult {
  convertedFilePath?: string;
  outputFilename: string;
}

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);
  private readonly jobs = new Map<string, InternalJobState>();
  private readonly retentionMinutes: number;

  constructor(
    private readonly storageService: StorageService,
    private readonly validatorService: FileValidatorService,
    private readonly imageEngine: ImageEngine,
    private readonly pdfEngine: PdfEngine,
    private readonly documentEngine: DocumentEngine,
    private readonly configService: ConfigService
  ) {
    this.retentionMinutes = this.configService.get<number>('fileRetentionMinutes') || 60;
  }

  getJob(jobId: string): ConversionJobResult {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Conversion job "${jobId}" not found or has expired.`);
    }
    return {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      originalFilename: job.originalFilename,
      originalSize: job.originalSize,
      originalMimeType: job.originalMimeType,
      convertedFilename: job.convertedFilename,
      convertedSize: job.convertedSize,
      convertedMimeType: job.convertedMimeType,
      downloadUrl: job.downloadUrl,
      error: job.error,
      metadata: job.metadata,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      expiresAt: job.expiresAt,
    };
  }

  getConvertedFileInfo(jobId: string): { filePath: string; mimeType: string; filename: string } {
    const job = this.jobs.get(jobId);
    if (!job || !job.convertedFilePath || !fs.existsSync(job.convertedFilePath)) {
      throw new NotFoundException(`Converted file for job "${jobId}" is no longer available.`);
    }

    return {
      filePath: job.convertedFilePath,
      mimeType: job.convertedMimeType || 'application/octet-stream',
      filename: job.outputFilename,
    };
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job) {
      this.jobs.delete(jobId);
    }
    await this.storageService.deleteJobFiles(jobId);
    return true;
  }

  async executeConversion(
    toolSlug: string,
    files: UploadedFile[],
    options: ConversionOptions = {}
  ): Promise<BatchConversionResponse> {
    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      throw new BadRequestException(`Unknown tool slug "${toolSlug}".`);
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded.');
    }

    if (files.length > tool.maxFiles) {
      throw new BadRequestException(`Maximum allowed files for this tool is ${tool.maxFiles}. Received ${files.length}.`);
    }

    // Validate all files first
    const validatedFiles = await Promise.all(
      files.map((file) =>
        this.validatorService.validateUploadedFile(file, tool.acceptedExtensions, tool.maxFileSizeMb)
      )
    );

    const batchId = uuidv4();
    const results: ConversionJobResult[] = [];

    // Check if tool is a consolidation tool (merging multiple files into one PDF)
    const isConsolidationTool = ['merge-pdf', 'images-to-pdf'].includes(toolSlug);

    if (isConsolidationTool) {
      const jobId = uuidv4();
      const now = Date.now();
      const expiresAt = now + this.retentionMinutes * 60 * 1000;

      const primaryName = validatedFiles[0].sanitizedName.replace(/\.[^.]+$/, '');
      const outFilename = `${primaryName}_merged.pdf`;

      const jobState: InternalJobState = {
        jobId,
        status: 'processing',
        progress: 25,
        originalFilename: files.map((f) => f.originalname).join(', '),
        originalSize: files.reduce((acc, f) => acc + f.size, 0),
        originalMimeType: files[0].mimetype,
        outputFilename: outFilename,
        createdAt: now,
        expiresAt,
      };
      this.jobs.set(jobId, jobState);

      try {
        let conversionResult: { buffer: Buffer; mimeType: string; outputExtension: string; metadata?: any };

        if (toolSlug === 'merge-pdf') {
          conversionResult = await this.pdfEngine.mergePdfs(files.map((f) => f.buffer));
        } else {
          // images-to-pdf
          const imgItems = files.map((f, i) => ({
            buffer: f.buffer,
            mimeType: validatedFiles[i].detectedMime,
            filename: validatedFiles[i].sanitizedName,
          }));
          conversionResult = await this.pdfEngine.imagesToPdf(imgItems, options);
        }

        const convertedPath = this.storageService.getConvertedPath(jobId, conversionResult.outputExtension);
        await this.storageService.saveBuffer(convertedPath, conversionResult.buffer);

        jobState.status = 'completed';
        jobState.progress = 100;
        jobState.convertedFilePath = convertedPath;
        jobState.convertedFilename = outFilename;
        jobState.convertedSize = conversionResult.buffer.length;
        jobState.convertedMimeType = conversionResult.mimeType;
        jobState.downloadUrl = `/api/v1/conversions/${jobId}/download`;
        jobState.completedAt = Date.now();
        jobState.metadata = conversionResult.metadata;

        results.push(this.getJob(jobId));
      } catch (err: any) {
        jobState.status = 'failed';
        jobState.progress = 0;
        jobState.error = err.message || 'Conversion failed.';
        results.push(this.getJob(jobId));
      }

      return { batchId, jobs: results };
    }

    // Individual file conversions
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const valid = validatedFiles[i];
      const jobId = uuidv4();
      const now = Date.now();
      const expiresAt = now + this.retentionMinutes * 60 * 1000;

      const targetFormat = tool.defaultOutputFormat;
      const baseName = valid.sanitizedName.replace(/\.[^.]+$/, '');
      const outFilename = `${baseName}_converted.${targetFormat}`;

      const jobState: InternalJobState = {
        jobId,
        status: 'processing',
        progress: 30,
        originalFilename: valid.originalName,
        originalSize: valid.size,
        originalMimeType: valid.detectedMime,
        outputFilename: outFilename,
        createdAt: now,
        expiresAt,
      };
      this.jobs.set(jobId, jobState);

      try {
        let conversionResult: { buffer: Buffer; mimeType: string; outputExtension: string; metadata?: any };

        // Route to the appropriate engine
        if (tool.category === 'image') {
          if (toolSlug === 'image-metadata') {
            const meta = await this.imageEngine.inspectMetadata(file.buffer);
            const jsonBuffer = Buffer.from(JSON.stringify(meta, null, 2), 'utf-8');
            conversionResult = {
              buffer: jsonBuffer,
              mimeType: 'application/json',
              outputExtension: 'json',
              metadata: meta,
            };
          } else {
            conversionResult = await this.imageEngine.processImage(file.buffer, targetFormat, options);
          }
        } else if (tool.category === 'pdf') {
          if (toolSlug === 'pdf-metadata') {
            const meta = await this.pdfEngine.inspectMetadata(file.buffer);
            const jsonBuffer = Buffer.from(JSON.stringify(meta, null, 2), 'utf-8');
            conversionResult = {
              buffer: jsonBuffer,
              mimeType: 'application/json',
              outputExtension: 'json',
              metadata: meta,
            };
          } else if (toolSlug === 'jpg-to-pdf' || toolSlug === 'png-to-pdf') {
            conversionResult = await this.pdfEngine.imagesToPdf(
              [{ buffer: file.buffer, mimeType: valid.detectedMime, filename: valid.sanitizedName }],
              options
            );
          } else if (toolSlug === 'split-pdf' || toolSlug === 'extract-pdf-pages') {
            conversionResult = await this.pdfEngine.splitOrExtractPages(file.buffer, options.pageRanges);
          } else if (toolSlug === 'rotate-pdf-pages') {
            conversionResult = await this.pdfEngine.rotatePages(file.buffer, options.pdfRotateDegrees, options.pageRanges);
          } else if (toolSlug === 'reorder-pdf-pages') {
            const order = options.pageOrder || (options.pageRanges ? options.pageRanges.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n)) : [1]);
            conversionResult = await this.pdfEngine.reorderPages(file.buffer, order);
          } else if (toolSlug === 'compress-pdf') {
            conversionResult = await this.pdfEngine.compressPdf(file.buffer);
          } else if (toolSlug === 'pdf-to-jpg' || toolSlug === 'pdf-to-png') {
            // Render first page or extract using sharp
            // Sharp can render PDF pages if built with poppler/libvips PDF support
            conversionResult = await this.imageEngine.processImage(
              file.buffer,
              toolSlug === 'pdf-to-jpg' ? 'jpg' : 'png',
              options
            );
          } else {
            throw new BadRequestException(`Unsupported PDF tool "${toolSlug}".`);
          }
        } else if (tool.category === 'document') {
          if (toolSlug === 'csv-to-xlsx') {
            conversionResult = await this.documentEngine.csvToXlsx(file.buffer, options);
          } else if (toolSlug === 'xlsx-to-csv') {
            conversionResult = await this.documentEngine.xlsxToCsv(file.buffer, options);
          } else if (toolSlug === 'txt-to-pdf') {
            conversionResult = await this.documentEngine.txtToPdf(file.buffer, options);
          } else if (toolSlug === 'html-to-pdf') {
            conversionResult = await this.documentEngine.htmlToPdf(file.buffer, options);
          } else if (toolSlug === 'docx-to-pdf') {
            conversionResult = await this.documentEngine.officeToPdf(
              file.buffer,
              valid.extension,
              this.storageService.getUploadsDirectory()
            );
          } else {
            throw new BadRequestException(`Unsupported document tool "${toolSlug}".`);
          }
        } else {
          throw new BadRequestException(`Invalid tool category for "${toolSlug}".`);
        }

        const convertedPath = this.storageService.getConvertedPath(jobId, conversionResult.outputExtension);
        await this.storageService.saveBuffer(convertedPath, conversionResult.buffer);

        jobState.status = 'completed';
        jobState.progress = 100;
        jobState.convertedFilePath = convertedPath;
        jobState.convertedFilename = `${baseName}.${conversionResult.outputExtension}`;
        jobState.convertedSize = conversionResult.buffer.length;
        jobState.convertedMimeType = conversionResult.mimeType;
        jobState.downloadUrl = `/api/v1/conversions/${jobId}/download`;
        jobState.completedAt = Date.now();
        jobState.metadata = conversionResult.metadata;

        results.push(this.getJob(jobId));
      } catch (err: any) {
        jobState.status = 'failed';
        jobState.progress = 0;
        jobState.error = err.message || 'Conversion failed.';
        results.push(this.getJob(jobId));
      }
    }

    return { batchId, jobs: results };
  }
}
