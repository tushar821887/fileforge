import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service.js';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">About FormatFlow</h1>
        <p class="mt-2 text-sm text-slate-500">The modern, privacy-focused online file converter</p>
      </div>

      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 class="text-base font-bold text-slate-900">Our Mission</h2>
        <p>
          FormatFlow was engineered to deliver a clean, fast, and trustworthy online file conversion experience. Unlike traditional conversion websites covered in aggressive popups and misleading fake download links, FormatFlow provides authentic server-side conversions with clean interfaces and guaranteed privacy.
        </p>

        <h2 class="text-base font-bold text-slate-900 pt-4">Engineering Architecture</h2>
        <p>
          Built as a modern TypeScript monorepo with an Angular frontend and a NestJS backend running Sharp (libvips), PDF-lib, and SheetJS. Every conversion is verified with binary file signatures to guarantee security and optimal fidelity.
        </p>
      </div>
    </div>
  `,
})
export class AboutComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'About FormatFlow — Fast, Private Online Conversion Platform',
      description: 'Learn about FormatFlow mission, modern architecture, and privacy-first engineering.',
      canonicalPath: '/about',
    });
  }
}
