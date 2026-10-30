import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service.js';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Retention & Privacy Guarantee
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy & File Retention Policy
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          Last revised: October 30, 2026 • FormatFlow respects user confidentiality above all else.
        </p>
      </div>

      <div class="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 space-y-6">
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">1. Where Are Files Processed?</h2>
          <p>
            Files uploaded to FormatFlow are processed securely on our dedicated Node.js conversion servers using native libraries (such as Sharp for raster graphics, PDF-lib for PDF manipulation, and SheetJS for spreadsheets).
          </p>
          <p class="mt-2">
            <strong>Transparency Notice:</strong> Files do temporarily leave your browser to be processed on our servers because native image codecs and multi-page PDF rendering require high-speed server hardware. We do not use third-party conversion APIs or cloud brokers.
          </p>
        </section>

        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">2. How Long Are Files Retained?</h2>
          <p>
            All temporary files (both the original uploaded file and the resulting converted file) are governed by our strict <strong>60-minute retention policy</strong>.
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>Our automated background cleanup daemon runs every 30 minutes to delete any file older than 60 minutes.</li>
            <li>Once deleted by the daemon, files are permanently unlinked and cannot be recovered.</li>
          </ul>
        </section>

        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">3. Instant Manual Purge ("Delete Now")</h2>
          <p>
            If you do not want to wait 60 minutes for the automatic cleanup daemon, every conversion result card includes a red <strong>Trash Can (Delete Now)</strong> icon. Clicking this sends an immediate REST API request that immediately unlinks and shreds your uploaded and converted files from our filesystem on the spot.
          </p>
        </section>

        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">4. Zero Content Logging & Data Protection</h2>
          <p>
            FormatFlow never peeks into, analyzes, catalogs, or sells your file contents. We never log PDF passwords, document contents, or personal information. Internal filenames are generated with random UUIDv4 strings so malicious users cannot guess file names or access files belonging to other users.
          </p>
        </section>

        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">5. Third-Party Sharing</h2>
          <p>
            We do not sell, trade, or share user files or metadata with any external advertising networks, machine learning models, or government entities.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class PrivacyComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Privacy & Retention Policy — 100% Secure & Automatic File Purge',
      description:
        'Read FormatFlow transparent file privacy policy. Automatic 60-minute file deletion, instant purge button, zero file logging, and no third-party tracking.',
      canonicalPath: '/privacy',
    });
  }
}
