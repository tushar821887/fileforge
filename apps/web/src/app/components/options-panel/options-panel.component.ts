import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ConversionOptions } from '@formatflow/shared';

@Component({
  selector: 'app-options-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (hasAnyOption()) {
      <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-6">
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Conversion Settings</h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quality Slider -->
          @if (supports('quality')) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-semibold text-slate-700">Output Quality</label>
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
                class="w-full accent-blue-600 cursor-pointer"
              />
              <p class="text-[11px] text-slate-500 mt-1">Higher quality increases clarity and file size.</p>
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

  hasAnyOption(): boolean {
    return this.supportedOptions().length > 0;
  }

  supports(key: keyof ConversionOptions): boolean {
    return this.supportedOptions().includes(key);
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
