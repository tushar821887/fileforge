export type ToolCategory = 'image' | 'pdf' | 'document';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ConversionOptions {
  // Image options
  quality?: number; // 1-100
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  maintainAspectRatio?: boolean;
  backgroundColor?: string; // hex like #ffffff for transparent to JPG
  rotateAngle?: number; // 90, 180, 270
  cropLeft?: number;
  cropTop?: number;
  cropWidth?: number;
  cropHeight?: number;
  animatedGif?: boolean; // preserve animation or first frame

  // PDF options
  pageRanges?: string; // e.g. "1, 3-5"
  pageIndices?: number[]; // [0, 2, 4]
  pageOrder?: number[]; // [2, 0, 1] for reordering
  pdfRotateDegrees?: number; // 90, 180, 270
  pdfPageSize?: 'A4' | 'LETTER' | 'AUTO';
  pdfOrientation?: 'portrait' | 'landscape';
  pdfMargin?: number; // margin in points
  pdfImageScaling?: 'fit' | 'fill' | 'original';
  pdfExtractAllImages?: boolean;

  // Document options
  sheetName?: string;
  csvDelimiter?: string;
  // Translation options
  targetLanguages?: string[];
}

export interface SupportedLanguage {
  code: string; // e.g. 'zh-CN'
  langKey: string; // e.g. 'zh'
  name: string; // e.g. 'Chinese'
  nativeName: string; // e.g. '中文'
  countryCode: string; // e.g. 'CN'
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'zh-CN', langKey: 'zh', name: 'Chinese', nativeName: '中文', countryCode: 'CN' },
  { code: 'fr-FR', langKey: 'fr', name: 'French', nativeName: 'Français', countryCode: 'FR' },
  { code: 'de-DE', langKey: 'de', name: 'German', nativeName: 'Deutsch', countryCode: 'DE' },
  { code: 'es-ES', langKey: 'es', name: 'Spanish', nativeName: 'Español', countryCode: 'ES' },
  { code: 'hi-IN', langKey: 'hi', name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'IN' },
  { code: 'ja-JP', langKey: 'ja', name: 'Japanese', nativeName: '日本語', countryCode: 'JP' },
  { code: 'ar-SA', langKey: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'SA' },
  { code: 'it-IT', langKey: 'it', name: 'Italian', nativeName: 'Italiano', countryCode: 'IT' },
  { code: 'pt-BR', langKey: 'pt', name: 'Portuguese', nativeName: 'Português', countryCode: 'BR' },
  { code: 'ru-RU', langKey: 'ru', name: 'Russian', nativeName: 'Русский', countryCode: 'RU' },
  { code: 'ko-KR', langKey: 'ko', name: 'Korean', nativeName: '한국어', countryCode: 'KR' },
  { code: 'nl-NL', langKey: 'nl', name: 'Dutch', nativeName: 'Nederlands', countryCode: 'NL' },
  { code: 'tr-TR', langKey: 'tr', name: 'Turkish', nativeName: 'Türkçe', countryCode: 'TR' },
  { code: 'en-US', langKey: 'en', name: 'English', nativeName: 'English', countryCode: 'US' },
];

export interface TranslatedFileItem {
  languageCode: string;
  languageName: string;
  filename: string;
  size: number;
  downloadUrl: string;
}

export interface TranslationJobResult {
  jobId: string;
  originalFilename: string;
  originalSize: number;
  format: string;
  status: JobStatus;
  progress: number;
  targetLanguages: string[];
  translatedFiles: TranslatedFileItem[];
  zipDownloadUrl?: string;
  slideCount?: number;
  pageCount?: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
  expiresAt: number;
}


export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  h1: string;
  description: string;
  metaDescription: string;
  category: ToolCategory;
  acceptedExtensions: string[]; // e.g. ['.jpg', '.jpeg']
  acceptedMimeTypes: string[];
  outputFormats: string[]; // e.g. ['png']
  defaultOutputFormat: string;
  isMultiFile: boolean;
  maxFiles: number;
  maxFileSizeMb: number;
  badge?: string;
  features: string[];
  steps: ToolStep[];
  faqs: ToolFaq[];
  supportedOptions: (keyof ConversionOptions)[];
}

export interface ConversionJobResult {
  jobId: string;
  status: JobStatus;
  progress: number;
  originalFilename: string;
  originalSize: number;
  originalMimeType: string;
  convertedFilename?: string;
  convertedSize?: number;
  convertedMimeType?: string;
  downloadUrl?: string;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: number;
  completedAt?: number;
  expiresAt: number;
}

export interface BatchConversionResponse {
  batchId: string;
  jobs: ConversionJobResult[];
}

export interface EngineStatus {
  sharp: boolean;
  pdfLib: boolean;
  xlsx: boolean;
  pdfJs: boolean;
  libreOffice: boolean;
  libreOfficePath?: string;
}

export interface SystemHealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  uptimeSeconds: number;
  storage: {
    tempDirectory: string;
    retentionMinutes: number;
    activeJobsCount: number;
  };
  engines: EngineStatus;
}

// Complete tool catalog with SEO copy, FAQs, and step-by-step instructions
export const TOOL_CATALOG: ToolDefinition[] = [
  // --- IMAGE TOOLS ---
  {
    slug: 'jpg-to-png',
    title: 'JPG to PNG Converter — Free & High Quality',
    shortTitle: 'JPG to PNG',
    h1: 'Convert JPG to PNG Online',
    description: 'Convert your JPEG/JPG images into lossless PNG format with transparent background support.',
    metaDescription: 'Convert JPG images to PNG format online for free. Fast, secure, and preserves maximum visual fidelity without watermarks.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    badge: 'Popular',
    features: ['Lossless PNG output', 'Instant in-browser download', 'Zero visual compression artifacts', 'No registration required'],
    steps: [
      { step: 1, title: 'Upload JPG', description: 'Drag and drop or browse to select your JPG file.' },
      { step: 2, title: 'Adjust Options', description: 'Fine-tune output parameters if desired.' },
      { step: 3, title: 'Convert & Download', description: 'Hit Convert and download your pristine PNG file immediately.' }
    ],
    faqs: [
      { question: 'Will converting JPG to PNG improve its image quality?', answer: 'While converting to PNG cannot reconstruct visual data already discarded by JPG compression, it guarantees no further compression loss occurs during subsequent saves and edits.' },
      { question: 'Is my uploaded JPG stored permanently?', answer: 'No. All files uploaded to FormatFlow are strictly private and automatically purged from our servers within 1 hour.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'png-to-jpg',
    title: 'PNG to JPG Converter — Optimize Image Size',
    shortTitle: 'PNG to JPG',
    h1: 'Convert PNG to JPG Online',
    description: 'Transform large PNG images into compact, web-ready JPG files. Choose custom background fill colors for transparent areas.',
    metaDescription: 'Convert PNG images to JPG quickly online. Configurable quality slider and custom transparent background color picker.',
    category: 'image',
    acceptedExtensions: ['.png'],
    acceptedMimeTypes: ['image/png'],
    outputFormats: ['jpg'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    badge: 'Popular',
    features: ['Dramatically smaller file size', 'Custom background color for transparency', 'Configurable output quality (1-100)', 'EXIF auto-orientation'],
    steps: [
      { step: 1, title: 'Upload PNG', description: 'Select your PNG file with or without transparency.' },
      { step: 2, title: 'Set Quality & Background', description: 'Pick your preferred compression level and background replacement color.' },
      { step: 3, title: 'Download JPG', description: 'Download your lightweight, web-optimized JPG.' }
    ],
    faqs: [
      { question: 'What happens to transparent pixels when converting to JPG?', answer: 'Because the JPEG format does not support alpha channels (transparency), transparent areas are rendered against a background color (defaults to clean white, or you can pick any custom color).' },
      { question: 'How much file size reduction can I expect?', answer: 'Typically between 60% and 85% file size savings compared to non-optimized PNGs.' }
    ],
    supportedOptions: ['quality', 'backgroundColor']
  },
  {
    slug: 'png-to-webp',
    title: 'PNG to WebP Converter — Next-Gen Web Graphics',
    shortTitle: 'PNG to WebP',
    h1: 'Convert PNG to WebP Online',
    description: 'Convert PNG to Google WebP format with full transparency retention and up to 35% smaller file sizes.',
    metaDescription: 'Convert PNG to modern WebP format online. Preserves transparency while cutting file sizes significantly for ultra-fast website loading.',
    category: 'image',
    acceptedExtensions: ['.png'],
    acceptedMimeTypes: ['image/png'],
    outputFormats: ['webp'],
    defaultOutputFormat: 'webp',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Preserves full alpha transparency', 'Next-gen Google WebP compression', 'Faster website page speed scores'],
    steps: [
      { step: 1, title: 'Select PNG', description: 'Drop your PNG file onto the upload zone.' },
      { step: 2, title: 'Choose Quality', description: 'Adjust compression ratio or keep standard 85% optimal.' },
      { step: 3, title: 'Get WebP', description: 'Download your feather-light WebP asset.' }
    ],
    faqs: [
      { question: 'Does WebP support transparency like PNG?', answer: 'Yes! WebP provides full 8-bit alpha channel transparency just like PNG, but with vastly superior compression.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'webp-to-png',
    title: 'WebP to PNG Converter — Transparent & Universal',
    shortTitle: 'WebP to PNG',
    h1: 'Convert WebP to PNG Online',
    description: 'Convert WebP images into universally compatible PNG format for graphic design software and older systems.',
    metaDescription: 'Quickly convert WebP files to PNG images online. Free, safe, and retains complete image resolution and transparency.',
    category: 'image',
    acceptedExtensions: ['.webp'],
    acceptedMimeTypes: ['image/webp'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Lossless conversion', 'Preserves transparency', 'Compatible with all photo editing suites'],
    steps: [
      { step: 1, title: 'Upload WebP', description: 'Choose your WebP image.' },
      { step: 2, title: 'Process', description: 'FormatFlow decodes WebP and encodes lossless PNG.' },
      { step: 3, title: 'Download', description: 'Save your PNG image.' }
    ],
    faqs: [
      { question: 'Why convert WebP back to PNG?', answer: 'Some older desktop software, graphic editors, and printing workflows do not yet support the WebP format natively. PNG offers 100% universal compatibility.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'jpg-to-webp',
    title: 'JPG to WebP Converter — Reduce Image Size',
    shortTitle: 'JPG to WebP',
    h1: 'Convert JPG to WebP Online',
    description: 'Compress JPG images into lightweight WebP format to boost your website Google PageSpeed and Core Web Vitals.',
    metaDescription: 'Convert JPG photos to WebP format online. Save bandwidth and improve website load times with state-of-the-art compression.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    outputFormats: ['webp'],
    defaultOutputFormat: 'webp',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Up to 30% smaller than JPEG at equal quality', 'Ideal for SEO and Core Web Vitals', 'Preserves EXIF metadata orientation'],
    steps: [
      { step: 1, title: 'Upload JPG', description: 'Select your photo.' },
      { step: 2, title: 'Set Quality', description: 'Select desired WebP quality.' },
      { step: 3, title: 'Download', description: 'Save your optimized WebP image.' }
    ],
    faqs: [
      { question: 'Is WebP supported by all modern browsers?', answer: 'Yes! Chrome, Safari, Firefox, Edge, and all modern mobile operating systems support WebP.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'webp-to-jpg',
    title: 'WebP to JPG Converter — Standard JPEG Format',
    shortTitle: 'WebP to JPG',
    h1: 'Convert WebP to JPG Online',
    description: 'Convert WebP images to standard JPG format for easy sharing, viewing, and printing on any device.',
    metaDescription: 'Convert WebP files to JPG online for free. Fast, high-resolution output with configurable JPEG quality.',
    category: 'image',
    acceptedExtensions: ['.webp'],
    acceptedMimeTypes: ['image/webp'],
    outputFormats: ['jpg'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Universal compatibility', 'Custom background color for transparent WebP', 'Adjustable JPEG quality'],
    steps: [
      { step: 1, title: 'Upload WebP', description: 'Drop your WebP file.' },
      { step: 2, title: 'Choose Settings', description: 'Pick quality and background color.' },
      { step: 3, title: 'Save JPG', description: 'Download your converted JPEG.' }
    ],
    faqs: [
      { question: 'Will animated WebPs convert to JPG?', answer: 'Since JPG does not support animation, the first representative frame of animated WebP is captured and exported in high quality.' }
    ],
    supportedOptions: ['quality', 'backgroundColor']
  },
  {
    slug: 'jpg-to-avif',
    title: 'JPG to AVIF Converter — Ultra Compression',
    shortTitle: 'JPG to AVIF',
    h1: 'Convert JPG to AVIF Online',
    description: 'Transform JPEG images into AV1 Image File Format (AVIF) for next-generation compression efficiency.',
    metaDescription: 'Convert JPG to AVIF online. Achieve up to 50% smaller sizes than JPG with superior color fidelity.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    outputFormats: ['avif'],
    defaultOutputFormat: 'avif',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Cutting-edge AV1 codec compression', 'HDR and wide color gamut ready', 'Maximum bandwidth savings'],
    steps: [
      { step: 1, title: 'Upload JPG', description: 'Select your JPG.' },
      { step: 2, title: 'Select Quality', description: 'Configure AVIF quality.' },
      { step: 3, title: 'Download AVIF', description: 'Get the smallest possible image file.' }
    ],
    faqs: [
      { question: 'What is AVIF?', answer: 'AVIF is an open, royalty-free image format based on the AV1 video codec developed by the Alliance for Open Media (Google, Apple, Microsoft, Mozilla).' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'png-to-avif',
    title: 'PNG to AVIF Converter — Modern Alpha Graphics',
    shortTitle: 'PNG to AVIF',
    h1: 'Convert PNG to AVIF Online',
    description: 'Convert PNG graphics to AVIF with transparency and industry-leading compression.',
    metaDescription: 'Convert PNG images to AVIF online. Preserves alpha channels and details with maximum compression efficiency.',
    category: 'image',
    acceptedExtensions: ['.png'],
    acceptedMimeTypes: ['image/png'],
    outputFormats: ['avif'],
    defaultOutputFormat: 'avif',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Full transparency support', 'Remarkable size reduction', 'Clean sharp edges'],
    steps: [
      { step: 1, title: 'Upload PNG', description: 'Choose your PNG file.' },
      { step: 2, title: 'Convert', description: 'FormatFlow applies high-efficiency AV1 compression.' },
      { step: 3, title: 'Download', description: 'Download your AVIF file.' }
    ],
    faqs: [
      { question: 'Is AVIF better than WebP?', answer: 'AVIF generally yields smaller file sizes than WebP at identical visual quality, especially on complex photographic textures.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'avif-to-png',
    title: 'AVIF to PNG Converter — Convert AVIF Images',
    shortTitle: 'AVIF to PNG',
    h1: 'Convert AVIF to PNG Online',
    description: 'Convert modern AVIF images into standard PNG format with transparency preserved.',
    metaDescription: 'Convert AVIF files to PNG format online for free. Fast, high-fidelity conversion without quality loss.',
    category: 'image',
    acceptedExtensions: ['.avif'],
    acceptedMimeTypes: ['image/avif'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Lossless conversion', 'Full alpha transparency retained', 'Compatible with all image editors'],
    steps: [
      { step: 1, title: 'Upload AVIF', description: 'Select your AVIF photo.' },
      { step: 2, title: 'Process', description: 'Decode AVIF and render PNG.' },
      { step: 3, title: 'Download', description: 'Save your PNG.' }
    ],
    faqs: [
      { question: 'Why do I need to convert AVIF to PNG?', answer: 'Some design applications such as Photoshop without plugins, or legacy desktop viewers, cannot open AVIF directly. PNG solves this.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'tiff-to-jpg',
    title: 'TIFF to JPG Converter — Convert High-Res Scans',
    shortTitle: 'TIFF to JPG',
    h1: 'Convert TIFF to JPG Online',
    description: 'Convert heavy TIFF and TIF scanner files into lightweight, shareable JPG photos.',
    metaDescription: 'Convert TIFF images to JPG online for free. Compress large scans and camera RAW files into fast-loading JPEGs.',
    category: 'image',
    acceptedExtensions: ['.tif', '.tiff'],
    acceptedMimeTypes: ['image/tiff'],
    outputFormats: ['jpg'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 50,
    features: ['Supports multi-megabyte scanner files', 'Maintains color accuracy', 'Significant file size reduction'],
    steps: [
      { step: 1, title: 'Upload TIFF', description: 'Drop your heavy TIFF scan.' },
      { step: 2, title: 'Adjust Quality', description: 'Pick desired JPG quality level.' },
      { step: 3, title: 'Download JPG', description: 'Get a clean, compact JPG.' }
    ],
    faqs: [
      { question: 'Does this handle 16-bit TIFF files?', answer: 'Yes, our sharp-powered processing engine normalizes color bit depths cleanly to standard 8-bit sRGB JPEG.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'tiff-to-png',
    title: 'TIFF to PNG Converter — Lossless Document Scans',
    shortTitle: 'TIFF to PNG',
    h1: 'Convert TIFF to PNG Online',
    description: 'Convert TIFF files to lossless PNG format preserving transparency and maximum pixel clarity.',
    metaDescription: 'Convert TIFF files to PNG online. Lossless conversion preserving crystal clear scan resolution.',
    category: 'image',
    acceptedExtensions: ['.tif', '.tiff'],
    acceptedMimeTypes: ['image/tiff'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 50,
    features: ['Lossless conversion', 'Maintains transparency layers', 'Perfect for archival documents'],
    steps: [
      { step: 1, title: 'Upload TIFF', description: 'Choose your TIFF file.' },
      { step: 2, title: 'Convert', description: 'Render lossless PNG.' },
      { step: 3, title: 'Download', description: 'Save your PNG scan.' }
    ],
    faqs: [
      { question: 'Is PNG better than TIFF for web usage?', answer: 'Yes, browsers do not natively display TIFF images, whereas PNG displays natively across every mobile device and web browser.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'bmp-to-jpg',
    title: 'BMP to JPG Converter — Compress Bitmap Images',
    shortTitle: 'BMP to JPG',
    h1: 'Convert BMP to JPG Online',
    description: 'Convert uncompressed Windows Bitmap (BMP) images into compact, web-ready JPGs.',
    metaDescription: 'Convert BMP bitmap images to JPG online. Reduce file size by up to 95% without noticeable loss.',
    category: 'image',
    acceptedExtensions: ['.bmp'],
    acceptedMimeTypes: ['image/bmp', 'image/x-ms-bmp'],
    outputFormats: ['jpg'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 30,
    features: ['Up to 95% file size compression', 'Fast processing', 'Universal JPEG compatibility'],
    steps: [
      { step: 1, title: 'Upload BMP', description: 'Select your BMP image.' },
      { step: 2, title: 'Process', description: 'Convert to optimized JPEG.' },
      { step: 3, title: 'Download', description: 'Save your compact file.' }
    ],
    faqs: [
      { question: 'Why are BMP files so large?', answer: 'BMP files store raw uncompressed pixel data without compression. Converting to JPG applies smart perceptual compression.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'bmp-to-png',
    title: 'BMP to PNG Converter — Lossless Bitmap Conversion',
    shortTitle: 'BMP to PNG',
    h1: 'Convert BMP to PNG Online',
    description: 'Convert BMP images into lossless PNG format with deflate compression.',
    metaDescription: 'Convert BMP to PNG online. Lossless compression that preserves 100% of pixel fidelity.',
    category: 'image',
    acceptedExtensions: ['.bmp'],
    acceptedMimeTypes: ['image/bmp', 'image/x-ms-bmp'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 30,
    features: ['100% Lossless preservation', 'Reduced file size via Deflate', 'Browser friendly'],
    steps: [
      { step: 1, title: 'Upload BMP', description: 'Choose your BMP bitmap.' },
      { step: 2, title: 'Convert', description: 'Encode into PNG format.' },
      { step: 3, title: 'Download', description: 'Save your PNG.' }
    ],
    faqs: [
      { question: 'Is BMP to PNG lossless?', answer: 'Yes! Every single pixel is mathematically preserved identically.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'gif-to-png',
    title: 'GIF to PNG Converter — Extract Sharp Frames',
    shortTitle: 'GIF to PNG',
    h1: 'Convert GIF to PNG Online',
    description: 'Convert GIF images into crisp 24-bit PNG files with alpha transparency.',
    metaDescription: 'Convert GIF to PNG online. Turn limited 256-color GIFs into rich, lossless PNG images.',
    category: 'image',
    acceptedExtensions: ['.gif'],
    acceptedMimeTypes: ['image/gif'],
    outputFormats: ['png', 'jpg'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 25,
    features: ['Extract first frame or animated sequence', 'Upgrade to 24-bit color palette', 'Preserve transparency'],
    steps: [
      { step: 1, title: 'Upload GIF', description: 'Select your GIF file.' },
      { step: 2, title: 'Convert', description: 'Convert to PNG format.' },
      { step: 3, title: 'Download', description: 'Save the crisp PNG result.' }
    ],
    faqs: [
      { question: 'Does GIF to PNG keep animation?', answer: 'Standard PNG is a static image format, so the first high-resolution frame is converted. If you want animated next-gen graphics, consider WebP.' }
    ],
    supportedOptions: ['quality', 'backgroundColor']
  },
  {
    slug: 'svg-to-png',
    title: 'SVG to PNG Converter — Rasterize Vector Graphics',
    shortTitle: 'SVG to PNG',
    h1: 'Convert SVG to PNG Online',
    description: 'Render scalable vector graphics (SVG) into high-resolution PNG images with transparent backgrounds.',
    metaDescription: 'Convert SVG vectors to PNG format online. High-resolution rasterization with custom width and height controls.',
    category: 'image',
    acceptedExtensions: ['.svg'],
    acceptedMimeTypes: ['image/svg+xml'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 15,
    features: ['Configurable output dimensions', 'Crystal-clear anti-aliasing', 'Alpha transparency preserved'],
    steps: [
      { step: 1, title: 'Upload SVG', description: 'Select your vector file.' },
      { step: 2, title: 'Set Dimensions', description: 'Optionally specify target width or height.' },
      { step: 3, title: 'Download PNG', description: 'Save your rasterized PNG.' }
    ],
    faqs: [
      { question: 'Can I scale the SVG before converting to PNG?', answer: 'Yes! Specify any custom width or height, and the vector will render sharply at that exact resolution without blurriness.' }
    ],
    supportedOptions: ['width', 'height']
  },
  {
    slug: 'image-compressor',
    title: 'Online Image Compressor — Shrink Images Without Quality Loss',
    shortTitle: 'Compress Image',
    h1: 'Compress Images Online',
    description: 'Compress JPG, PNG, and WebP images quickly while maintaining outstanding visual sharpness.',
    metaDescription: 'Free online image compressor. Reduce image file sizes by up to 80% with adjustable compression levels.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['jpg', 'png', 'webp'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 30,
    badge: 'Popular',
    features: ['Intelligent lossy & lossless compression', 'Real-time size comparison display', 'Batch compression support'],
    steps: [
      { step: 1, title: 'Upload Images', description: 'Drag and drop up to 10 images.' },
      { step: 2, title: 'Adjust Level', description: 'Set quality from 1 to 100.' },
      { step: 3, title: 'Download', description: 'Download compressed images individually or as a batch.' }
    ],
    faqs: [
      { question: 'How much smaller will my image become?', answer: 'Most JPG and WebP photos can be reduced by 50% to 75% with zero perceivable loss on mobile and desktop screens.' }
    ],
    supportedOptions: ['quality']
  },
  {
    slug: 'image-resizer',
    title: 'Image Resizer — Resize Photos by Pixels or Percentage',
    shortTitle: 'Resize Image',
    h1: 'Resize Image Online',
    description: 'Change image dimensions with high-quality Lanczos resampling. Keep aspect ratio or specify custom dimensions.',
    metaDescription: 'Resize JPG, PNG, and WebP images online for free. Maintain aspect ratio, choose resampling filters, and export instantly.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['jpg', 'png', 'webp'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 30,
    features: ['Lanczos3 high-fidelity interpolation', 'Aspect ratio lock option', 'Custom fit modes (contain, cover, inside)'],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Select your photo.' },
      { step: 2, title: 'Set Width & Height', description: 'Enter target pixel dimensions.' },
      { step: 3, title: 'Download Resized', description: 'Save your perfectly dimensioned image.' }
    ],
    faqs: [
      { question: 'Will my image look stretched?', answer: 'No! With "Maintain Aspect Ratio" checked, your image scales proportionally without distortion.' }
    ],
    supportedOptions: ['width', 'height', 'fit', 'maintainAspectRatio']
  },
  {
    slug: 'image-rotator',
    title: 'Rotate Image Online — Rotate 90°, 180°, 270°',
    shortTitle: 'Rotate Image',
    h1: 'Rotate Images Online',
    description: 'Rotate images clockwise, counter-clockwise, or 180 degrees. Fix upside-down and sideways photos quickly.',
    metaDescription: 'Rotate JPG, PNG, and WebP images online for free. Fast lossless rotation without quality degradation.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['jpg', 'png', 'webp'],
    defaultOutputFormat: 'jpg',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 30,
    features: ['90°, 180°, 270° rotation angles', 'Fixes camera orientation mistakes', 'Lossless buffer manipulation'],
    steps: [
      { step: 1, title: 'Upload Photo', description: 'Select your image.' },
      { step: 2, title: 'Choose Rotation', description: 'Click 90°, 180°, or 270°.' },
      { step: 3, title: 'Save', description: 'Download your properly oriented image.' }
    ],
    faqs: [
      { question: 'Does rotation affect EXIF metadata?', answer: 'The image pixel data is physically rotated and the EXIF orientation tag is cleanly normalized to standard horizontal.' }
    ],
    supportedOptions: ['rotateAngle']
  },
  {
    slug: 'image-cropper',
    title: 'Image Cropper — Crop Photos to Specific Regions',
    shortTitle: 'Crop Image',
    h1: 'Crop Images Online',
    description: 'Trim unwanted borders or crop images to exact coordinates with sub-pixel precision.',
    metaDescription: 'Crop JPG, PNG, and WebP images online. Select coordinates and extract specific regions cleanly.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['jpg', 'png', 'webp'],
    defaultOutputFormat: 'jpg',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 30,
    features: ['Precision pixel cropping', 'Clean edge handling', 'Supports JPG and PNG outputs'],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Select the file to crop.' },
      { step: 2, title: 'Set Crop Area', description: 'Specify left, top, width, and height.' },
      { step: 3, title: 'Download Cropped', description: 'Save your cropped result.' }
    ],
    faqs: [
      { question: 'How do crop coordinates work?', answer: 'Coordinates specify the (X, Y) top-left starting position and the width and height of the desired crop box.' }
    ],
    supportedOptions: ['cropLeft', 'cropTop', 'cropWidth', 'cropHeight']
  },
  {
    slug: 'image-metadata',
    title: 'Image Metadata Inspector — View EXIF & Dimensions',
    shortTitle: 'Inspect Image',
    h1: 'Inspect Image Metadata Online',
    description: 'View full dimensions, color space, bit depth, format, channels, and EXIF metadata without uploading to external third parties.',
    metaDescription: 'Inspect image metadata online for free. View width, height, density, color profile, and format details.',
    category: 'image',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.bmp', '.gif'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff', 'image/bmp', 'image/gif'],
    outputFormats: ['json'],
    defaultOutputFormat: 'json',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 30,
    features: ['Exact width and height inspection', 'Color model (sRGB, CMYK, etc.)', 'Has alpha channel detection', 'Resolution DPI / density'],
    steps: [
      { step: 1, title: 'Upload Image', description: 'Choose any image file.' },
      { step: 2, title: 'Inspect', description: 'FormatFlow analyzes the image headers.' },
      { step: 3, title: 'View Report', description: 'Review properties and copy metadata JSON.' }
    ],
    faqs: [
      { question: 'Is any private location data exposed?', answer: 'Location data is read strictly for your inspection and never logged, stored, or transmitted to any third party.' }
    ],
    supportedOptions: []
  },

  // --- PDF TOOLS ---
  {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter — Turn Images into PDF Documents',
    shortTitle: 'JPG to PDF',
    h1: 'Convert JPG to PDF Online',
    description: 'Convert JPG photos into standardized PDF documents. Customize page size (A4, Letter, Auto), orientation, and margins.',
    metaDescription: 'Convert JPG images to PDF documents online for free. Customize page size (A4, Letter), margins, and orientation.',
    category: 'pdf',
    acceptedExtensions: ['.jpg', '.jpeg'],
    acceptedMimeTypes: ['image/jpeg'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 20,
    maxFileSizeMb: 30,
    badge: 'Popular',
    features: ['Standard A4, Letter, or Fit-Image page sizes', 'Portrait and landscape layouts', 'Configurable margins (none, small, normal)', 'Multi-image consolidation'],
    steps: [
      { step: 1, title: 'Upload JPGs', description: 'Select one or multiple JPG files.' },
      { step: 2, title: 'Choose Page Settings', description: 'Select page size and margins.' },
      { step: 3, title: 'Download PDF', description: 'Download your compiled PDF document.' }
    ],
    faqs: [
      { question: 'Can I combine multiple JPGs into one PDF?', answer: 'Yes! Select multiple JPGs, and FormatFlow will bind them consecutively into a single multi-page PDF document.' }
    ],
    supportedOptions: ['pdfPageSize', 'pdfOrientation', 'pdfMargin', 'pdfImageScaling']
  },
  {
    slug: 'png-to-pdf',
    title: 'PNG to PDF Converter — Convert PNG to PDF Document',
    shortTitle: 'PNG to PDF',
    h1: 'Convert PNG to PDF Online',
    description: 'Transform PNG illustrations and graphics into print-ready PDF files with customizable page dimensions.',
    metaDescription: 'Convert PNG images to PDF documents online for free. Supports multi-image merging, custom margins, and A4/Letter sizing.',
    category: 'pdf',
    acceptedExtensions: ['.png'],
    acceptedMimeTypes: ['image/png'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 20,
    maxFileSizeMb: 30,
    badge: 'Popular',
    features: ['Crisp high-resolution PDF output', 'Clean transparent handling', 'Multiple PNGs to single PDF'],
    steps: [
      { step: 1, title: 'Upload PNGs', description: 'Select your PNG file(s).' },
      { step: 2, title: 'Set Page Size', description: 'Choose A4, Letter, or Auto-fit.' },
      { step: 3, title: 'Generate PDF', description: 'Download your PDF file.' }
    ],
    faqs: [
      { question: 'Does it retain transparency in PDF?', answer: 'PDFs render against standard document page backgrounds (white).' }
    ],
    supportedOptions: ['pdfPageSize', 'pdfOrientation', 'pdfMargin', 'pdfImageScaling']
  },
  {
    slug: 'images-to-pdf',
    title: 'Images to PDF Converter — Merge Multiple Images into One PDF',
    shortTitle: 'Images to PDF',
    h1: 'Combine Images to PDF Online',
    description: 'Combine multiple JPG, PNG, and WebP images into a single professional PDF document with custom margins and ordering.',
    metaDescription: 'Combine multiple images (JPG, PNG, WebP) into one unified PDF document. Free, easy, and customizable.',
    category: 'pdf',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 30,
    maxFileSizeMb: 50,
    badge: 'Popular',
    features: ['Combine mixed image formats', 'Drag & drop page sequencing', 'A4, Letter, or Auto page dimensions'],
    steps: [
      { step: 1, title: 'Upload Images', description: 'Select all images you want in the document.' },
      { step: 2, title: 'Configure Layout', description: 'Choose orientation and margin preferences.' },
      { step: 3, title: 'Export PDF', description: 'Download your consolidated multi-page PDF.' }
    ],
    faqs: [
      { question: 'Can I mix JPG and PNG files?', answer: 'Yes! FormatFlow seamlessly combines JPG, PNG, and WebP images in the same unified PDF.' }
    ],
    supportedOptions: ['pdfPageSize', 'pdfOrientation', 'pdfMargin', 'pdfImageScaling']
  },
  {
    slug: 'pdf-to-jpg',
    title: 'PDF to JPG Converter — Convert PDF Pages to Images',
    shortTitle: 'PDF to JPG',
    h1: 'Convert PDF to JPG Online',
    description: 'Convert PDF document pages into high-resolution JPG images. Extract individual pages or all pages.',
    metaDescription: 'Convert PDF pages to JPG images online. Fast, high-resolution rendering for easy sharing and presentation slides.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['jpg'],
    defaultOutputFormat: 'jpg',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 35,
    badge: 'Popular',
    features: ['High-DPI rendering', 'Select specific page or all pages', 'Instant ZIP download for multi-page documents'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Drop your PDF document.' },
      { step: 2, title: 'Choose Pages', description: 'Specify page number or convert all.' },
      { step: 3, title: 'Download JPGs', description: 'Get your converted images.' }
    ],
    faqs: [
      { question: 'How is page quality preserved?', answer: 'Pages are rendered at high resolution (150-300 DPI) ensuring text and diagrams remain razor sharp.' }
    ],
    supportedOptions: ['pageRanges', 'quality']
  },
  {
    slug: 'pdf-to-png',
    title: 'PDF to PNG Converter — Crisp Page Image Extraction',
    shortTitle: 'PDF to PNG',
    h1: 'Convert PDF to PNG Online',
    description: 'Convert PDF pages into crystal clear lossless PNG images with sharp text and diagrams.',
    metaDescription: 'Convert PDF to PNG online for free. Export crisp vector-rendered pages as lossless PNG images.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['png'],
    defaultOutputFormat: 'png',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 35,
    features: ['Lossless anti-aliased PNG rendering', 'Perfect for diagrams and vector text', 'Page range selection'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select your PDF.' },
      { step: 2, title: 'Select Options', description: 'Choose page range if needed.' },
      { step: 3, title: 'Download PNG', description: 'Save your crisp PNG image.' }
    ],
    faqs: [
      { question: 'Why choose PNG over JPG for PDF rendering?', answer: 'PNG uses lossless compression, making diagrams, fine lines, and small text significantly clearer without compression halos.' }
    ],
    supportedOptions: ['pageRanges']
  },
  {
    slug: 'merge-pdf',
    title: 'Merge PDF Files — Combine Multiple PDFs Online',
    shortTitle: 'Merge PDF',
    h1: 'Merge PDF Files Online',
    description: 'Combine multiple PDF documents into a single organized PDF file in seconds. Simple, fast, and secure.',
    metaDescription: 'Merge PDF files online for free. Combine multiple PDFs into a single file with custom page sequencing.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 15,
    maxFileSizeMb: 50,
    badge: 'Popular',
    features: ['Merge unlimited pages', 'Preserves bookmarks and formatting', 'Zero quality degradation', 'Safe auto-deletion'],
    steps: [
      { step: 1, title: 'Upload PDFs', description: 'Select 2 or more PDF files.' },
      { step: 2, title: 'Order Documents', description: 'Files will be stitched in the sequence provided.' },
      { step: 3, title: 'Download Combined PDF', description: 'Download your unified PDF file.' }
    ],
    faqs: [
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'You can upload up to 15 PDFs at once for free, up to 50MB in total.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'split-pdf',
    title: 'Split PDF — Extract Pages or Split into Separate Files',
    shortTitle: 'Split PDF',
    h1: 'Split PDF Document Online',
    description: 'Split a large PDF file into individual pages or extract specific page ranges (e.g., 1-3, 5, 8-10).',
    metaDescription: 'Split PDF files online for free. Extract custom page ranges or separate every page cleanly.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 40,
    badge: 'Popular',
    features: ['Flexible page range syntax (e.g. 1-4, 7)', 'Extract single page or chunks', 'Lossless PDF structure preservation'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF to split.' },
      { step: 2, title: 'Specify Range', description: 'Enter page numbers or ranges (e.g. 1-3, 5).' },
      { step: 3, title: 'Download', description: 'Save your extracted PDF document.' }
    ],
    faqs: [
      { question: 'How do I specify multiple page ranges?', answer: 'Use comma-separated numbers and hyphens, for example: "1, 3-5, 8".' }
    ],
    supportedOptions: ['pageRanges']
  },
  {
    slug: 'extract-pdf-pages',
    title: 'Extract PDF Pages — Pick & Save Selected Pages',
    shortTitle: 'Extract Pages',
    h1: 'Extract Selected PDF Pages',
    description: 'Isolate and extract specific pages from any PDF document into a new standalone PDF.',
    metaDescription: 'Extract selected pages from any PDF online. Free, secure, and preserves hyperlinks and formatting.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 40,
    features: ['Precise page selection', 'Instant extraction', 'Lightweight output file'],
    steps: [
      { step: 1, title: 'Upload Document', description: 'Drop your PDF file.' },
      { step: 2, title: 'Enter Pages', description: 'Input page numbers to isolate.' },
      { step: 3, title: 'Download', description: 'Save your new focused PDF.' }
    ],
    faqs: [
      { question: 'Will original hyperlinks and text selections remain intact?', answer: 'Yes! PDF-lib preserves internal vector structures and embedded fonts.' }
    ],
    supportedOptions: ['pageRanges']
  },
  {
    slug: 'rotate-pdf-pages',
    title: 'Rotate PDF Pages — Permanently Fix PDF Orientation',
    shortTitle: 'Rotate PDF',
    h1: 'Rotate PDF Pages Online',
    description: 'Rotate PDF pages clockwise or counter-clockwise (90°, 180°, 270°) and save the corrected document permanently.',
    metaDescription: 'Rotate PDF pages online for free. Fix upside-down or sideways PDF scans permanently.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 40,
    features: ['Rotate 90°, 180°, or 270°', 'Rotate all pages or specific page ranges', 'Permanent structural orientation fix'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the PDF requiring rotation.' },
      { step: 2, title: 'Choose Angle', description: 'Select 90° CW, 180°, or 270° CW.' },
      { step: 3, title: 'Download', description: 'Download your properly aligned PDF.' }
    ],
    faqs: [
      { question: 'Does this permanently change the orientation?', answer: 'Yes, the page rotation dictionary in the PDF structure is permanently updated so it opens correctly in Adobe Reader and all devices.' }
    ],
    supportedOptions: ['pdfRotateDegrees', 'pageRanges']
  },
  {
    slug: 'reorder-pdf-pages',
    title: 'Reorder PDF Pages — Rearrange Document Pages',
    shortTitle: 'Reorder PDF',
    h1: 'Reorder PDF Pages Online',
    description: 'Rearrange the sequence of pages in your PDF document. Reorganize slides, contracts, and reports.',
    metaDescription: 'Reorder pages in a PDF document online for free. Specify custom page orders and download updated PDF.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 40,
    features: ['Custom page sequence definition', 'Zero loss in visual quality', 'Fast processing'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select your PDF document.' },
      { step: 2, title: 'Enter New Order', description: 'Specify desired sequence (e.g., 3, 1, 2, 4).' },
      { step: 3, title: 'Download', description: 'Save the rearranged PDF.' }
    ],
    faqs: [
      { question: 'How do I enter the new page order?', answer: 'Provide comma-separated page numbers corresponding to the order you want them to appear (e.g. 2, 1, 3).' }
    ],
    supportedOptions: ['pageRanges']
  },
  {
    slug: 'compress-pdf',
    title: 'Compress PDF — Reduce PDF File Size Online',
    shortTitle: 'Compress PDF',
    h1: 'Compress PDF Files Online',
    description: 'Optimize and reduce PDF document file sizes by streamlining object streams and redundant data.',
    metaDescription: 'Compress PDF files online for free. Reduce file size for email attachments and web publishing.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 50,
    badge: 'Popular',
    features: ['Optimizes PDF structural dictionary', 'Removes orphaned objects', 'Reports actual size reduction percentage'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select the file to compress.' },
      { step: 2, title: 'Optimize', description: 'FormatFlow removes redundant structures.' },
      { step: 3, title: 'Download & Compare', description: 'See original vs new size and download.' }
    ],
    faqs: [
      { question: 'Will compression always reduce the file size?', answer: 'Not always. If a PDF is already heavily compressed or consists primarily of text streams, structural optimization may yield minor or negligible reductions. We always report the genuine result transparently.' }
    ],
    supportedOptions: []
  },
  {
    slug: 'pdf-metadata',
    title: 'PDF Page Count & Metadata Inspector',
    shortTitle: 'Inspect PDF',
    h1: 'Inspect PDF Metadata Online',
    description: 'Inspect PDF page counts, creator, producer, title, author, creation date, and page dimension specs.',
    metaDescription: 'Inspect PDF metadata and page count online. View title, author, page dimensions, and PDF version.',
    category: 'pdf',
    acceptedExtensions: ['.pdf'],
    acceptedMimeTypes: ['application/pdf'],
    outputFormats: ['json'],
    defaultOutputFormat: 'json',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 50,
    features: ['Total page count verification', 'Page dimensions in mm & points', 'Title, Author, Subject & Keywords inspector', 'PDF version check'],
    steps: [
      { step: 1, title: 'Upload PDF', description: 'Select any PDF file.' },
      { step: 2, title: 'Inspect', description: 'FormatFlow reads PDF header and trailer dictionaries.' },
      { step: 3, title: 'Review Properties', description: 'View full metadata report.' }
    ],
    faqs: [
      { question: 'Can I inspect password-protected PDFs?', answer: 'If a PDF is encrypted with an owner password, basic metadata may require unlocking. We display a clear message if encryption prevents reading.' }
    ],
    supportedOptions: []
  },

  // --- DOCUMENT CONVERSION TOOLS ---
  {
    slug: 'csv-to-xlsx',
    title: 'CSV to XLSX Converter — Convert Comma-Separated to Excel',
    shortTitle: 'CSV to XLSX',
    h1: 'Convert CSV to Excel (XLSX) Online',
    description: 'Convert CSV spreadsheets to Microsoft Excel XLSX format with automatic number, date, and text type recognition.',
    metaDescription: 'Convert CSV files to Microsoft Excel XLSX online for free. Auto-detects delimiters and data types.',
    category: 'document',
    acceptedExtensions: ['.csv', '.txt'],
    acceptedMimeTypes: ['text/csv', 'text/plain'],
    outputFormats: ['xlsx'],
    defaultOutputFormat: 'xlsx',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 20,
    badge: 'Popular',
    features: ['Auto-detects commas, semicolons, and tabs', 'Proper numeric and date typing in Excel', 'Clean UTF-8 character encoding support'],
    steps: [
      { step: 1, title: 'Upload CSV', description: 'Select your CSV file.' },
      { step: 2, title: 'Convert', description: 'FormatFlow compiles standard Excel XML workbook.' },
      { step: 3, title: 'Download XLSX', description: 'Open your spreadsheet in Excel or Google Sheets.' }
    ],
    faqs: [
      { question: 'Will international characters (accents, emojis) work?', answer: 'Yes! Our parser strictly handles UTF-8 BOM and multi-byte character sets properly.' }
    ],
    supportedOptions: ['csvDelimiter', 'sheetName']
  },
  {
    slug: 'xlsx-to-csv',
    title: 'XLSX to CSV Converter — Convert Excel to Comma-Separated',
    shortTitle: 'XLSX to CSV',
    h1: 'Convert Excel (XLSX) to CSV Online',
    description: 'Export Microsoft Excel sheets into clean, universal CSV format for database imports and data processing.',
    metaDescription: 'Convert Excel XLSX spreadsheets to CSV format online. Choose delimiter and export data seamlessly.',
    category: 'document',
    acceptedExtensions: ['.xlsx', '.xls'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ],
    outputFormats: ['csv'],
    defaultOutputFormat: 'csv',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 20,
    badge: 'Popular',
    features: ['Extract first sheet or specify sheet name', 'Configurable delimiter (comma, tab, semicolon)', 'Sanitized escaping for SQL and pandas import'],
    steps: [
      { step: 1, title: 'Upload Excel File', description: 'Drop your .xlsx or .xls file.' },
      { step: 2, title: 'Select Options', description: 'Pick delimiter (comma, tab, or semicolon).' },
      { step: 3, title: 'Download CSV', description: 'Save your clean CSV file.' }
    ],
    faqs: [
      { question: 'Which sheet is converted if my workbook has multiple sheets?', answer: 'By default, the active first worksheet is converted. You can also specify a custom sheet name in the options.' }
    ],
    supportedOptions: ['csvDelimiter', 'sheetName']
  },
  {
    slug: 'txt-to-pdf',
    title: 'TXT to PDF Converter — Turn Plain Text into PDF Documents',
    shortTitle: 'TXT to PDF',
    h1: 'Convert TXT to PDF Online',
    description: 'Transform plain text notes, logs, and manuscripts into formatted, paginated PDF documents with clean typography.',
    metaDescription: 'Convert TXT files to PDF online for free. Automatic text wrapping, margins, page numbers, and clean fonts.',
    category: 'document',
    acceptedExtensions: ['.txt'],
    acceptedMimeTypes: ['text/plain'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 10,
    maxFileSizeMb: 15,
    features: ['Automatic line wrapping & pagination', 'Standard Letter or A4 dimensions', 'Clean professional typography'],
    steps: [
      { step: 1, title: 'Upload TXT File', description: 'Select your plain text file.' },
      { step: 2, title: 'Configure Layout', description: 'Choose page size (A4 or Letter).' },
      { step: 3, title: 'Download PDF', description: 'Save your paginated PDF document.' }
    ],
    faqs: [
      { question: 'Does it wrap long lines properly?', answer: 'Yes! Long paragraphs are wrapped dynamically to fit within page margins.' }
    ],
    supportedOptions: ['pdfPageSize', 'pdfMargin']
  },
  {
    slug: 'html-to-pdf',
    title: 'HTML to PDF Converter — Convert Web Code to PDF',
    shortTitle: 'HTML to PDF',
    h1: 'Convert HTML to PDF Online',
    description: 'Convert HTML documents and styled web pages into printable PDF documents.',
    metaDescription: 'Convert HTML files to PDF online. Renders HTML structures and text into clean PDF pages.',
    category: 'document',
    acceptedExtensions: ['.html', '.htm'],
    acceptedMimeTypes: ['text/html'],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: false,
    maxFiles: 1,
    maxFileSizeMb: 15,
    features: ['Converts HTML markup into structured PDF', 'Preserves headings and paragraphs', 'Clean printable page rendering'],
    steps: [
      { step: 1, title: 'Upload HTML', description: 'Select your .html file.' },
      { step: 2, title: 'Convert', description: 'FormatFlow parses markup and styles.' },
      { step: 3, title: 'Download PDF', description: 'Save your PDF output.' }
    ],
    faqs: [
      { question: 'Are external CSS sheets loaded?', answer: 'Inline and embedded styles within the HTML file are processed.' }
    ],
    supportedOptions: ['pdfPageSize']
  },
  {
    slug: 'docx-to-pdf',
    title: 'DOCX to PDF Converter — Word Documents to PDF',
    shortTitle: 'DOCX to PDF',
    h1: 'Convert DOCX to PDF Online',
    description: 'Convert Microsoft Word (.docx) documents into standard PDF files. Preserves layouts, tables, and typography.',
    metaDescription: 'Convert Word DOCX to PDF online for free. Preserves document formatting and layout accurately.',
    category: 'document',
    acceptedExtensions: ['.docx', '.doc'],
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
    outputFormats: ['pdf'],
    defaultOutputFormat: 'pdf',
    isMultiFile: true,
    maxFiles: 5,
    maxFileSizeMb: 25,
    badge: 'Popular',
    features: ['High-fidelity office document rendering', 'Preserves tables, lists, and images', 'Powered by headless document engine'],
    steps: [
      { step: 1, title: 'Upload DOCX', description: 'Select your Microsoft Word file.' },
      { step: 2, title: 'Process', description: 'Render document pages to vector PDF.' },
      { step: 3, title: 'Download PDF', description: 'Save your print-ready PDF.' }
    ],
    faqs: [
      { question: 'What engine converts DOCX files?', answer: 'FormatFlow uses server-side headless LibreOffice or native document parser when deployed. Complex macros and dynamic VBA fields are sanitized for safety.' }
    ],
    supportedOptions: []
  }
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOL_CATALOG.filter((t) => t.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOL_CATALOG.filter((t) => t.badge === 'Popular');
}
