import { describe, it, expect, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import { DocumentEngine } from './document.engine.js';
import { ConfigService } from '@nestjs/config';

describe('DocumentEngine Real Conversions', () => {
  let engine: DocumentEngine;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: (key: string) => undefined,
    } as any;
    engine = new DocumentEngine(mockConfigService);
  });

  it('should convert CSV text to an Excel XLSX workbook', async () => {
    const csvContent = 'Name,Age,Department\nAlice,29,Engineering\nBob,34,Design\nCharlie,42,Management';
    const csvBuffer = Buffer.from(csvContent, 'utf-8');

    const result = await engine.csvToXlsx(csvBuffer, { sheetName: 'Employees' });
    expect(result.outputExtension).toBe('xlsx');
    expect(result.mimeType).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // Verify converted XLSX is a real Excel workbook with expected cells
    const workbook = XLSX.read(result.buffer, { type: 'buffer' });
    expect(workbook.SheetNames).toContain('Employees');
    const sheet = workbook.Sheets['Employees'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    expect(rows.length).toBe(3);
    expect(rows[0].Name).toBe('Alice');
    expect(rows[0].Department).toBe('Engineering');
  });

  it('should convert Excel XLSX workbook to clean CSV format', async () => {
    // Generate valid XLSX buffer
    const ws = XLSX.utils.aoa_to_sheet([
      ['Product', 'Price', 'Qty'],
      ['Laptop', 1200, 5],
      ['Mouse', 25, 20],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const result = await engine.xlsxToCsv(xlsxBuffer, { csvDelimiter: ',' });
    expect(result.outputExtension).toBe('csv');
    const csvString = result.buffer.toString('utf-8');
    expect(csvString).toContain('Laptop,1200,5');
    expect(csvString).toContain('Mouse,25,20');
  });

  it('should convert plain text (TXT) into a formatted, paginated PDF', async () => {
    const textContent =
      'FormatFlow Plain Text Document\n\n' +
      'This is line 1 of the test file.\n' +
      'This is line 2 of the test file with special characters: 100% free & open.\n' +
      'Paragraph content for verifying automated text wrapping and font metrics.';

    const txtBuffer = Buffer.from(textContent, 'utf-8');
    const result = await engine.txtToPdf(txtBuffer, { pdfPageSize: 'A4' });

    expect(result.outputExtension).toBe('pdf');
    expect(result.mimeType).toBe('application/pdf');

    // Verify resulting PDF document is readable
    const pdfDoc = await PDFDocument.load(result.buffer);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('should convert HTML content into a clean PDF document', async () => {
    const htmlContent = '<h1>FormatFlow Release Notes</h1><p>Feature 1: Image conversions.<br/>Feature 2: PDF tools.</p>';
    const htmlBuffer = Buffer.from(htmlContent, 'utf-8');

    const result = await engine.htmlToPdf(htmlBuffer);
    expect(result.outputExtension).toBe('pdf');
    const pdfDoc = await PDFDocument.load(result.buffer);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(1);
  });
});
