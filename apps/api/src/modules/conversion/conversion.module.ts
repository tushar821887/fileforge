import { Module } from '@nestjs/common';
import { ConversionController } from './conversion.controller.js';
import { ConversionService } from './conversion.service.js';
import { ImageEngine } from './engines/image.engine.js';
import { PdfEngine } from './engines/pdf.engine.js';
import { DocumentEngine } from './engines/document.engine.js';

@Module({
  controllers: [ConversionController],
  providers: [ConversionService, ImageEngine, PdfEngine, DocumentEngine],
  exports: [ConversionService, ImageEngine, PdfEngine, DocumentEngine],
})
export class ConversionModule {}
