import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-dropzone',
  standalone: true,
  template: `
    <div class="w-full">
      <!-- Drag & Drop Container -->
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        [class.border-blue-500]="isDragging()"
        [class.bg-blue-50/60]="isDragging()"
        class="relative border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all rounded-2xl p-8 sm:p-12 text-center cursor-pointer group bg-white shadow-sm"
      >
        <input
          #fileInput
          type="file"
          class="hidden"
          [multiple]="isMultiFile()"
          [accept]="acceptedExtensionsString()"
          (change)="onFileSelected($event)"
        />

        <div class="flex flex-col items-center justify-center pointer-events-none">
          <div class="w-16 h-16 mb-4 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h3 class="text-lg font-bold text-slate-800 mb-1">
            Choose files or drag & drop here
          </h3>

          <p class="text-xs text-slate-500 max-w-sm mb-4">
            Supports: {{ acceptedExtensionsString() }} (up to {{ maxFileSizeMb() }}MB{{ isMultiFile() ? ', multi-file supported' : '' }})
          </p>

          <span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Browse Files
          </span>
        </div>
      </div>

      <!-- Selected Files Preview List -->
      @if (selectedFiles().length > 0) {
        <div class="mt-4 space-y-3">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span class="flex items-center gap-1.5">
              <span>SELECTED ({{ selectedFiles().length }})</span>
              <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Click preview thumbnail to enlarge
              </span>
            </span>
            <button (click)="clearFiles()" type="button" class="text-rose-600 hover:underline">Clear all</button>
          </div>

          <!-- Featured Single Image Large Preview when only 1 image uploaded -->
          @if (selectedFiles().length === 1 && isImageFile(selectedFiles()[0])) {
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4">
              <div
                (click)="openPreviewModal(selectedFiles()[0], $event)"
                class="relative w-full sm:w-48 h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer group shrink-0 flex items-center justify-center shadow-inner"
              >
                <img
                  [src]="getPreviewUrl(selectedFiles()[0])"
                  class="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  [alt]="selectedFiles()[0].name"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span>Zoom Preview</span>
                </div>
              </div>

              <div class="flex-1 w-full flex flex-col justify-between self-stretch">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {{ getExtension(selectedFiles()[0].name) }}
                    </span>
                    <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Image Preview Ready
                    </span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-800 break-all mb-1">{{ selectedFiles()[0].name }}</h4>
                  <p class="text-xs text-slate-500">{{ formatSize(selectedFiles()[0].size) }}</p>
                </div>

                <div class="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    (click)="openPreviewModal(selectedFiles()[0], $event)"
                    class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Full Preview
                  </button>

                  <button
                    type="button"
                    (click)="removeFile(0, $event)"
                    class="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <!-- Multi-file or compact grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (file of selectedFiles(); track file.name; let idx = $index) {
                <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <!-- Real Image Thumbnail Preview -->
                    <div
                      (click)="isImageFile(file) && openPreviewModal(file, $event)"
                      [class.cursor-pointer]="isImageFile(file)"
                      class="relative w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 shadow-2xs group/thumb"
                    >
                      @if (isImageFile(file)) {
                        <img
                          [src]="getPreviewUrl(file)"
                          class="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                          [alt]="file.name"
                        />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      } @else {
                        <span class="font-bold text-xs uppercase text-slate-600">{{ getExtension(file.name) }}</span>
                      }
                    </div>

                    <div class="truncate">
                      <p class="text-xs font-semibold text-slate-800 truncate">{{ file.name }}</p>
                      <div class="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>{{ formatSize(file.size) }}</span>
                        @if (isImageFile(file)) {
                          <span class="text-blue-600 font-medium">• Preview</span>
                        }
                      </div>
                    </div>
                  </div>

                  <button
                    (click)="removeFile(idx, $event)"
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- FULL IMAGE PREVIEW MODAL / LIGHTBOX -->
      @if (activePreviewFile(); as modalFile) {
        <div
          class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          (click)="closePreviewModal()"
        >
          <div
            class="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-100 text-blue-800">
                  {{ getExtension(modalFile.name) }}
                </span>
                <h4 class="text-sm font-bold text-slate-900 truncate max-w-md">{{ modalFile.name }}</h4>
                <span class="text-xs text-slate-400">({{ formatSize(modalFile.size) }})</span>
              </div>

              <button
                (click)="closePreviewModal()"
                type="button"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Image View -->
            <div class="flex items-center justify-center max-h-[70vh] overflow-hidden bg-slate-900/5 rounded-2xl p-4">
              <img
                [src]="getPreviewUrl(modalFile)"
                class="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                [alt]="modalFile.name"
              />
            </div>

            <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Original uploaded image preview</span>
              <button
                (click)="closePreviewModal()"
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DropzoneComponent {
  isMultiFile = input<boolean>(true);
  acceptedExtensions = input<string[]>([]);
  maxFileSizeMb = input<number>(50);

  filesSelected = output<File[]>();

  isDragging = signal(false);
  selectedFiles = signal<File[]>([]);
  activePreviewFile = signal<File | null>(null);

  private previewUrlCache = new Map<File, string>();

  acceptedExtensionsString(): string {
    const list = this.acceptedExtensions();
    return list && list.length > 0 ? list.join(', ') : 'All supported formats';
  }

  isImageFile(file: File): boolean {
    if (file.type && file.type.startsWith('image/')) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif', 'bmp', 'gif', 'svg'].includes(ext || '');
  }

  getPreviewUrl(file: File): string {
    if (!this.previewUrlCache.has(file)) {
      this.previewUrlCache.set(file, URL.createObjectURL(file));
    }
    return this.previewUrlCache.get(file)!;
  }

  openPreviewModal(file: File, e?: MouseEvent): void {
    if (e) e.stopPropagation();
    this.activePreviewFile.set(file);
  }

  closePreviewModal(): void {
    this.activePreviewFile.set(null);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      this.handleFiles(Array.from(e.dataTransfer.files));
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Reset input so same file can be re-selected if needed
    }
  }

  handleFiles(incomingFiles: File[]): void {
    if (!this.isMultiFile()) {
      this.selectedFiles.set(incomingFiles.slice(0, 1));
    } else {
      this.selectedFiles.update((curr) => [...curr, ...incomingFiles]);
    }
    this.filesSelected.emit(this.selectedFiles());
  }

  removeFile(index: number, e: MouseEvent): void {
    e.stopPropagation();
    const removed = this.selectedFiles()[index];
    if (removed && this.previewUrlCache.has(removed)) {
      URL.revokeObjectURL(this.previewUrlCache.get(removed)!);
      this.previewUrlCache.delete(removed);
    }
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.filesSelected.emit(this.selectedFiles());
  }

  clearFiles(): void {
    this.previewUrlCache.forEach((url) => URL.revokeObjectURL(url));
    this.previewUrlCache.clear();
    this.selectedFiles.set([]);
    this.filesSelected.emit([]);
  }

  getExtension(name: string): string {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() || '' : 'file';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
