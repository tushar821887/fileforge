# FormatFlow — System Architecture & Design Specification

## 1. System Overview

**FormatFlow** is an enterprise-grade, privacy-centric online file conversion platform. It is engineered with a modular TypeScript architecture separating client concerns from server-side conversion engines.

```
                           +------------------------+
                           |  Angular 22 Frontend   |
                           |   (Standalone + SSR)   |
                           +-----------+------------+
                                       |
                                       | HTTP / FormData
                                       v
                           +------------------------+
                           |   NestJS API Gateway   |
                           |  Throttler & Validator |
                           +-----------+------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
+-------------------+        +-------------------+        +-------------------+
|   Image Engine    |        |    PDF Engine     |        |  Document Engine  |
|      (Sharp)      |        |     (pdf-lib)     |        | (XLSX, Headless)  |
+-------------------+        +-------------------+        +-------------------+
          |                            |                            |
          +----------------------------+----------------------------+
                                       |
                                       v
                           +------------------------+
                           |     Secure Storage     |
                           | (UUID / 60m Auto-Purge)|
                           +------------------------+
```

---

## 2. Monorepo Organization

```
formatflow/
├── apps/
│   ├── api/                     # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── config/          # Environment configuration
│   │   │   ├── modules/
│   │   │   │   ├── conversion/  # Conversion controller, service & engines
│   │   │   │   ├── health/      # Uptime & engine health checks
│   │   │   │   ├── storage/     # Temp files, UUID namespacing, cleanup daemon
│   │   │   │   ├── tools/       # Tools catalog & format matrix
│   │   │   │   └── validator/   # File signature (magic bytes) validation
│   │   │   ├── types/           # Multer and file types
│   │   │   ├── app.module.ts    # Main NestJS module
│   │   │   └── main.ts          # Server entry point & Swagger docs
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                     # Angular 22 Frontend Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/  # Navbar, Footer, Dropzone, Options, Progress, Result
│       │   │   ├── core/        # ApiService, SeoService
│       │   │   ├── pages/       # Home, ToolPage, Privacy, Terms, About
│       │   │   ├── app.config.ts# Router & HttpClient configuration
│       │   │   └── app.routes.ts# Lazy-loaded routes
│       │   ├── styles.css       # Tailwind CSS v4 directives
│       │   └── index.html       # Fonts & baseline SEO meta tags
│       ├── public/              # sitemap.xml & robots.txt
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   └── shared/                  # Common TypeScript interfaces & tool catalog
├── docs/                        # Architecture & API specifications
├── docker-compose.yml           # Multi-container orchestration
└── package.json                 # Monorepo workspaces
```

---

## 3. Security Architecture & Threat Model

### 3.1 Untrusted Input Handling
Uploaded files are treated strictly as untrusted binary blobs.
- **Magic Byte Inspection**: The `FileValidatorService` reads binary file headers using `file-type` to detect disguised binaries (e.g., an executable renamed to `.jpg`).
- **Filename Sanitization**: Directory traversal characters (`../`, `..\\`), null bytes (`\0`), and non-printable control characters are stripped before processing.
- **Strict Size Limits**: Files exceeding configured thresholds (default: 50MB) are rejected before reaching conversion pipelines.

### 3.2 Path Traversal Prevention
Files are never referenced by user-supplied paths. Internal files are mapped to UUIDv4 strings and stored strictly within isolated temporary directories:
- `storage/temp/uploads/<jobId>.<ext>`
- `storage/temp/converted/<jobId>_converted.<ext>`

### 3.3 Ephemeral Storage & Retention Policy
- Files are assigned an automatic 60-minute Time-To-Live (TTL).
- A scheduled background daemon runs every 30 minutes via `@nestjs/schedule` to purge expired files.
- Users can click the instant delete button to destroy files immediately upon downloading.
- Zero permanent database persistence of customer assets.

---

## 4. Conversion Engine Architecture

### 4.1 Image Conversion Engine (`sharp`)
- **Libvips Integration**: Highly optimized C++ bindings for blazing fast image transcoding.
- **Alpha Transparency Handling**: Preserved for PNG, WebP, and AVIF. Automatically flattened against configurable background color (default `#FFFFFF`) when converting to JPG.
- **EXIF Normalization**: Automatically reorients photos based on camera EXIF tags (`pipeline.rotate()`).

### 4.2 PDF Engine (`pdf-lib`)
- Pure in-memory vector PDF manipulation.
- Images to PDF: Scaled and centered with customizable page sizes (A4, Letter, Auto), margins, and orientations.
- Merging & Splitting: Lossless page copying preserving document vectors, embedded fonts, and bookmarks.
- PDF Optimization: Strips orphaned metadata headers and compresses object streams with Flate compression.

### 4.3 Document Engine (`xlsx` & LibreOffice)
- CSV <-> XLSX: Full bidirectional parsing with automatic delimiter detection and cell type preservation.
- TXT / HTML to PDF: Automatic line-wrapping, pagination, margins, and typography styling.
- Office to PDF: Headless LibreOffice integration inside Docker containers with clear fallback diagnostics.
