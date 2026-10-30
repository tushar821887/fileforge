import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ConversionService } from './conversion.service.js';
import { StorageService } from '../storage/storage.service.js';
import { FileValidatorService } from '../validator/file-validator.service.js';
import { ImageEngine } from './engines/image.engine.js';
import { PdfEngine } from './engines/pdf.engine.js';
import { DocumentEngine } from './engines/document.engine.js';
import { ConfigService } from '@nestjs/config';
import type { UploadedFile } from '../../types/file.types.js';

describe('ConversionService End-to-End Orchestration', () => {
  let service: ConversionService;
  let storage: StorageService;
  let samplePngBuffer: Buffer;

  beforeEach(async () => {
    const configService = {
      get: (key: string) => {
        if (key === 'fileRetentionMinutes') return 60;
        if (key === 'storagePath') return path.join(process.cwd(), 'test-storage');
        return undefined;
      },
    } as any;

    storage = new StorageService(configService);
    await storage.onModuleInit();

    const validator = new FileValidatorService();
    const imageEngine = new ImageEngine();
    const pdfEngine = new PdfEngine();
    const docEngine = new DocumentEngine(configService);

    service = new ConversionService(
      storage,
      validator,
      imageEngine,
      pdfEngine,
      docEngine,
      configService
    );

    samplePngBuffer = await sharp({
      create: {
        width: 80,
        height: 80,
        channels: 4,
        background: { r: 10, g: 200, b: 100, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  afterEach(async () => {
    // Clean up test storage directory
    const testDir = path.join(process.cwd(), 'test-storage');
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  it('should process a valid image conversion job and allow downloading the result', async () => {
    const uploadedFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'graphic.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: samplePngBuffer.length,
      buffer: samplePngBuffer,
    };

    const batch = await service.executeConversion('png-to-jpg', [uploadedFile], {
      quality: 85,
      backgroundColor: '#ffffff',
    });

    expect(batch.jobs.length).toBe(1);
    const job = batch.jobs[0];
    expect(job.status).toBe('completed');
    expect(job.progress).toBe(100);
    expect(job.convertedFilename).toBe('graphic.jpg');
    expect(job.downloadUrl).toContain(job.jobId);

    // Retrieve converted file info
    const fileInfo = service.getConvertedFileInfo(job.jobId);
    expect(fs.existsSync(fileInfo.filePath)).toBe(true);

    // Test immediate job deletion
    await service.deleteJob(job.jobId);
    expect(fs.existsSync(fileInfo.filePath)).toBe(false);
  });
});
