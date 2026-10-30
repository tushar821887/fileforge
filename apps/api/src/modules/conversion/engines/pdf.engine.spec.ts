import { describe, it, expect, beforeEach } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { PdfEngine } from './pdf.engine.js';

describe('PdfEngine Real PDF Operations', () => {
  let engine: PdfEngine;
  let samplePdfBuffer: Buffer;
  let sampleImageBuffer: Buffer;

  beforeEach(async () => {
    engine = new PdfEngine();

    // Create a valid 2-page PDF document
    const doc = await PDFDocument.create();
    doc.setTitle('FormatFlow Test Document');
    doc.setAuthor('Antigravity Test');
    doc.addPage([400, 600]);
    doc.addPage([400, 600]);
    samplePdfBuffer = Buffer.from(await doc.save());

    // Create a sample image
    sampleImageBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 50, g: 150, b: 250 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  it('should inspect PDF page count and document metadata', async () => {
    const meta = await engine.inspectMetadata(samplePdfBuffer);
    expect(meta.pageCount).toBe(2);
    expect(meta.title).toBe('FormatFlow Test Document');
    expect(meta.author).toBe('Antigravity Test');
    expect(meta.pageWidthPt).toBe(400);
    expect(meta.pageHeightPt).toBe(600);
  });

  it('should convert multiple images into a multi-page PDF', async () => {
    const imageItems = [
      { buffer: sampleImageBuffer, mimeType: 'image/jpeg', filename: 'page1.jpg' },
      { buffer: sampleImageBuffer, mimeType: 'image/jpeg', filename: 'page2.jpg' },
    ];

    const result = await engine.imagesToPdf(imageItems, {
      pdfPageSize: 'A4',
      pdfOrientation: 'portrait',
      pdfMargin: 20,
    });

    expect(result.outputExtension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');

    // Verify output is a real PDF with 2 pages
    const verifiedDoc = await PDFDocument.load(result.buffer);
    expect(verifiedDoc.getPageCount()).toBe(2);
  });

  it('should merge two separate PDF documents into one unified PDF', async () => {
    const result = await engine.mergePdfs([samplePdfBuffer, samplePdfBuffer]);
    expect(result.outputExtension).toBe('pdf');

    const verifiedDoc = await PDFDocument.load(result.buffer);
    // 2 pages + 2 pages = 4 pages
    expect(verifiedDoc.getPageCount()).toBe(4);
  });

  it('should extract specific page ranges from a PDF', async () => {
    // Extract only page 2 from 2-page PDF
    const result = await engine.splitOrExtractPages(samplePdfBuffer, '2');
    expect(result.outputExtension).toBe('pdf');

    const verifiedDoc = await PDFDocument.load(result.buffer);
    expect(verifiedDoc.getPageCount()).toBe(1);
  });

  it('should rotate PDF pages by 90 degrees', async () => {
    const result = await engine.rotatePages(samplePdfBuffer, 90, '1');
    const verifiedDoc = await PDFDocument.load(result.buffer);
    const p1 = verifiedDoc.getPage(0);
    expect(p1.getRotation().angle).toBe(90);
  });

  it('should compress and structurally optimize PDF files', async () => {
    const result = await engine.compressPdf(samplePdfBuffer);
    expect(result.outputExtension).toBe('pdf');
    expect(result.buffer.length).toBeGreaterThan(0);
    expect(result.metadata?.compressedSize).toBeDefined();

    const verifiedDoc = await PDFDocument.load(result.buffer);
    expect(verifiedDoc.getPageCount()).toBe(2);
  });
});
