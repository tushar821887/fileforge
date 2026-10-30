import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { FileValidatorService } from './file-validator.service.js';
import type { UploadedFile } from '../../types/file.types.js';

describe('FileValidatorService', () => {
  let service: FileValidatorService;

  beforeEach(() => {
    service = new FileValidatorService();
  });

  it('should sanitize dangerous filenames and strip directory traversal sequences', () => {
    const raw = '../../../etc/passwd\0.jpg';
    const sanitized = service.sanitizeFilename(raw);
    expect(sanitized).not.toContain('../');
    expect(sanitized).not.toContain('\0');
    expect(sanitized.endsWith('.jpg')).toBe(true);
  });

  it('should reject empty files', async () => {
    const emptyFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 0,
      buffer: Buffer.alloc(0),
    };

    await expect(service.validateUploadedFile(emptyFile)).rejects.toThrow(BadRequestException);
  });

  it('should reject files exceeding maximum size limit', async () => {
    const oversizedFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'huge.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 60 * 1024 * 1024,
      buffer: Buffer.alloc(10), // fake size check
    };

    await expect(
      service.validateUploadedFile(oversizedFile, ['.jpg'], 50)
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject unsupported file extensions', async () => {
    const invalidFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'malware.exe',
      encoding: '7bit',
      mimetype: 'application/x-msdownload',
      size: 100,
      buffer: Buffer.from('MZ...'),
    };

    await expect(service.validateUploadedFile(invalidFile)).rejects.toThrow(BadRequestException);
  });

  it('should reject files when extension does not match tool requirements', async () => {
    const validFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'photo.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 100,
      buffer: Buffer.from('PNG...'),
    };

    // Tool only expects JPG
    await expect(
      service.validateUploadedFile(validFile, ['.jpg', '.jpeg'])
    ).rejects.toThrow(BadRequestException);
  });

  it('should detect binary null bytes inside plain text files', async () => {
    const maliciousTextFile: UploadedFile = {
      fieldname: 'files',
      originalname: 'fake.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 20,
      buffer: Buffer.from([0, 0, 0, 65, 66, 67]),
    };

    await expect(service.validateUploadedFile(maliciousTextFile)).rejects.toThrow(BadRequestException);
  });
});
