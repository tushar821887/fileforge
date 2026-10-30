import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <!-- Col 1: Brand & Philosophy -->
          <div class="col-span-2">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <span class="text-xl font-bold tracking-tight text-white">FormatFlow</span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed max-w-sm mb-4">
              FormatFlow is a free, lightning-fast file converter built for privacy. We process images, PDFs, and documents natively on high-speed servers and automatically purge all files within 60 minutes.
            </p>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All conversion engines running</span>
            </div>
          </div>

          <!-- Col 2: Image Tools -->
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-white mb-3">Image Tools</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/tools/jpg-to-png" class="hover:text-white transition-colors">JPG to PNG</a></li>
              <li><a routerLink="/tools/png-to-jpg" class="hover:text-white transition-colors">PNG to JPG</a></li>
              <li><a routerLink="/tools/jpg-to-webp" class="hover:text-white transition-colors">JPG to WebP</a></li>
              <li><a routerLink="/tools/png-to-webp" class="hover:text-white transition-colors">PNG to WebP</a></li>
              <li><a routerLink="/tools/image-compressor" class="hover:text-white transition-colors">Compress Image</a></li>
              <li><a routerLink="/tools/image-resizer" class="hover:text-white transition-colors">Resize Image</a></li>
            </ul>
          </div>

          <!-- Col 3: PDF Tools -->
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-white mb-3">PDF Tools</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/tools/merge-pdf" class="hover:text-white transition-colors">Merge PDF</a></li>
              <li><a routerLink="/tools/split-pdf" class="hover:text-white transition-colors">Split PDF</a></li>
              <li><a routerLink="/tools/compress-pdf" class="hover:text-white transition-colors">Compress PDF</a></li>
              <li><a routerLink="/tools/jpg-to-pdf" class="hover:text-white transition-colors">JPG to PDF</a></li>
              <li><a routerLink="/tools/images-to-pdf" class="hover:text-white transition-colors">Images to PDF</a></li>
              <li><a routerLink="/tools/rotate-pdf-pages" class="hover:text-white transition-colors">Rotate PDF</a></li>
            </ul>
          </div>

          <!-- Col 4: Document & Legal -->
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-white mb-3">Platform</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/tools/csv-to-xlsx" class="hover:text-white transition-colors">CSV to XLSX</a></li>
              <li><a routerLink="/tools/xlsx-to-csv" class="hover:text-white transition-colors">XLSX to CSV</a></li>
              <li><a routerLink="/tools/txt-to-pdf" class="hover:text-white transition-colors">TXT to PDF</a></li>
              <li><a routerLink="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a routerLink="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a routerLink="/about" class="hover:text-white transition-colors">About FormatFlow</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 FormatFlow. Free online file converter. Built for speed and strict privacy.</p>
          <div class="flex items-center gap-4 mt-4 sm:mt-0">
            <span>No files stored permanently</span>
            <span>•</span>
            <span>Zero trackers</span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
