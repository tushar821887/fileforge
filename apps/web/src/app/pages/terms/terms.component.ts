import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service.js';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p class="mt-2 text-sm text-slate-500">Last updated: October 30, 2026</p>
      </div>

      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-sm text-slate-700 leading-relaxed">
        <h2 class="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
        <p>By accessing or using FormatFlow, you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the service.</p>

        <h2 class="text-base font-bold text-slate-900 pt-4">2. Permitted Use</h2>
        <p>FormatFlow is intended for legitimate file conversions. You agree not to upload malicious software, corrupted zip bombs, copyrighted materials without authorization, or illegal material.</p>

        <h2 class="text-base font-bold text-slate-900 pt-4">3. Disclaimer of Warranties</h2>
        <p>FormatFlow is provided "as is" without warranty of any kind. While we utilize industry-leading conversion engines (sharp, pdf-lib, xlsx), complex documents and formatting may experience minor rendering variances.</p>
      </div>
    </div>
  `,
})
export class TermsComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Terms of Service',
      description: 'Terms and conditions for using FormatFlow free online file conversion platform.',
      canonicalPath: '/terms',
    });
  }
}
