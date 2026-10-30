import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service.js';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-3">
          <span class="w-2 h-2 rounded-full bg-blue-600"></span>
          Engineering & Ethics
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">About FormatFlow</h1>
        <p class="mt-2 text-sm text-slate-500">The modern, privacy-focused online file converter and document studio</p>
      </div>

      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">Our Mission</h2>
          <p>
            FormatFlow was engineered to deliver a clean, fast, and trustworthy online file conversion experience. Traditional file conversion tools are notorious for intrusive popups, deceptive "Download" advertisements, and questionable data collection. FormatFlow solves this with native server-side transformations, strict 60-minute automated file purges, and authentic visual interfaces.
          </p>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">Engineering Architecture</h2>
          <p>
            FormatFlow operates as an enterprise-grade TypeScript monorepo with an Angular standalone frontend and a high-throughput NestJS microservice backend. We leverage native compilation libraries:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li><strong>Sharp (libvips):</strong> High-speed image transcoding for AVIF, WebP, PNG, JPG, and TIFF.</li>
            <li><strong>PDF-lib:</strong> Lossless PDF merging, splitting, rotation, and page extraction.</li>
            <li><strong>SheetJS & OpenXML:</strong> Precise spreadsheet and document format transformations.</li>
            <li><strong>FormatFlow Studio:</strong> Deep presentation and document layout translation that preserves 100% of fonts, geometries, and shapes.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">Advertising Policy & Funding</h2>
          <p>
            FormatFlow is 100% free to use with zero paywalls. To support server infrastructure and engineering costs, we display non-intrusive advertisements managed through <strong>Google Ads and Google AdSense</strong>. We strictly adhere to Google Ads Quality Guidelines:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>All advertisement blocks are explicitly labeled as <em>"Advertisement"</em> or <em>"Sponsored Placement"</em>.</li>
            <li>We never place advertisements disguised as conversion buttons or fake download triggers.</li>
            <li>Users enjoy full control over their cookie and advertising preferences through our GDPR/Google Consent Mode v2 banner.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">Leadership & Contact</h2>
          <p>
            Developed by <strong>Tushar Sharma</strong>, based in Meerut, Uttar Pradesh, India.
            For business collaborations, API licensing, or technical inquiries, please visit our
            <a routerLink="/contact" class="text-blue-600 font-semibold underline">Contact Us</a>
            page or email <a href="mailto:tusharmanusharma@gmail.com" class="text-blue-600 font-semibold underline">tusharmanusharma&#64;gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class AboutComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'About FormatFlow — High-Performance File Conversion Platform',
      description: 'Learn about FormatFlow mission, modern architecture, privacy guarantee, and advertising compliance.',
      canonicalPath: '/about',
      keywords: ['about formatflow', 'online file converter', 'privacy file tools', 'formatflow architecture'],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About FormatFlow',
        description: 'Modern, privacy-focused online file converter and document studio.',
        mainEntity: {
          '@type': 'Organization',
          name: 'FormatFlow',
          url: 'https://formatflow.app',
        },
      },
    });
  }
}
