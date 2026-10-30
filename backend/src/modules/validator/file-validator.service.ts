import { Injectable, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import type { UploadedFile } from '../../types/file.types.js';

export interface ValidatedFile {
  originalName: string;
  sanitizedName: string;
  extension: string;
  detectedMime: string;
  size: number;
}

@Injectable()
export class FileValidatorService {
  private readonly allowedExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.bmp', '.gif', '.svg',
    '.pdf',
    '.csv', '.xlsx', '.xls', '.txt', '.html', '.htm', '.docx', '.doc'
  ]);

  sanitizeFilename(rawFilename: string): string {
    const basename = path.basename(rawFilename);
    // Remove dangerous characters, path separators, null bytes, non-ASCII controls
    const sanitized = basename
      .replace(/[\0\r\n\t]/g, '')
      .replace(/[<>:"/\\|?*]/g, '_')
      .trim();

    return sanitized || 'file';
  }

  async validateUploadedFile(
    file: UploadedFile,
    expectedExtensions?: string[],
    maxSizeMb: number = 50
  ): Promise<ValidatedFile> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty or missing.');
    }

    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum allowed limit of ${maxSizeMb}MB.`);
    }

    const sanitizedName = this.sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedName).toLowerCase();

    if (!this.allowedExtensions.has(ext)) {
      throw new BadRequestException(`File extension "${ext}" is not supported.`);
    }

    if (expectedExtensions && expectedExtensions.length > 0) {
      const normalizedExpected = expectedExtensions.map((e) => (e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`));
      if (!normalizedExpected.includes(ext)) {
        throw new BadRequestException(
          `This tool accepts ${normalizedExpected.join(', ')}. Received "${ext}".`
        );
      }
    }

    // Inspect magic bytes for binary files (skip plain text formats like .txt, .csv, .svg, .html which are text)
    let detectedMime = file.mimetype;
    const textExtensions = new Set(['.txt', '.csv', '.svg', '.html', '.htm']);

    if (!textExtensions.has(ext)) {
      const signature = await fileTypeFromBuffer(file.buffer);
      if (signature) {
        detectedMime = signature.mime;

        // Verify that signature matches claimed extension category
        const isImageClaim = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.bmp', '.gif'].includes(ext);
        const isPdfClaim = ext === '.pdf';
        const isOfficeClaim = ['.xlsx', '.xls', '.docx', '.doc'].includes(ext);

        if (isImageClaim && !signature.mime.startsWith('image/')) {
          throw new BadRequestException(`File signature mismatch: File claims to be an image but contains ${signature.mime}`);
        }
        if (isPdfClaim && signature.mime !== 'application/pdf') {
          throw new BadRequestException(`File signature mismatch: File is not a valid PDF document.`);
        }
        if (isOfficeClaim && !signature.mime.includes('zip') && !signature.mime.includes('officedocument') && !signature.mime.includes('ms-excel') && !signature.mime.includes('msword')) {
          throw new BadRequestException(`File signature mismatch: File is not a valid Office document.`);
        }
      }
    } else {
      // Validate text files do not contain suspicious binary executables
      if (ext === '.txt' || ext === '.csv') {
        const sample = file.buffer.subarray(0, Math.min(1024, file.buffer.length));
        let nullByteCount = 0;
        for (let i = 0; i < sample.length; i++) {
          if (sample[i] === 0) nullByteCount++;
        }
        if (nullByteCount > 2) {
          throw new BadRequestException('Text file contains binary data or invalid characters.');
        }
      }
    }

    return {
      originalName: file.originalname,
      sanitizedName,
      extension: ext,
      detectedMime,
      size: file.size,
    };
  }
}
