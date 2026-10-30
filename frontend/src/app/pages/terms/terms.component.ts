import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service.js';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p class="mt-2 text-sm text-slate-500">Last updated: October 30, 2026 • Governing terms for FormatFlow</p>
      </div>

      <div class="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">1. Acceptance of Terms</h2>
          <p>
            By accessing, browsing, or using FormatFlow ("Service", "we", "our"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you may not use the Service.
          </p>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">2. Permitted Use & Acceptable Use Policy</h2>
          <p>
            FormatFlow provides free, automated online file conversion, compression, merging, and document translation. You agree not to upload:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>Malicious software, viruses, worms, trojans, or corrupted zip archives ("decompression bombs").</li>
            <li>Files containing unlawful, harmful, defamatory, or infringing content.</li>
            <li>Any automated scripts or scrapers designed to overload or bypass server rate limits.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">3. Intellectual Property & File Ownership</h2>
          <p>
            <strong>You retain 100% full ownership and copyright of all files you upload to FormatFlow.</strong>
            FormatFlow does not claim any intellectual property rights or licensing over your files, spreadsheets, images, or presentations. Files exist on our systems solely for the automated duration required to complete the transformation (maximum 60 minutes).
          </p>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">4. Third-Party Advertising & Google Ads Disclaimer</h2>
          <p>
            To provide free services to the public, FormatFlow displays third-party advertisements served by <strong>Google Ads, Google AdSense, and certified advertising networks</strong>.
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>All advertisement placements are clearly labeled as "Advertisement" or "Sponsored" to prevent confusion.</li>
            <li>FormatFlow does not endorse, guarantee, or assume liability for the products, software, or claims advertised by third-party sponsors.</li>
            <li>Any interaction or purchase made through an advertiser link is strictly between you and that third party.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">5. Disclaimer of Warranties</h2>
          <p>
            FormatFlow is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we employ industry-standard libraries (Sharp, PDF-lib, SheetJS), we do not guarantee that file conversions will be 100% identical in every esoteric edge case or that service will be uninterrupted.
          </p>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">6. Limitation of Liability</h2>
          <p>
            In no event shall FormatFlow or its developers be liable for any indirect, incidental, consequential, special, or punitive damages resulting from your use of or inability to use the Service or loss of data.
          </p>
        </section>

        <section>
          <h2 class="text-base font-bold text-slate-900 mb-1.5">7. Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
            <br>
            <strong>Address:</strong> 127, Bhatwara, Bagh Wali Gali, Meerut - 250002, Uttar Pradesh, India
            <br>
            <strong>Email:</strong> <a href="mailto:tusharmanusharma@gmail.com" class="text-blue-600 underline">tusharmanusharma&#64;gmail.com</a>
            <br>
            <strong>Phone:</strong> <a href="tel:8218870579" class="text-blue-600 underline">+91 8218870579</a>
          </p>
        </section>
      </div>
    </div>
  `,
})
export class TermsComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Terms of Service — Transparent Free Conversion Terms',
      description: 'Terms and conditions for using the FormatFlow free online file conversion and document studio platform.',
      canonicalPath: '/terms',
      keywords: ['terms of service', 'terms and conditions', 'formatflow terms', 'file converter acceptable use'],
    });
  }
}
