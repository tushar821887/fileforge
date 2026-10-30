# FormatFlow — Free Online File Converter

> **FormatFlow** is a modern, blazing-fast, and privacy-first online file conversion platform. It empowers users to convert popular image formats, merge/split/compress PDFs, and transcode spreadsheets and documents with genuine, high-fidelity conversions and zero watermarks.

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular)](https://angular.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Key Highlights

- **Real, High-Fidelity Conversions**: Powered by native server-side engines (`sharp` for libvips image processing, `pdf-lib` for structural PDF manipulation, and `xlsx` for spreadsheets). No simulated extensions or fake conversions.
- **Privacy First & Automated Purge**: All uploaded and converted files are automatically purged after 60 minutes. An instant "Delete Now" button allows immediate file shredding.
- **Security Hardened**: Binary file signature (magic bytes) validation prevents disguised executables, randomized UUIDv4 storage namespaces prevent directory traversal, and rate limiting protects against DoS.
- **Modern Angular Architecture**: Standalone components, lazy loading per tool route, Tailwind CSS v4 styling, and dynamic SEO management (canonical URLs, OpenGraph, JSON-LD structured data).
- **AdSense & Monetization Ready**: Non-intrusive, styled ad slots prepared for monetization without interfering with file upload or download buttons.

---

## 📁 Monorepo Structure

```
formatflow/
├── backend/                     # NestJS TypeScript backend API
│   ├── src/
│   │   ├── config/              # Environment configuration
│   │   ├── modules/
│   │   │   ├── conversion/      # Engines (sharp, pdf-lib, xlsx, doc) & controllers
│   │   │   ├── health/          # Uptime and engine status monitoring
│   │   │   ├── storage/         # UUID storage management & 60m cleanup daemon
│   │   │   ├── tools/           # Tool catalog & format capabilities
│   │   │   ├── translation/     # FormatFlow Studio document translator
│   │   │   └── validator/       # Binary file signature (magic bytes) validation
│   │   └── main.ts              # Server entry point & Swagger documentation
│   ├── Dockerfile               # Docker container with headless LibreOffice
│   └── package.json
│
├── frontend/                    # Angular 22 Standalone application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Navbar, Footer, CookieConsent, Dropzone, Options, Result
│   │   │   ├── core/            # ApiService, SeoService, CookieConsentService
│   │   │   ├── pages/           # Home, Studio, ToolPage, Privacy, Terms, About, Contact
│   │   │   └── app.routes.ts    # Lazy-loaded routes
│   │   ├── public/              # sitemap.xml, robots.txt, ads.txt, manifest.webmanifest
│   │   └── styles.css           # Tailwind CSS v4 styling
│   ├── Dockerfile               # Multi-stage Nginx container
│   └── package.json
│
├── packages/
│   └── shared/                  # Common TypeScript interfaces & tool catalog
├── docs/                        # Architecture & API specifications
├── docker-compose.yml           # Production multi-container orchestration
├── .env.example                 # Configuration template
└── package.json                 # Monorepo workspaces
```

---

## 🛠️ Supported Tools & Capabilities

### 🖼️ Image Tools (Powered by `sharp`)
| Tool | Input Formats | Output Format | Options & Features |
| :--- | :--- | :--- | :--- |
| **JPG to PNG** | `.jpg`, `.jpeg` | `.png` | Lossless 24-bit PNG output |
| **PNG to JPG** | `.png` | `.jpg` | Quality slider (1-100), transparent background color fill |
| **PNG to WebP** | `.png` | `.webp` | Preserves alpha transparency, cuts size by up to 35% |
| **WebP to PNG** | `.webp` | `.png` | Universal PNG compatibility |
| **JPG to WebP** | `.jpg`, `.jpeg` | `.webp` | Next-gen Google WebP compression |
| **WebP to JPG** | `.webp` | `.jpg` | Adjustable quality and background color |
| **JPG to AVIF** | `.jpg`, `.jpeg` | `.avif` | Ultra-compression with AV1 codec |
| **PNG to AVIF** | `.png` | `.avif` | Transparency with cutting-edge compression |
| **AVIF to PNG** | `.avif` | `.png` | Decodes AVIF to universal PNG |
| **TIFF to JPG/PNG**| `.tif`, `.tiff` | `.jpg`, `.png` | Compresses high-res scanner and camera RAW files |
| **BMP to JPG/PNG** | `.bmp` | `.jpg`, `.png` | Compresses raw Windows bitmaps by up to 95% |
| **GIF to PNG** | `.gif` | `.png` | Extracts sharp 24-bit image frames |
| **SVG to PNG** | `.svg` | `.png` | Vector rasterization with custom dimensions |
| **Image Compressor**| `.jpg`, `.png`, `.webp` | Target format | Intelligent lossy/lossless optimization |
| **Image Resizer** | `.jpg`, `.png`, `.webp` | Target format | Lanczos resampling, aspect ratio locking |
| **Image Rotator** | `.jpg`, `.png`, `.webp` | Target format | 90°, 180°, 270° orientation normalization |
| **Image Cropper** | `.jpg`, `.png`, `.webp` | Target format | Sub-pixel coordinate extraction |
| **Inspect Metadata**| All image formats | `.json` | Inspects dimensions, color space, channels, EXIF |

### 📄 PDF Tools (Powered by `pdf-lib`)
| Tool | Capabilities |
| :--- | :--- |
| **JPG / PNG to PDF** | Convert single or multi-images to PDF with custom margins and A4/Letter sizing |
| **Images to PDF** | Merge up to 30 mixed JPG, PNG, and WebP images into a single multi-page PDF |
| **Merge PDF** | Combine multiple PDFs in sequence into one clean file |
| **Split & Extract PDF** | Extract custom page ranges (e.g. `1, 3-5`) into a new PDF |
| **Rotate PDF Pages** | Permanently correct PDF page orientation by 90°, 180°, or 270° |
| **Reorder PDF Pages** | Rearrange document page sequence cleanly |
| **Compress PDF** | Optimizes object streams and Flate compression, reporting real savings |
| **Inspect PDF** | Reports page count, dimensions (mm & pt), author, title, and creation date |

### 📊 Document Tools (Powered by `xlsx` & LibreOffice)
| Tool | Capabilities |
| :--- | :--- |
| **CSV to XLSX** | Auto-detects delimiters (comma, semicolon, tab) and compiles Excel workbook |
| **XLSX to CSV** | Exports Excel worksheets to clean CSV with custom delimiters |
| **TXT to PDF** | Formats text with automatic line-wrapping, margins, pagination, and Helvetica typography |
| **HTML to PDF** | Strips markup and renders structured PDF documents |
| **DOCX to PDF** | Headless LibreOffice integration in Docker with graceful fallback reporting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0 (tested on Node v22)
- npm >= 10.0.0

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/your-username/formatflow.git
cd formatflow
npm install
```

### 2. Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```

### 3. Run Development Servers
Start both backend API and Angular frontend concurrently:

In Terminal 1 (API Server on port 3000):
```bash
npm run start:api
```

In Terminal 2 (Angular Web UI on port 4200):
```bash
npm run start:web
```

Open your browser at **`http://localhost:4200`** to access the web application.
Open **`http://localhost:3000/api/docs`** for interactive Swagger API documentation.

---

## 🧪 Testing

FormatFlow includes automated unit, integration, and conversion tests verifying actual file signatures, image dimensions, PDF page counts, and security checks:

```bash
# Run backend conversion tests (24 passing tests)
npm run test:api

# Run Angular frontend component tests
npm run test:web
```

---

## 🐳 Docker Deployment

FormatFlow includes a production-ready `docker-compose.yml` that runs the NestJS backend with headless LibreOffice and Poppler utilities, alongside an Nginx web frontend:

```bash
docker compose up --build -d
```

- Web UI: `http://localhost`
- API Backend: `http://localhost:3000`
- API Docs: `http://localhost:3000/api/docs`

---

## 🔒 Security & Privacy

1. **Binary Signature Verification**: Disguised files (e.g., malware with a `.jpg` extension) are rejected via magic byte inspection.
2. **UUID Storage Namespaces**: Files are saved with UUIDv4 filenames inside isolated temporary storage directories, completely preventing path traversal attacks.
3. **Automatic Purge**: Temporary files are permanently unlinked after 60 minutes by a background cron daemon.
4. **Immediate Deletion**: Users can click the trash icon at any time to immediately destroy their files on the server.
5. **Zero Data Mining**: User files are never logged, analyzed, or shared with third parties.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
