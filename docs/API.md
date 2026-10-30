# FormatFlow — REST API Reference

The FormatFlow API provides a clean RESTful interface for uploading files, triggering native conversions, checking progress, and downloading converted outputs.

Base URL: `http://localhost:3000` (or your production domain)
Interactive Swagger UI: `http://localhost:3000/api/docs`

---

## 1. Conversions

### `POST /api/v1/conversions`
Upload one or more files and initiate a conversion job.

**Headers:**
- `Content-Type: multipart/form-data`

**Form Data Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `toolSlug` | `string` | **Yes** | Slug of the conversion tool (e.g., `jpg-to-png`, `merge-pdf`, `csv-to-xlsx`) |
| `files` | `File[]` | **Yes** | One or multiple files to convert |
| `options` | `string` (JSON) | No | Optional conversion parameters |

**Example `options` JSON:**
```json
{
  "quality": 85,
  "backgroundColor": "#FFFFFF",
  "width": 800,
  "height": 600,
  "pdfPageSize": "A4",
  "pdfOrientation": "portrait",
  "pageRanges": "1, 3-5",
  "csvDelimiter": ","
}
```

**Response (201 Created):**
```json
{
  "batchId": "7b8d4e92-3a81-424a-8d19-3c7263b610c1",
  "jobs": [
    {
      "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "status": "completed",
      "progress": 100,
      "originalFilename": "photo.png",
      "originalSize": 1420500,
      "originalMimeType": "image/png",
      "convertedFilename": "photo.jpg",
      "convertedSize": 285400,
      "convertedMimeType": "image/jpeg",
      "downloadUrl": "/api/v1/conversions/f47ac10b-58cc-4372-a567-0e02b2c3d479/download",
      "createdAt": 1730290000000,
      "expiresAt": 1730293600000
    }
  ]
}
```

---

### `GET /api/v1/conversions/:id`
Check the real-time status and metadata of a conversion job.

**Response (200 OK):**
```json
{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "progress": 100,
  "originalFilename": "document.csv",
  "originalSize": 4500,
  "convertedFilename": "document.xlsx",
  "convertedSize": 9200,
  "downloadUrl": "/api/v1/conversions/f47ac10b-58cc-4372-a567-0e02b2c3d479/download",
  "createdAt": 1730290000000,
  "expiresAt": 1730293600000
}
```

---

### `GET /api/v1/conversions/:id/download`
Download the converted file.

**Response Headers:**
- `Content-Type`: MIME type of converted file
- `Content-Disposition`: `attachment; filename="<filename>"`

---

### `DELETE /api/v1/conversions/:id`
Immediately and permanently purge the uploaded and converted files from the server.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Files and job removed permanently."
}
```

---

## 2. Tools & Health

### `GET /api/v1/tools`
Returns the complete catalog of supported tools, category breakdowns, and capability metadata.

### `GET /api/v1/tools/:slug`
Returns step-by-step instructions, supported options, and FAQs for a specific tool.

### `GET /api/v1/health`
System monitoring endpoint reporting server uptime, active temporary files, and engine availability.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-10-30T12:00:00.000Z",
  "version": "1.0.0",
  "uptimeSeconds": 3600,
  "storage": {
    "tempDirectory": "D:\\Projects\\min\\fileforge\\storage\\temp",
    "retentionMinutes": 60,
    "activeJobsCount": 4
  },
  "engines": {
    "sharp": true,
    "pdfLib": true,
    "xlsx": true,
    "pdfJs": true,
    "libreOffice": true
  }
}
```
