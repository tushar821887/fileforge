import { describe, it, expect, beforeEach } from 'vitest';
import sharp from 'sharp';
import { ImageEngine } from './image.engine.js';

describe('ImageEngine Real Conversion Tests', () => {
  let engine: ImageEngine;
  let samplePngBuffer: Buffer;
  let sampleJpgBuffer: Buffer;

  beforeEach(async () => {
    engine = new ImageEngine();

    // Generate a valid 100x80 PNG with transparency
    samplePngBuffer = await sharp({
      create: {
        width: 100,
        height: 80,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    // Generate a valid 120x60 JPG
    sampleJpgBuffer = await sharp({
      create: {
        width: 120,
        height: 60,
        channels: 3,
        background: { r: 0, g: 128, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  it('should inspect image dimensions, color space, and metadata accurately', async () => {
    const meta = await engine.inspectMetadata(samplePngBuffer);
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(80);
    expect(meta.format).toBe('png');
    expect(meta.hasAlpha).toBe(true);
  });

  it('should convert PNG to JPG with background flattening for transparent pixels', async () => {
    const result = await engine.processImage(samplePngBuffer, 'jpg', {
      quality: 90,
      backgroundColor: '#ffffff',
    });

    expect(result.outputExtension).toBe('jpg');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.buffer.length).toBeGreaterThan(0);

    // Verify converted buffer is a real valid JPEG with 3 channels (no alpha)
    const outMeta = await sharp(result.buffer).metadata();
    expect(outMeta.format).toBe('jpeg');
    expect(outMeta.channels).toBe(3);
    expect(outMeta.hasAlpha).toBe(false);
  });

  it('should convert JPG to WebP format', async () => {
    const result = await engine.processImage(sampleJpgBuffer, 'webp', { quality: 80 });
    expect(result.outputExtension).toBe('webp');
    expect(result.mimeType).toBe('image/webp');

    const outMeta = await sharp(result.buffer).metadata();
    expect(outMeta.format).toBe('webp');
  });

  it('should resize image while respecting target dimensions', async () => {
    const result = await engine.processImage(sampleJpgBuffer, 'png', {
      width: 60,
      height: 30,
      maintainAspectRatio: false,
    });

    const outMeta = await sharp(result.buffer).metadata();
    expect(outMeta.width).toBe(60);
    expect(outMeta.height).toBe(30);
  });

  it('should rotate image by 90 degrees', async () => {
    // 120x60 rotated 90 deg becomes 60x120
    const result = await engine.processImage(sampleJpgBuffer, 'jpg', {
      rotateAngle: 90,
    });

    const outMeta = await sharp(result.buffer).metadata();
    expect(outMeta.width).toBe(60);
    expect(outMeta.height).toBe(120);
  });

  it('should crop image to specified coordinates', async () => {
    const result = await engine.processImage(sampleJpgBuffer, 'jpg', {
      cropLeft: 10,
      cropTop: 10,
      cropWidth: 40,
      cropHeight: 30,
    });

    const outMeta = await sharp(result.buffer).metadata();
    expect(outMeta.width).toBe(40);
    expect(outMeta.height).toBe(30);
  });
});
