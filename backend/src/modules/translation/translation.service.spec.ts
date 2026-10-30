import { describe, it, expect, beforeEach } from 'vitest';
import { TranslationService } from './translation.service.js';
import { TranslationEngine } from './translation.engine.js';
import { StorageService } from '../storage/storage.service.js';
import { ConfigService } from '@nestjs/config';
import type { UploadedFile } from '../../types/file.types.js';
import JSZip from 'jszip';
import fs from 'fs';

describe('TranslationService End-to-End', () => {
  let service: TranslationService;
  let engine: TranslationEngine;
  let storageService: StorageService;

  beforeEach(async () => {
    const configService = {
      get: (key: string) => {
        if (key === 'fileRetentionMinutes') return 60;
        return undefined;
      },
    } as unknown as ConfigService;

    storageService = new StorageService(configService);
    await storageService.onModuleInit();

    engine = new TranslationEngine();
    service = new TranslationService(storageService, engine, configService);
  });

  it('translates presentation into multiple languages and creates ZIP review pack without archiver errors', async () => {
    const sampleBuffer = await engine.generateSamplePptx();
    const mockFile: UploadedFile = {
      fieldname: 'file',
      originalname: 'Q2_Investor_Update.pptx',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      buffer: sampleBuffer,
      size: sampleBuffer.length,
    };

    const result = await service.executeTranslation(mockFile, ['zh-CN', 'fr-FR', 'de-DE']);

    expect(result.status).toBe('completed');
    expect(result.progress).toBe(100);
    expect(result.slideCount).toBe(24);
    expect(result.translatedFiles).toHaveLength(3);
    expect(result.zipDownloadUrl).toContain('/api/v1/translate/');

    // Verify Review Pack ZIP was actually created and is a valid ZIP
    const zipInfo = service.getReviewPackZipInfo(result.jobId);
    expect(fs.existsSync(zipInfo.filePath)).toBe(true);

    const zipBuffer = await fs.promises.readFile(zipInfo.filePath);
    const zip = await JSZip.loadAsync(zipBuffer);
    const filesInZip = Object.keys(zip.files);
    expect(filesInZip).toContain('Q2_Investor_Update_zh-CN.pptx');
    expect(filesInZip).toContain('Q2_Investor_Update_fr-FR.pptx');
    expect(filesInZip).toContain('Q2_Investor_Update_de-DE.pptx');

    // Clean up
    await service.deleteJob(result.jobId);
  }, 60000);
});
