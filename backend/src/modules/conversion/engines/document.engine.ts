import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { ConversionOptions } from '@formatflow/shared';
import { ConfigService } from '@nestjs/config';

export interface DocumentConversionResult {
  buffer: Buffer;
  mimeType: string;
  outputExtension: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class DocumentEngine {
  private readonly logger = new Logger(DocumentEngine.name);
  private sofficePath?: string;

  constructor(private readonly configService: ConfigService) {
    this.sofficePath = this.configService.get<string>('sofficePath');
  }

  isLibreOfficeAvailable(): boolean {
    return !!this.sofficePath;
  }

  // 1. CSV to XLSX
  async csvToXlsx(
    csvBuffer: Buffer,
    options: ConversionOptions = {}
  ): Promise<DocumentConversionResult> {
    try {
      const csvContent = csvBuffer.toString('utf-8');
      const workbook = XLSX.read(csvContent, {
        type: 'string',
        raw: false,
        cellDates: true,
      });

      const oldSheetName = workbook.SheetNames[0];
      const sheetName = options.sheetName || 'Sheet1';
      if (oldSheetName && oldSheetName !== sheetName) {
        workbook.SheetNames[0] = sheetName;
        workbook.Sheets[sheetName] = workbook.Sheets[oldSheetName];
        delete workbook.Sheets[oldSheetName];
      }

      const xlsxBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'buffer',
        compression: true,
      });

      return {
        buffer: Buffer.from(xlsxBuffer),
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        outputExtension: 'xlsx',
        metadata: {
          sheetCount: workbook.SheetNames.length,
          sheetNames: workbook.SheetNames,
        },
      };
    } catch (err: any) {
      this.logger.error(`CSV to XLSX error: ${err.message}`);
      throw new BadRequestException(`Failed to convert CSV to Excel: ${err.message}`);
    }
  }

  // 2. XLSX to CSV
  async xlsxToCsv(
    xlsxBuffer: Buffer,
    options: ConversionOptions = {}
  ): Promise<DocumentConversionResult> {
    try {
      const workbook = XLSX.read(xlsxBuffer, {
        type: 'buffer',
        cellDates: true,
      });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException('The Excel file contains no worksheets.');
      }

      const targetSheetName = options.sheetName && workbook.Sheets[options.sheetName]
        ? options.sheetName
        : workbook.SheetNames[0];

      const worksheet = workbook.Sheets[targetSheetName];
      const delimiter = options.csvDelimiter || ',';

      const csvString = XLSX.utils.sheet_to_csv(worksheet, {
        FS: delimiter,
        blankrows: false,
      });

      return {
        buffer: Buffer.from(csvString, 'utf-8'),
        mimeType: 'text/csv; charset=utf-8',
        outputExtension: 'csv',
        metadata: {
          extractedSheet: targetSheetName,
          availableSheets: workbook.SheetNames,
          delimiter,
        },
      };
    } catch (err: any) {
      this.logger.error(`XLSX to CSV error: ${err.message}`);
      throw new BadRequestException(`Failed to convert Excel to CSV: ${err.message}`);
    }
  }

  // 3. TXT to PDF
  async txtToPdf(
    txtBuffer: Buffer,
    options: ConversionOptions = {}
  ): Promise<DocumentConversionResult> {
    try {
      const text = txtBuffer.toString('utf-8');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageSizeKey = options.pdfPageSize || 'A4';
      const [pageWidth, pageHeight] = pageSizeKey === 'LETTER' ? PageSizes.Letter : PageSizes.A4;

      const margin = typeof options.pdfMargin === 'number' ? Math.max(20, options.pdfMargin) : 40;
      const fontSize = 10;
      const lineHeight = fontSize * 1.4;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const linesPerPage = Math.floor(usableHeight / lineHeight);

      // Wrap text lines to fit page width
      const wrappedLines: string[] = [];
      const rawLines = text.split(/\r?\n/);

      for (const line of rawLines) {
        if (!line.trim()) {
          wrappedLines.push('');
          continue;
        }

        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (textWidth <= usableWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        }

        if (currentLine) {
          wrappedLines.push(currentLine);
        }
      }

      // Paginate
      const totalPages = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

      for (let p = 0; p < totalPages; p++) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const startLineIdx = p * linesPerPage;
        const pageLines = wrappedLines.slice(startLineIdx, startLineIdx + linesPerPage);

        // Header
        page.drawText('FormatFlow Document Reader', {
          x: margin,
          y: pageHeight - margin + 15,
          size: 8,
          font: fontBold,
          color: rgb(0.5, 0.5, 0.5),
        });

        // Content
        let currentY = pageHeight - margin;
        for (const line of pageLines) {
          if (line) {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
          currentY -= lineHeight;
        }

        // Footer / Page Number
        const pageLabel = `Page ${p + 1} of ${totalPages}`;
        page.drawText(pageLabel, {
          x: pageWidth - margin - font.widthOfTextAtSize(pageLabel, 8),
          y: margin - 20,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      pdfDoc.setProducer('FormatFlow Text to PDF Engine');
      const pdfBytes = await pdfDoc.save();

      return {
        buffer: Buffer.from(pdfBytes),
        mimeType: 'application/pdf',
        outputExtension: 'pdf',
        metadata: {
          pageCount: totalPages,
          lineCount: wrappedLines.length,
        },
      };
    } catch (err: any) {
      this.logger.error(`TXT to PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to convert Text to PDF: ${err.message}`);
    }
  }

  // 4. HTML to PDF
  async htmlToPdf(
    htmlBuffer: Buffer,
    options: ConversionOptions = {}
  ): Promise<DocumentConversionResult> {
    try {
      const rawHtml = htmlBuffer.toString('utf-8');
      // Clean HTML: strip script tags, head tags, etc.
      const sanitized = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

      const textBuffer = Buffer.from(sanitized, 'utf-8');
      return await this.txtToPdf(textBuffer, options);
    } catch (err: any) {
      this.logger.error(`HTML to PDF error: ${err.message}`);
      throw new BadRequestException(`Failed to convert HTML to PDF: ${err.message}`);
    }
  }

  // 5. Office Documents to PDF (DOCX, PPTX, etc.)
  async officeToPdf(
    inputBuffer: Buffer,
    inputExtension: string,
    tempWorkingDir: string
  ): Promise<DocumentConversionResult> {
    const soffice = this.sofficePath || 'soffice';

    // If LibreOffice is installed, execute headless conversion
    const inputTempFile = path.join(tempWorkingDir, `doc_in_${Date.now()}${inputExtension}`);
    await fs.promises.writeFile(inputTempFile, inputBuffer);

    return new Promise<DocumentConversionResult>((resolve, reject) => {
      const child = spawn(
        soffice,
        ['--headless', '--convert-to', 'pdf', '--outdir', tempWorkingDir, inputTempFile],
        { timeout: 30000 }
      );

      let stderr = '';
      child.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      child.on('close', async (code) => {
        try {
          if (fs.existsSync(inputTempFile)) {
            await fs.promises.unlink(inputTempFile);
          }

          const expectedPdf = inputTempFile.replace(/\.[^.]+$/, '.pdf');
          if (code === 0 && fs.existsSync(expectedPdf)) {
            const pdfData = await fs.promises.readFile(expectedPdf);
            await fs.promises.unlink(expectedPdf);
            resolve({
              buffer: pdfData,
              mimeType: 'application/pdf',
              outputExtension: 'pdf',
              metadata: { engine: 'LibreOffice Headless' },
            });
          } else {
            // Fallback: If LibreOffice is not installed on this host, provide clear message
            this.logger.warn(`LibreOffice conversion unavailable: ${stderr || code}`);
            reject(
              new BadRequestException(
                'Headless LibreOffice is not configured on this host. Run inside the provided Docker container or configure SOFFICE_PATH to enable DOCX/PPTX conversions.'
              )
            );
          }
        } catch (cleanupErr: any) {
          reject(cleanupErr);
        }
      });

      child.on('error', async () => {
        if (fs.existsSync(inputTempFile)) {
          await fs.promises.unlink(inputTempFile);
        }
        reject(
          new BadRequestException(
            'Headless LibreOffice is not installed or not found in system PATH. Please use the Docker container or install LibreOffice for DOCX conversion.'
          )
        );
      });
    });
  }
}
