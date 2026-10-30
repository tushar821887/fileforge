import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import * as archiverNamespace from 'archiver';
const archiver: any = (archiverNamespace as any).default || archiverNamespace;
import {
  SUPPORTED_LANGUAGES,
  type TranslationJobResult,
  type TranslatedFileItem,
  type SupportedLanguage,
} from '@formatflow/shared';
import type { UploadedFile } from '../../types/file.types.js';
import { StorageService } from '../storage/storage.service.js';
import { TranslationEngine } from './translation.engine.js';
import { ConfigService } from '@nestjs/config';

interface InternalTranslatedFile extends TranslatedFileItem {
  filePath: string;
}

interface InternalTranslationJobState {
  jobId: string;
  originalFilename: string;
  originalSize: number;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  targetLanguages: string[];
  translatedFiles: InternalTranslatedFile[];
  zipFilePath?: string;
  zipFilename?: string;
  zipDownloadUrl?: string;
  slideCount?: number;
  pageCount?: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
  expiresAt: number;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly jobs = new Map<string, InternalTranslationJobState>();
  private readonly retentionMinutes: number;

  constructor(
    private readonly storageService: StorageService,
    private readonly translationEngine: TranslationEngine,
    private readonly configService: ConfigService
  ) {
    this.retentionMinutes = this.configService.get<number>('fileRetentionMinutes') || 60;
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }

  getJob(jobId: string): TranslationJobResult {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Translation job "${jobId}" not found or expired.`);
    }

    return {
      jobId: job.jobId,
      originalFilename: job.originalFilename,
      originalSize: job.originalSize,
      format: job.format,
      status: job.status,
      progress: job.progress,
      targetLanguages: job.targetLanguages,
      translatedFiles: job.translatedFiles.map((f) => ({
        languageCode: f.languageCode,
        languageName: f.languageName,
        filename: f.filename,
        size: f.size,
        downloadUrl: f.downloadUrl,
      })),
      zipDownloadUrl: job.zipDownloadUrl,
      slideCount: job.slideCount,
      pageCount: job.pageCount,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      expiresAt: job.expiresAt,
    };
  }

  getTranslatedFileInfo(jobId: string, langCode: string): { filePath: string; filename: string; mimeType: string } {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Translation job "${jobId}" not found or expired.`);
    }

    const item = job.translatedFiles.find(
      (f) => f.languageCode.toLowerCase() === langCode.toLowerCase()
    );
    if (!item || !fs.existsSync(item.filePath)) {
      throw new NotFoundException(`Translated file for language "${langCode}" not found.`);
    }

    return {
      filePath: item.filePath,
      filename: item.filename,
      mimeType: this.getMimeTypeForExt(job.format),
    };
  }

  getReviewPackZipInfo(jobId: string): { filePath: string; filename: string; mimeType: string } {
    const job = this.jobs.get(jobId);
    if (!job || !job.zipFilePath || !fs.existsSync(job.zipFilePath)) {
      throw new NotFoundException(`Review pack ZIP for job "${jobId}" is not available.`);
    }

    return {
      filePath: job.zipFilePath,
      filename: job.zipFilename || `Review_Pack_${job.originalFilename}.zip`,
      mimeType: 'application/zip',
    };
  }

  async executeTranslation(file: UploadedFile, targetLanguageCodes: string[]): Promise<TranslationJobResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('A valid source document must be provided.');
    }

    if (!targetLanguageCodes || targetLanguageCodes.length === 0) {
      throw new BadRequestException('At least one target language must be selected.');
    }

    // Filter valid language codes
    const validCodes = targetLanguageCodes.filter((code) =>
      SUPPORTED_LANGUAGES.some((lang) => lang.code.toLowerCase() === code.toLowerCase())
    );

    if (validCodes.length === 0) {
      throw new BadRequestException(
        `None of the provided language codes are supported. Supported: ${SUPPORTED_LANGUAGES.map((l) => l.code).join(', ')}`
      );
    }

    const jobId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const now = Date.now();
    const expiresAt = now + this.retentionMinutes * 60 * 1000;

    const jobState: InternalTranslationJobState = {
      jobId,
      originalFilename: file.originalname,
      originalSize: file.size,
      format: ext,
      status: 'processing',
      progress: 10,
      targetLanguages: validCodes,
      translatedFiles: [],
      createdAt: now,
      expiresAt,
    };
    this.jobs.set(jobId, jobState);

    try {
      const convertedDir = this.storageService.getConvertedDirectory();
      let totalSlides: number | undefined;
      let totalPages: number | undefined;

      const totalLangs = validCodes.length;

      for (let i = 0; i < totalLangs; i++) {
        const langCode = validCodes[i];
        const langDef = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === langCode.toLowerCase())!;

        let outBuffer: Buffer;
        let slideCount: number | undefined;
        let pageCount: number | undefined;

        if (ext === 'pptx') {
          const res = await this.translationEngine.translatePptx(file.buffer, langDef.code);
          outBuffer = res.buffer;
          slideCount = res.slideCount;
          totalSlides = slideCount;
        } else if (ext === 'docx') {
          const res = await this.translationEngine.translateDocx(file.buffer, langDef.code);
          outBuffer = res.buffer;
          pageCount = res.pageCount;
          totalPages = pageCount;
        } else if (ext === 'txt') {
          const res = await this.translationEngine.translateTxt(file.buffer, langDef.code);
          outBuffer = res.buffer;
          totalPages = res.pageCount;
        } else if (ext === 'csv') {
          const res = await this.translationEngine.translateCsv(file.buffer, langDef.code);
          outBuffer = res.buffer;
        } else if (ext === 'html' || ext === 'htm') {
          const res = await this.translationEngine.translateHtml(file.buffer, langDef.code);
          outBuffer = res.buffer;
        } else {
          throw new BadRequestException(
            `Unsupported document format ".${ext}". FormatFlow Studio supports PPTX, DOCX, TXT, CSV, and HTML.`
          );
        }

        const outFilename = `${baseName}_${langDef.code}.${ext}`;
        const outFilePath = path.join(convertedDir, `${jobId}_${langDef.code}_${outFilename}`);
        await this.storageService.saveBuffer(outFilePath, outBuffer);

        jobState.translatedFiles.push({
          languageCode: langDef.code,
          languageName: langDef.name,
          filename: outFilename,
          size: outBuffer.length,
          downloadUrl: `/api/v1/translate/${jobId}/download/${langDef.code}`,
          filePath: outFilePath,
        });

        // Update progress dynamically
        jobState.progress = Math.min(90, Math.round(15 + ((i + 1) / totalLangs) * 65));
      }

      jobState.slideCount = totalSlides;
      jobState.pageCount = totalPages;

      // Create ZIP Review Pack
      const zipFilename = `Review_Pack_${baseName}.zip`;
      const zipFilePath = path.join(convertedDir, `${jobId}_Review_Pack.zip`);
      await this.createReviewPackZip(jobState.translatedFiles, zipFilePath);

      jobState.zipFilePath = zipFilePath;
      jobState.zipFilename = zipFilename;
      jobState.zipDownloadUrl = `/api/v1/translate/${jobId}/download-all`;
      jobState.status = 'completed';
      jobState.progress = 100;
      jobState.completedAt = Date.now();

      return this.getJob(jobId);
    } catch (err: any) {
      this.logger.error(`Translation failed for job ${jobId}: ${err.message}`, err.stack);
      jobState.status = 'failed';
      jobState.error = err.message || 'Translation failed';
      throw err;
    }
  }

  private async createReviewPackZip(files: InternalTranslatedFile[], destPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(destPath);
      const archive = archiver('zip', { zlib: { level: 6 } });

      output.on('close', () => resolve());
      archive.on('error', (err: any) => reject(err));

      archive.pipe(output);

      for (const item of files) {
        archive.file(item.filePath, { name: item.filename });
      }

      archive.finalize();
    });
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job) {
      await this.storageService.deleteJobFiles(jobId);
      this.jobs.delete(jobId);
      return true;
    }
    return false;
  }

  private getMimeTypeForExt(ext: string): string {
    switch (ext.toLowerCase()) {
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain; charset=utf-8';
      case 'csv':
        return 'text/csv; charset=utf-8';
      case 'html':
      case 'htm':
        return 'text/html; charset=utf-8';
      default:
        return 'application/octet-stream';
    }
  }
}
