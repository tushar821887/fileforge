import { Component, input, output, inject, signal } from '@angular/core';
import type { ConversionJobResult } from '@formatflow/shared';
import { ApiService } from '../../core/services/api.service.js';

@Component({
  selector: 'app-result-card',
  standalone: true,
  template: `
    <div class="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm my-6 animate-fade-in">
      <div class="flex items-start justify-between flex-wrap gap-4">
        <!-- Success indicator and details -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-base font-bold text-slate-900">{{ job().convertedFilename || 'Converted File' }}</h4>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Ready
              </span>
            </div>

            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Original: {{ formatSize(job().originalSize) }}</span>
              <span>→</span>
              <span class="font-semibold text-slate-800">
                {{ formatSize(job().convertedSize || 0) }}
              </span>

              @if (getSavingsPercent() > 0) {
                <span class="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  -{{ getSavingsPercent() }}% saved!
                </span>
              }
            </div>

            @if (job().metadata) {
              <div class="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-2">
                @if (job().metadata?.['pageCount']) {
                  <span class="bg-slate-100 px-2 py-0.5 rounded font-medium">Pages: {{ job().metadata?.['pageCount'] }}</span>
                }
                @if (job().metadata?.['width'] && job().metadata?.['height']) {
                  <span class="bg-slate-100 px-2 py-0.5 rounded font-medium">Dimensions: {{ job().metadata?.['width'] }} × {{ job().metadata?.['height'] }} px</span>
                }
                @if (job().metadata?.['message']) {
                  <span class="text-slate-600 italic">{{ job().metadata?.['message'] }}</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 sm:self-center w-full sm:w-auto">
          <a
            [href]="getDownloadUrl()"
            download
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>

          <!-- Instant Delete Button -->
          <button
            type="button"
            (click)="onDelete()"
            [disabled]="isDeleting()"
            class="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Permanently delete from server right now"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      @if (deletedMessage()) {
        <div class="mt-3 text-xs text-rose-600 font-medium">
          {{ deletedMessage() }}
        </div>
      }
    </div>
  `,
})
export class ResultCardComponent {
  job = input.required<ConversionJobResult>();
  convertAnother = output<void>();

  private readonly apiService = inject(ApiService);
  isDeleting = signal(false);
  deletedMessage = signal<string | null>(null);

  getDownloadUrl(): string {
    return this.apiService.getDownloadUrl(this.job().jobId);
  }

  getSavingsPercent(): number {
    const orig = this.job().originalSize;
    const conv = this.job().convertedSize;
    if (!conv || orig <= conv) return 0;
    return Math.round(((orig - conv) / orig) * 100);
  }

  onDelete(): void {
    if (confirm('Permanently purge this converted file from the server immediately?')) {
      this.isDeleting.set(true);
      this.apiService.deleteJob(this.job().jobId).subscribe({
        next: () => {
          this.deletedMessage.set('File successfully deleted from server.');
          this.isDeleting.set(false);
        },
        error: () => {
          this.deletedMessage.set('File was already removed or expired.');
          this.isDeleting.set(false);
        },
      });
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
