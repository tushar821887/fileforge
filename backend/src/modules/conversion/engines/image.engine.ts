import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import sharp, { type ResizeOptions } from 'sharp';
import type { ConversionOptions } from '@formatflow/shared';

export interface ImageConversionResult {
  buffer: Buffer;
  mimeType: string;
  outputExtension: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ImageEngine {
  private readonly logger = new Logger(ImageEngine.name);

  async inspectMetadata(inputBuffer: Buffer): Promise<Record<string, any>> {
    try {
      const meta = await sharp(inputBuffer).metadata();
      return {
        format: meta.format,
        width: meta.width,
        height: meta.height,
        space: meta.space,
        channels: meta.channels,
        depth: meta.depth,
        density: meta.density,
        hasAlpha: meta.hasAlpha,
        orientation: meta.orientation,
        isProgressive: meta.isProgressive,
      };
    } catch (err: any) {
      this.logger.error(`Failed to inspect image metadata: ${err.message}`);
      throw new BadRequestException('Could not read image metadata. The file may be corrupt or an unsupported format.');
    }
  }

  async processImage(
    inputBuffer: Buffer,
    targetFormat: string,
    options: ConversionOptions = {}
  ): Promise<ImageConversionResult> {
    const format = targetFormat.toLowerCase().replace('.', '');
    const quality = options.quality && options.quality >= 1 && options.quality <= 100 ? options.quality : 85;

    let pipeline = sharp(inputBuffer, {
      animated: options.animatedGif ?? false,
      failOn: 'none',
    });

    // Auto-orient based on EXIF
    pipeline = pipeline.rotate();

    // 1. Rotation option (if explicitly requested by user)
    if (options.rotateAngle && [90, 180, 270].includes(options.rotateAngle)) {
      pipeline = pipeline.rotate(options.rotateAngle);
    }

    // 2. Crop option
    if (
      options.cropWidth &&
      options.cropHeight &&
      options.cropWidth > 0 &&
      options.cropHeight > 0
    ) {
      pipeline = pipeline.extract({
        left: Math.max(0, options.cropLeft ?? 0),
        top: Math.max(0, options.cropTop ?? 0),
        width: Math.round(options.cropWidth),
        height: Math.round(options.cropHeight),
      });
    }

    // 3. Resize option
    if (options.width || options.height) {
      const resizeOptions: ResizeOptions = {
        width: options.width ? Math.round(options.width) : undefined,
        height: options.height ? Math.round(options.height) : undefined,
        fit: options.fit || (options.maintainAspectRatio !== false ? 'inside' : 'fill'),
        withoutEnlargement: false,
      };
      pipeline = pipeline.resize(resizeOptions);
    }

    // 4. Background color for non-transparent target formats (JPG)
    const isJpgTarget = format === 'jpg' || format === 'jpeg';
    if (isJpgTarget) {
      const bg = options.backgroundColor || '#ffffff';
      pipeline = pipeline.flatten({ background: bg });
    }

    // 5. Output format encoding
    let outputExtension = format;
    let mimeType = `image/${format}`;

    switch (format) {
      case 'jpg':
      case 'jpeg':
        outputExtension = 'jpg';
        mimeType = 'image/jpeg';
        pipeline = pipeline.jpeg({
          quality,
          mozjpeg: true,
          progressive: true,
        });
        break;

      case 'png':
        outputExtension = 'png';
        mimeType = 'image/png';
        pipeline = pipeline.png({
          compressionLevel: Math.round((100 - quality) / 11), // 0 to 9
          progressive: true,
        });
        break;

      case 'webp':
        outputExtension = 'webp';
        mimeType = 'image/webp';
        pipeline = pipeline.webp({
          quality,
          effort: 4,
          lossless: quality === 100,
        });
        break;

      case 'avif':
        outputExtension = 'avif';
        mimeType = 'image/avif';
        pipeline = pipeline.avif({
          quality,
          effort: 4,
          chromaSubsampling: '4:2:0',
        });
        break;

      case 'tiff':
      case 'tif':
        outputExtension = 'tiff';
        mimeType = 'image/tiff';
        pipeline = pipeline.tiff({
          quality,
          compression: 'deflate',
        });
        break;

      case 'gif':
        outputExtension = 'gif';
        mimeType = 'image/gif';
        pipeline = pipeline.gif();
        break;

      default:
        throw new BadRequestException(`Target image format "${targetFormat}" is not supported.`);
    }

    try {
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      return {
        buffer: data,
        mimeType,
        outputExtension,
        metadata: {
          width: info.width,
          height: info.height,
          channels: info.channels,
          size: info.size,
          format: info.format,
        },
      };
    } catch (err: any) {
      this.logger.error(`Sharp conversion error: ${err.message}`);
      throw new BadRequestException(`Image processing failed: ${err.message}`);
    }
  }
}
