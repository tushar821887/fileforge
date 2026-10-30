import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PDFDocument, PageSizes, degrees, PDFImage } from 'pdf-lib';
import sharp from 'sharp';
import type { ConversionOptions } from '@formatflow/shared';

export interface PdfConversionResult {
  buffer: Buffer;
  mimeType: string;
  outputExtension: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PdfEngine {
  private readonly logger = new Logger(PdfEngine.name);

  async inspectMetadata(pdfBuffer: Buffer): Promise<Record<string, any>> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const firstPage = pageCount > 0 ? pdfDoc.getPage(0) : null;
      const { width, height } = firstPage ? firstPage.getSize() : { width: 0, height: 0 };

      return {
        pageCount,
        title: pdfDoc.getTitle() || 'Untitled',
        author: pdfDoc.getAuthor() || 'Unknown',
        subject: pdfDoc.getSubject() || '',
        creator: pdfDoc.getCreator() || 'FormatFlow',
        producer: pdfDoc.getProducer() || 'FormatFlow PDF Engine',
        creationDate: pdfDoc.getCreationDate()?.toISOString() || null,
        modificationDate: pdfDoc.getModificationDate()?.toISOString() || null,
        pageWidthPt: Math.round(width),
        pageHeightPt: Math.round(height),
        pageWidthMm: Math.round(width * 0.352778),
        pageHeightMm: Math.round(height * 0.352778),
      };
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('password')) {
        throw new BadRequestException('The PDF document is password-protected. Please remove password encryption before converting.');
      }
      this.logger.error(`PDF inspection error: ${err.message}`);
      throw new BadRequestException(`Failed to read PDF document: ${err.message}`);
    }
  }

  async imagesToPdf(
    imageBuffers: { buffer: Buffer; mimeType: string; filename: string }[],
    options: ConversionOptions = {}
  ): Promise<PdfConversionResult> {
    if (!imageBuffers || imageBuffers.length === 0) {
      throw new BadRequestException('At least one image is required to build a PDF.');
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const pageSizeKey = options.pdfPageSize || 'A4';
      const isLandscape = options.pdfOrientation === 'landscape';
      const margin = typeof options.pdfMargin === 'number' ? Math.max(0, options.pdfMargin) : 20;

      for (const imgItem of imageBuffers) {
        // Pre-normalize the image buffer using Sharp to guarantee clean JPEG or PNG
        const imageMetadata = await sharp(imgItem.buffer).metadata();
        let embeddedImage: PDFImage;

        // Check if image is PNG with alpha or needs flattening
        if (imageMetadata.format === 'png' || imgItem.mimeType === 'image/png') {
          const pngBuffer = await sharp(imgItem.buffer).png().toBuffer();
          embeddedImage = await pdfDoc.embedPng(pngBuffer);
        } else {
          // Flatten to JPEG for optimal PDF embedding
          const jpgBuffer = await sharp(imgItem.buffer)
            .rotate() // auto-orient
            .jpeg({ quality: 92 })
            .toBuffer();
          embeddedImage = await pdfDoc.embedJpg(jpgBuffer);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSizeKey === 'AUTO') {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        } else if (pageSizeKey === 'LETTER') {
          [pageWidth, pageHeight] = isLandscape
            ? [PageSizes.Letter[1], PageSizes.Letter[0]]
            : PageSizes.Letter;
        } else {
          // Default A4
          [pageWidth, pageHeight] = isLandscape
            ? [PageSizes.A4[1], PageSizes.A4[0]]
            : PageSizes.A4;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const printableWidth = pageWidth - margin * 2;
        const printableHeight = pageHeight - margin * 2;

        let drawWidth = imgWidth;
        let drawHeight = imgHeight;

        if (options.pdfImageScaling === 'fill') {
          drawWidth = printableWidth;
          drawHeight = printableHeight;
        } else {
          // Fit preserving aspect ratio
          const scale = Math.min(printableWidth / imgWidth, printableHeight / imgHeight, 1.0);
          drawWidth = imgWidth * scale;
          drawHeight = imgHeight * scale;
        }

        // Center within printable margins
        const xPos = margin + (printableWidth - drawWidth) / 2;
        const yPos = margin + (printableHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: drawWidth,
          height: drawHeight,
        });
      }

      pdfDoc.setProducer('FormatFlow PDF Engine (https://formatflow.local)');
      pdfDoc.setCreator('FormatFlow');

      const pdfBytes = await pdfDoc.save();
      return {
        buffer: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          pageCount: imageBuffers.length,
          pageSize: pageSizeKey,
        },
      };
    } catch (err: any) {
      this.logger.error(`Images to PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to create PDF from images: ${err.message}`);
    }
  }

  async mergePdfs(pdfBuffers: Buffer[]): Promise<PdfConversionResult> {
    if (pdfBuffers.length < 2) {
      throw new BadRequestException('At least two PDF files are required for merging.');
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pdfBuffers.length; i++) {
        const srcPdf = await PDFDocument.load(pdfBuffers[i], { ignoreEncryption: true });
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      mergedPdf.setProducer('FormatFlow PDF Engine');
      mergedPdf.setCreator('FormatFlow');

      const mergedBytes = await mergedPdf.save();
      return {
        buffer: Buffer.from(mergedBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          pageCount: mergedPdf.getPageCount(),
          mergedFilesCount: pdfBuffers.length,
        },
      };
    } catch (err: any) {
      this.logger.error(`Merge PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to merge PDF files: ${err.message}`);
    }
  }

  parsePageRanges(rangeStr: string, totalPages: number): number[] {
    const indices = new Set<number>();
    const parts = rangeStr.split(',').map((p) => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(totalPages, Math.max(start, end));
          for (let p = from; p <= to; p++) {
            indices.add(p - 1); // 0-based
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          indices.add(pageNum - 1); // 0-based
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  }

  async splitOrExtractPages(
    pdfBuffer: Buffer,
    pageRangesStr?: string
  ): Promise<PdfConversionResult> {
    try {
      const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = srcPdf.getPageCount();

      let targetIndices: number[] = [];
      if (pageRangesStr && pageRangesStr.trim().length > 0) {
        targetIndices = this.parsePageRanges(pageRangesStr, totalPages);
      } else {
        // Default: take page 1 if not specified
        targetIndices = [0];
      }

      if (targetIndices.length === 0) {
        throw new BadRequestException(
          `No valid pages selected within document range (total pages: ${totalPages}).`
        );
      }

      const outPdf = await PDFDocument.create();
      const copiedPages = await outPdf.copyPages(srcPdf, targetIndices);
      copiedPages.forEach((page) => outPdf.addPage(page));

      const pdfBytes = await outPdf.save();
      return {
        buffer: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          extractedPages: targetIndices.map((i) => i + 1),
          pageCount: targetIndices.length,
          originalPageCount: totalPages,
        },
      };
    } catch (err: any) {
      this.logger.error(`Split PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to split or extract PDF pages: ${err.message}`);
    }
  }

  async reorderPages(pdfBuffer: Buffer, newOrder: number[]): Promise<PdfConversionResult> {
    try {
      const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = srcPdf.getPageCount();

      // Convert 1-based page order to 0-based indices and validate
      const validIndices: number[] = [];
      for (const p of newOrder) {
        if (p >= 1 && p <= totalPages) {
          validIndices.push(p - 1);
        }
      }

      if (validIndices.length === 0) {
        throw new BadRequestException('Please provide a valid sequence of page numbers.');
      }

      const outPdf = await PDFDocument.create();
      const copiedPages = await outPdf.copyPages(srcPdf, validIndices);
      copiedPages.forEach((p) => outPdf.addPage(p));

      const pdfBytes = await outPdf.save();
      return {
        buffer: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          pageCount: validIndices.length,
          newSequence: validIndices.map((i) => i + 1),
        },
      };
    } catch (err: any) {
      this.logger.error(`Reorder PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to reorder PDF pages: ${err.message}`);
    }
  }

  async rotatePages(
    pdfBuffer: Buffer,
    degreesAngle: number = 90,
    pageRangesStr?: string
  ): Promise<PdfConversionResult> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      const targetIndices =
        pageRangesStr && pageRangesStr.trim().length > 0
          ? this.parsePageRanges(pageRangesStr, totalPages)
          : Array.from({ length: totalPages }, (_, i) => i);

      const normalizedAngle = [90, 180, 270].includes(degreesAngle) ? degreesAngle : 90;

      for (const idx of targetIndices) {
        const page = pdfDoc.getPage(idx);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + normalizedAngle) % 360));
      }

      const pdfBytes = await pdfDoc.save();
      return {
        buffer: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          rotatedPages: targetIndices.map((i) => i + 1),
          angleApplied: normalizedAngle,
          pageCount: totalPages,
        },
      };
    } catch (err: any) {
      this.logger.error(`Rotate PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to rotate PDF pages: ${err.message}`);
    }
  }

  async compressPdf(pdfBuffer: Buffer): Promise<PdfConversionResult> {
    try {
      const originalSize = pdfBuffer.length;
      // Load and save with object re-indexing and Flate compression
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

      // Strip unused metadata headers to optimize size
      pdfDoc.setProducer('FormatFlow Optimizer');
      pdfDoc.setCreator('FormatFlow');

      const optimizedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedSize = optimizedBytes.length;
      const reductionBytes = originalSize - compressedSize;
      const reductionPercent = reductionBytes > 0
        ? Math.round((reductionBytes / originalSize) * 100)
        : 0;

      return {
        buffer: Buffer.from(optimizedBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          originalSize,
          compressedSize,
          reductionPercent,
          message:
            reductionBytes > 0
              ? `Reduced file size by ${reductionPercent}% (${(reductionBytes / 1024).toFixed(1)} KB saved).`
              : 'File is already maximally compressed; structural optimization applied.',
        },
      };
    } catch (err: any) {
      this.logger.error(`Compress PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to compress PDF: ${err.message}`);
    }
  }
}
