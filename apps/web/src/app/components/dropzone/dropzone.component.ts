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
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>SELECTED ({{ selectedFiles().length }})</span>
            <button (click)="clearFiles()" type="button" class="text-rose-600 hover:underline">Clear all</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            @for (file of selectedFiles(); track file.name; let idx = $index) {
              <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs uppercase">
                    {{ getExtension(file.name) }}
                  </div>
                  <div class="truncate">
                    <p class="text-xs font-semibold text-slate-800 truncate">{{ file.name }}</p>
                    <p class="text-[11px] text-slate-500">{{ formatSize(file.size) }}</p>
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

  acceptedExtensionsString(): string {
    const list = this.acceptedExtensions();
    return list && list.length > 0 ? list.join(', ') : 'All supported formats';
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
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.filesSelected.emit(this.selectedFiles());
  }

  clearFiles(): void {
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
