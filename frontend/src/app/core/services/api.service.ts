import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type {
  ConversionJobResult,
  BatchConversionResponse,
  ConversionOptions,
  SystemHealthResponse,
  SupportedLanguage,
  TranslationJobResult,
} from '@formatflow/shared';

export interface UploadProgressEvent<T = BatchConversionResponse> {
  type: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private get baseUrl(): string {
    if (typeof window !== 'undefined') {
      const customUrl = (window as any).__API_URL__;
      if (customUrl && typeof customUrl === 'string' && customUrl.trim().length > 0) {
        return customUrl.trim().replace(/\/+$/, '');
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return window.location.origin;
    }
    return 'http://localhost:3000';
  }

  getDownloadUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/conversions/${jobId}/download`;
  }

  getTranslationFileUrl(jobId: string, langCode: string): string {
    return `${this.baseUrl}/api/v1/translate/${jobId}/download/${langCode}`;
  }

  getTranslationZipUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/translate/${jobId}/download-all`;
  }

  convertFilesWithProgress(
    toolSlug: string,
    files: File[],
    options: ConversionOptions = {}
  ): Observable<UploadProgressEvent<BatchConversionResponse>> {
    const formData = new FormData();
    formData.append('toolSlug', toolSlug);
    formData.append('options', JSON.stringify(options));

    for (const file of files) {
      formData.append('files', file, file.name);
    }

    const req = new HttpRequest('POST', `${this.baseUrl}/api/v1/conversions`, formData, {
      reportProgress: true,
    });

    return this.http.request<BatchConversionResponse>(req).pipe(
      map((event: HttpEvent<BatchConversionResponse>): UploadProgressEvent<BatchConversionResponse> => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 50;
            return {
              type: 'uploading',
              progress: Math.min(95, percent),
            };

          case HttpEventType.Response:
            return {
              type: 'completed',
              progress: 100,
              result: event.body ?? undefined,
            };

          default:
            return {
              type: 'processing',
              progress: 95,
            };
        }
      })
    );
  }

  getJobStatus(jobId: string): Observable<ConversionJobResult> {
    return this.http.get<ConversionJobResult>(`${this.baseUrl}/api/v1/conversions/${jobId}`);
  }

  deleteJob(jobId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/api/v1/conversions/${jobId}`
    );
  }

  getHealth(): Observable<SystemHealthResponse> {
    return this.http.get<SystemHealthResponse>(`${this.baseUrl}/api/v1/health`);
  }

  sendContactMessage(data: { name: string; email?: string; phone?: string; message: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/v1/contact`, data);
  }

  // --- FormatFlow Studio Translation API ---

  getSupportedLanguages(): Observable<SupportedLanguage[]> {
    return this.http.get<SupportedLanguage[]>(`${this.baseUrl}/api/v1/translate/languages`);
  }

  translateDocument(
    file: File,
    targetLanguages: string[]
  ): Observable<UploadProgressEvent<TranslationJobResult>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('targetLanguages', JSON.stringify(targetLanguages));

    const req = new HttpRequest('POST', `${this.baseUrl}/api/v1/translate`, formData, {
      reportProgress: true,
    });

    return this.http.request<TranslationJobResult>(req).pipe(
      map((event: HttpEvent<TranslationJobResult>): UploadProgressEvent<TranslationJobResult> => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 30;
            return {
              type: 'uploading',
              progress: Math.min(60, percent),
            };

          case HttpEventType.Response:
            return {
              type: 'completed',
              progress: 100,
              result: event.body ?? undefined,
            };

          default:
            return {
              type: 'processing',
              progress: 85,
            };
        }
      })
    );
  }

  getTranslationStatus(jobId: string): Observable<TranslationJobResult> {
    return this.http.get<TranslationJobResult>(`${this.baseUrl}/api/v1/translate/${jobId}`);
  }

  deleteTranslationJob(jobId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/api/v1/translate/${jobId}`
    );
  }

  getSamplePresentationBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/v1/translate/sample-presentation`, {
      responseType: 'blob',
    });
  }
}
