import { describe, it, expect, beforeEach } from 'vitest';
import { TranslationEngine } from './translation.engine.js';
import JSZip from 'jszip';

describe('TranslationEngine', () => {
  let engine: TranslationEngine;

  beforeEach(() => {
    engine = new TranslationEngine();
  });

  it('translates known presentation terms into Chinese and German', () => {
    expect(engine.translateText('Executive Summary', 'zh-CN')).toBe('执行摘要');
    expect(engine.translateText('Executive Summary', 'de-DE')).toBe('Zusammenfassung für Führungskräfte');
    expect(engine.translateText('Investor Update', 'es-ES')).toBe('Actualización para inversores');
    expect(engine.translateText('Revenue', 'fr-FR')).toBe('Revenus');
  });

  it('translates PPTX OpenXML and preserves XML structure and counts slides', async () => {
    const zip = new JSZip();
    // Create PPTX structure
    zip.file(
      'ppt/slides/slide1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p><a:r><a:t>Executive Summary</a:t></a:r></a:p>
                <a:p><a:r><a:t>Revenue growth targets</a:t></a:r></a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>`
    );
    zip.file(
      'ppt/slides/slide2.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Thank you</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
      </p:sld>`
    );

    const pptxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const result = await engine.translatePptx(pptxBuffer, 'zh-CN');

    expect(result.slideCount).toBe(2);
    expect(result.buffer).toBeInstanceOf(Buffer);

    // Verify translated contents inside XML
    const translatedZip = await JSZip.loadAsync(result.buffer);
    const slide1Xml = await translatedZip.file('ppt/slides/slide1.xml')!.async('string');
    expect(slide1Xml).toContain('<a:t>执行摘要</a:t>');
    expect(slide1Xml).toContain('收入');

    const slide2Xml = await translatedZip.file('ppt/slides/slide2.xml')!.async('string');
    expect(slide2Xml).toContain('<a:t>谢谢</a:t>');
  });

  it('translates DOCX OpenXML and preserves formatting tags', async () => {
    const zip = new JSZip();
    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>Investor Update</w:t></w:r></w:p>
          <w:p><w:r><w:t>Operations and sales report</w:t></w:r></w:p>
        </w:body>
      </w:document>`
    );

    const docxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const result = await engine.translateDocx(docxBuffer, 'de-DE');

    expect(result.pageCount).toBe(1);
    const translatedZip = await JSZip.loadAsync(result.buffer);
    const docXml = await translatedZip.file('word/document.xml')!.async('string');
    expect(docXml).toContain('<w:t>Investoren-Update</w:t>');
    expect(docXml).toContain('Betrieb');
    expect(docXml).toContain('Vertrieb');
  });

  it('translates TXT files', async () => {
    const txtBuffer = Buffer.from('Revenue\nGrowth\nStatus', 'utf8');
    const result = await engine.translateTxt(txtBuffer, 'fr-FR');
    const str = result.buffer.toString('utf8');
    expect(str).toContain('Revenus');
    expect(str).toContain('Croissance');
    expect(str).toContain('Statut');
  });

  it('translates CSV preserving commas and quotes', async () => {
    const csvBuffer = Buffer.from('Title,Value\n"Executive Summary",100\nRevenue,250', 'utf8');
    const result = await engine.translateCsv(csvBuffer, 'es-ES');
    const str = result.buffer.toString('utf8');
    expect(str).toContain('"Resumen ejecutivo"');
    expect(str).toContain('Ingresos');
  });
});
