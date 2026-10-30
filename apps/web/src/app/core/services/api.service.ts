import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type {
  ConversionJobResult,
  BatchConversionResponse,
  ConversionOptions,
  SystemHealthResponse,
} from '@formatflow/shared';

export interface UploadProgressEvent {
  type: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: BatchConversionResponse;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  // Default to relative / proxy or localhost:3000
  private readonly baseUrl = 'http://localhost:3000';

  getDownloadUrl(jobId: string): string {
    return `${this.baseUrl}/api/v1/conversions/${jobId}/download`;
  }

  convertFilesWithProgress(
    toolSlug: string,
    files: File[],
    options: ConversionOptions = {}
  ): Observable<UploadProgressEvent> {
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
      map((event: HttpEvent<BatchConversionResponse>): UploadProgressEvent => {
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

  getContactInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/contact/info`);
  }
}
