import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import fs from 'fs';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { TranslationService } from './translation.service.js';
import type { UploadedFile as IUploadedFile } from '../../types/file.types.js';

@ApiTags('Translation Studio')
@Controller('api/v1/translate')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get list of supported translation languages' })
  getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }

  @Post()
  @ApiOperation({
    summary: 'Upload document and translate to multiple languages while preserving layout',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createTranslation(
    @UploadedFile() file: IUploadedFile,
    @Body('targetLanguages') targetLanguagesRaw: string
  ) {
    if (!file) {
      throw new BadRequestException('Source file must be uploaded under field "file".');
    }
    if (!targetLanguagesRaw) {
      throw new BadRequestException('At least one target language must be specified in "targetLanguages".');
    }

    let parsedLanguages: string[] = [];
    try {
      if (typeof targetLanguagesRaw === 'string') {
        if (targetLanguagesRaw.startsWith('[')) {
          parsedLanguages = JSON.parse(targetLanguagesRaw);
        } else {
          parsedLanguages = targetLanguagesRaw.split(',').map((s) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(targetLanguagesRaw)) {
        parsedLanguages = targetLanguagesRaw;
      }
    } catch {
      parsedLanguages = targetLanguagesRaw.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (parsedLanguages.length === 0) {
      throw new BadRequestException('No valid target languages provided.');
    }

    return await this.translationService.executeTranslation(file, parsedLanguages);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get translation job status' })
  getTranslationStatus(@Param('id') id: string) {
    return this.translationService.getJob(id);
  }

  @Get(':id/download/:lang')
  @ApiOperation({ summary: 'Download translated document in specified language' })
  async downloadTranslatedFile(
    @Param('id') id: string,
    @Param('lang') lang: string,
    @Res() res: Response
  ) {
    const fileInfo = this.translationService.getTranslatedFileInfo(id, lang);

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
    );

    const stream = fs.createReadStream(fileInfo.filePath);
    stream.pipe(res);
  }

  @Get(':id/download-all')
  @ApiOperation({ summary: 'Download all translated documents bundled into Review Pack ZIP' })
  async downloadReviewPackZip(@Param('id') id: string, @Res() res: Response) {
    const fileInfo = this.translationService.getReviewPackZipInfo(id);

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
    );

    const stream = fs.createReadStream(fileInfo.filePath);
    stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Immediately purge translated files and job from server' })
  async deleteTranslation(@Param('id') id: string) {
    await this.translationService.deleteJob(id);
    return { success: true, message: 'Translation job and files removed permanently.' };
  }
}
