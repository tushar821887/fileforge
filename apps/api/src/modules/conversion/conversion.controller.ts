import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import fs from 'fs';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { ConversionService } from './conversion.service.js';
import type { ConversionOptions } from '@formatflow/shared';
import type { UploadedFile } from '../../types/file.types.js';

@ApiTags('Conversions')
@Controller('api/v1/conversions')
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Post()
  @ApiOperation({ summary: 'Upload file(s) and start conversion' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 15))
  async createConversion(
    @UploadedFiles() files: UploadedFile[],
    @Body('toolSlug') toolSlug: string,
    @Body('options') optionsRaw?: string
  ) {
    if (!toolSlug) {
      throw new BadRequestException('Field "toolSlug" is required.');
    }
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file must be uploaded under field "files".');
    }

    let parsedOptions: ConversionOptions = {};
    if (optionsRaw) {
      try {
        parsedOptions = typeof optionsRaw === 'string' ? JSON.parse(optionsRaw) : optionsRaw;
      } catch {
        // default empty options
      }
    }

    return await this.conversionService.executeConversion(toolSlug, files, parsedOptions);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Upload multiple files for batch conversion' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 20))
  async createBatchConversion(
    @UploadedFiles() files: UploadedFile[],
    @Body('toolSlug') toolSlug: string,
    @Body('options') optionsRaw?: string
  ) {
    return this.createConversion(files, toolSlug, optionsRaw);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Check conversion job status' })
  getConversionStatus(@Param('id') id: string) {
    return this.conversionService.getJob(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download converted file' })
  async downloadConvertedFile(@Param('id') id: string, @Res() res: Response) {
    const fileInfo = this.conversionService.getConvertedFileInfo(id);

    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
    );

    const stream = fs.createReadStream(fileInfo.filePath);
    stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Immediately purge conversion file from server' })
  async deleteConversion(@Param('id') id: string) {
    await this.conversionService.deleteJob(id);
    return { success: true, message: 'Files and job removed permanently.' };
  }
}
