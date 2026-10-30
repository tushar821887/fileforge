import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ConversionOptions } from '@formatflow/shared';

@Component({
  selector: 'app-options-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (hasAnyOption()) {
      <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-6">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {{ isCompressor() ? 'Compression Settings' : 'Conversion Settings' }}
            </h4>
          </div>

          @if (isCompressor() && files().length > 0) {
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Size Estimator Active
            </span>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quality Slider -->
          @if (supports('quality')) {
            <div [class.col-span-1]="!isCompressor()" [class.md:col-span-2]="isCompressor()">
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-semibold text-slate-700">
                  {{ isCompressor() ? 'Compression Level / Output Quality' : 'Output Quality' }}
                </label>
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                  {{ options.quality }}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                [(ngModel)]="options.quality"
                (ngModelChange)="emitChange()"
                class="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>Maximum Compression (Smaller Size)</span>
                <span>Balanced (85%)</span>
                <span>Maximum Quality (Larger Size)</span>
              </div>

              <!-- DYNAMIC ESTIMATED SIZE AFTER COMPRESS -->
              @if (isCompressor() && files().length > 0) {
                <div class="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200 shadow-2xs">
                  <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                          Size of Image After Compress
                        </span>
                        <span class="text-[11px] text-slate-500">
                          Estimated at {{ options.quality }}% quality
                        </span>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="flex items-center justify-end gap-2">
                        <span class="text-xs text-slate-400 line-through">
                          {{ formatSize(totalOriginalSize()) }}
                        </span>
                        <span class="text-lg font-black text-blue-700">
                          ~{{ formatSize(totalEstimatedCompressedSize()) }}
                        </span>
                      </div>
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <svg class="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        ~{{ estimatedSavingsPercent() }}% reduction
                      </span>
                    </div>
                  </div>

                  <!-- Per-file breakdown if multiple files uploaded -->
                  @if (files().length > 1) {
                    <div class="mt-3 pt-3 border-t border-blue-200/60 space-y-1.5 max-h-36 overflow-y-auto">
                      @for (file of files(); track file.name) {
                        <div class="flex items-center justify-between text-xs text-slate-600">
                          <span class="truncate max-w-[200px] font-medium">{{ file.name }}</span>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <span class="text-slate-400 line-through text-[11px]">{{ formatSize(file.size) }}</span>
                            <span>→</span>
                            <span class="font-bold text-blue-700">~{{ formatSize(estimateCompressedSize(file.size)) }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Background Color for JPG -->
          @if (supports('backgroundColor')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Background Fill Color (Transparent Areas)</label>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  [(ngModel)]="options.backgroundColor"
                  (ngModelChange)="emitChange()"
                  class="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  [(ngModel)]="options.backgroundColor"
                  (ngModelChange)="emitChange()"
                  placeholder="#FFFFFF"
                  class="px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 w-28 uppercase"
                />
                <button
                  type="button"
                  (click)="setColor('#FFFFFF')"
                  class="px-2 py-1 text-xs rounded border border-slate-200 bg-slate-50 hover:bg-slate-100"
                >
                  White
                </button>
                <button
                  type="button"
                  (click)="setColor('#000000')"
                  class="px-2 py-1 text-xs rounded border border-slate-200 bg-slate-50 hover:bg-slate-100"
                >
                  Black
                </button>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">JPG has no alpha transparency channel; transparent areas become this color.</p>
            </div>
          }

          <!-- Resize Width & Height -->
          @if (supports('width') || supports('height')) {
            <div class="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Target Width (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  [(ngModel)]="options.width"
                  (ngModelChange)="emitChange()"
                  class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Target Height (px)</label>
                <input
                  type="number"
                  placeholder="Auto"
                  [(ngModel)]="options.height"
                  (ngModelChange)="emitChange()"
                  class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500"
                />
              </div>
              <div class="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="aspectLock"
                  [(ngModel)]="options.maintainAspectRatio"
                  (ngModelChange)="emitChange()"
                  class="rounded text-blue-600 focus:ring-blue-500"
                />
                <label for="aspectLock" class="text-xs text-slate-700 font-medium">Keep Ratio</label>
              </div>
            </div>
          }

          <!-- Rotate Angle -->
          @if (supports('rotateAngle')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">Rotate Angle</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="setRotate(90)"
                  [class.bg-blue-600]="options.rotateAngle === 90"
                  [class.text-white]="options.rotateAngle === 90"
                  class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:border-blue-500"
                >
                  90° CW
                </button>
                <button
                  type="button"
                  (click)="setRotate(180)"
                  [class.bg-blue-600]="options.rotateAngle === 180"
                  [class.text-white]="options.rotateAngle === 180"
                  class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:border-blue-500"
                >
                  180° Flip
                </button>
                <button
                  type="button"
                  (click)="setRotate(270)"
                  [class.bg-blue-600]="options.rotateAngle === 270"
                  [class.text-white]="options.rotateAngle === 270"
                  class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:border-blue-500"
                >
                  270° CCW
                </button>
              </div>
            </div>
          }

          <!-- PDF Page Size -->
          @if (supports('pdfPageSize')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">Page Size</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="setPdfSize('A4')"
                  [class.bg-blue-600]="options.pdfPageSize === 'A4'"
                  [class.text-white]="options.pdfPageSize === 'A4'"
                  class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  A4
                </button>
                <button
                  type="button"
                  (click)="setPdfSize('LETTER')"
                  [class.bg-blue-600]="options.pdfPageSize === 'LETTER'"
                  [class.text-white]="options.pdfPageSize === 'LETTER'"
                  class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  Letter
                </button>
                <button
                  type="button"
                  (click)="setPdfSize('AUTO')"
                  [class.bg-blue-600]="options.pdfPageSize === 'AUTO'"
                  [class.text-white]="options.pdfPageSize === 'AUTO'"
                  class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  Fit to Image
                </button>
              </div>
            </div>
          }

          <!-- PDF Orientation -->
          @if (supports('pdfOrientation')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-2">Page Orientation</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="setPdfOrientation('portrait')"
                  [class.bg-blue-600]="options.pdfOrientation === 'portrait'"
                  [class.text-white]="options.pdfOrientation === 'portrait'"
                  class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  Portrait
                </button>
                <button
                  type="button"
                  (click)="setPdfOrientation('landscape')"
                  [class.bg-blue-600]="options.pdfOrientation === 'landscape'"
                  [class.text-white]="options.pdfOrientation === 'landscape'"
                  class="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  Landscape
                </button>
              </div>
            </div>
          }

          <!-- PDF Page Range -->
          @if (supports('pageRanges')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Page Ranges (e.g. 1, 3-5)</label>
              <input
                type="text"
                placeholder="All pages, or 1, 3-5"
                [(ngModel)]="options.pageRanges"
                (ngModelChange)="emitChange()"
                class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500"
              />
              <p class="text-[11px] text-slate-500 mt-1">Specify comma-separated pages or range with hyphen.</p>
            </div>
          }

          <!-- CSV Delimiter -->
          @if (supports('csvDelimiter')) {
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">CSV Delimiter</label>
              <select
                [(ngModel)]="options.csvDelimiter"
                (ngModelChange)="emitChange()"
                class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab</option>
              </select>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class OptionsPanelComponent {
  supportedOptions = input<(keyof ConversionOptions)[]>([]);
  toolSlug = input<string>('');
  files = input<File[]>([]);
  optionsChange = output<ConversionOptions>();

  options: ConversionOptions = {
    quality: 85,
    backgroundColor: '#ffffff',
    maintainAspectRatio: true,
    pdfPageSize: 'A4',
    pdfOrientation: 'portrait',
    pdfMargin: 20,
    rotateAngle: 90,
    csvDelimiter: ',',
  };

  isCompressor = computed(() => this.toolSlug() === 'image-compressor');

  totalOriginalSize = computed(() => {
    return this.files().reduce((sum, f) => sum + f.size, 0);
  });

  hasAnyOption(): boolean {
    return this.supportedOptions().length > 0;
  }

  supports(key: keyof ConversionOptions): boolean {
    return this.supportedOptions().includes(key);
  }

  getEstimatedFactor(quality: number): number {
    const q = Math.max(10, Math.min(100, quality));
    if (q >= 85) {
      return 0.35 + (q - 85) * ((0.85 - 0.35) / 15);
    } else {
      return 0.06 + Math.pow((q - 10) / 75, 1.5) * (0.35 - 0.06);
    }
  }

  estimateCompressedSize(fileSizeBytes: number): number {
    const factor = this.getEstimatedFactor(this.options.quality ?? 85);
    const est = Math.round(fileSizeBytes * factor);
    return Math.min(fileSizeBytes, Math.max(500, est));
  }

  totalEstimatedCompressedSize(): number {
    return this.files().reduce((acc, f) => acc + this.estimateCompressedSize(f.size), 0);
  }

  estimatedSavingsPercent(): number {
    const orig = this.totalOriginalSize();
    const est = this.totalEstimatedCompressedSize();
    if (orig <= 0 || orig <= est) return 0;
    return Math.round(((orig - est) / orig) * 100);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  setColor(color: string): void {
    this.options.backgroundColor = color;
    this.emitChange();
  }

  setRotate(angle: number): void {
    this.options.rotateAngle = angle;
    this.emitChange();
  }

  setPdfSize(size: 'A4' | 'LETTER' | 'AUTO'): void {
    this.options.pdfPageSize = size;
    this.emitChange();
  }

  setPdfOrientation(orientation: 'portrait' | 'landscape'): void {
    this.options.pdfOrientation = orientation;
    this.emitChange();
  }

  emitChange(): void {
    this.optionsChange.emit({ ...this.options });
  }
}
