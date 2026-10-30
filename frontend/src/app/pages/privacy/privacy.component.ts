import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service.js';
import { CookieConsentService } from '../../core/services/cookie-consent.service.js';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Retention & Privacy Guarantee
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Google Ads Compliance
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          Last revised: October 30, 2026 • Full compliance with Google Ads, AdSense, GDPR, CCPA, and ePrivacy.
        </p>
      </div>

      <div class="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 space-y-6">
        <!-- 1. File Handling & Processing Guarantee -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">1. Where & How Are Files Processed?</h2>
          <p>
            Files uploaded to FormatFlow are processed exclusively on high-performance conversion servers using native libraries (such as Sharp for raster images, PDF-lib for PDF manipulation, and SheetJS for spreadsheets).
          </p>
          <p class="mt-2 text-slate-600">
            <strong>Transparency Guarantee:</strong> Uploaded files are strictly used for the requested transformation (conversion, compression, merging, or translation). FormatFlow <strong>never inspects, indexes, mines, or trains artificial intelligence models</strong> on your documents or images.
          </p>
        </section>

        <!-- 2. Retention & Automatic Purge Policy -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">2. How Long Are Files Retained?</h2>
          <p>
            All temporary files (both original uploads and converted outputs) are governed by our strict <strong>60-minute retention policy</strong>.
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>An automated background cleanup daemon runs every 30 minutes, unlinking and permanently wiping any file older than 60 minutes.</li>
            <li><strong>Instant Manual Purge:</strong> Every conversion result card features a red <em>Delete Now (Trash)</em> button that instantly shreds your files from the filesystem on demand.</li>
          </ul>
        </section>

        <!-- 3. Google Ads & Third-Party Advertising Policy -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">3. Google Ads, AdSense & Third-Party Advertising</h2>
          <p>
            FormatFlow is a free service supported by online advertisements. In accordance with <strong>Google Ads Publisher Policies</strong> and <strong>Google AdSense Requirements</strong>, we disclose the following:
          </p>
          <ul class="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>
              Third-party vendors, including <strong>Google</strong>, use cookies to serve ads based on a user's prior visits to this website or other websites on the internet.
            </li>
            <li>
              Google's use of advertising cookies (such as the DoubleClick DART cookie) enables it and its partners to serve ads to users based on their visits to FormatFlow and/or other sites across the World Wide Web.
            </li>
            <li>
              <strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 font-semibold underline"
              >
                Google Ads Settings
              </a>. Alternatively, you may opt out of a third-party vendor's use of cookies for personalized advertising by visiting
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 font-semibold underline"
              >
                www.aboutads.info
              </a>
              or the
              <a
                href="https://www.networkadvertising.org/choices/"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 font-semibold underline"
              >
                Network Advertising Initiative
              </a>.
            </li>
          </ul>
        </section>

        <!-- 4. Cookies, Web Beacons & Consent Management -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">4. Cookie Policy & Google Consent Mode v2</h2>
          <p>
            We deploy a comprehensive Cookie Consent Management system compliant with the EU ePrivacy Directive, GDPR, and Google's EU User Consent Policy. Cookies are categorized into:
          </p>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong class="text-slate-900 block mb-1">Strictly Necessary</strong>
              <span>Required for basic website functioning, file upload sessions, and CSRF protection. Always active.</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong class="text-slate-900 block mb-1">Performance & Analytics</strong>
              <span>Anonymized metrics on conversion speed and error frequencies to diagnose issues without identifying users.</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong class="text-slate-900 block mb-1">Advertising & Google Ads</strong>
              <span>Used by Google to deliver non-intrusive banner ads that support our free tools.</span>
            </div>
          </div>
          <p class="mt-3 text-slate-600">
            You may change or revoke your cookie choices at any time by clicking the
            <button
              type="button"
              (click)="openConsentSettings()"
              class="text-blue-600 font-bold underline inline cursor-pointer"
            >
              Cookie Preferences
            </button>
            link in the footer.
          </p>
        </section>

        <!-- 5. User Rights: GDPR & CCPA/CPRA -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">5. Your Privacy Rights (GDPR & CCPA/CPRA)</h2>
          <p>
            Under global privacy frameworks, you retain full rights regarding your data:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li><strong>Right to Erasure / Immediate Purge:</strong> Uploaded files are automatically expunged after 60 minutes or instantly via the trash icon.</li>
            <li><strong>Do Not Sell or Share My Personal Information:</strong> FormatFlow does not sell, lease, or monetize user file contents, contact messages, or browsing telemetry.</li>
            <li><strong>Right to Non-Discrimination:</strong> You will never be denied access or charged fees for choosing not to consent to non-essential cookies.</li>
          </ul>
        </section>

        <!-- 6. Official Contact & Data Controller Details -->
        <section class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h2 class="text-lg font-bold text-slate-900 mb-2">6. Data Controller Contact Information</h2>
          <p>
            For any questions, copyright claims, or privacy inquiries, please contact our team directly:
          </p>
          <div class="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p><strong>FormatFlow Data Operations:</strong> Tushar Sharma</p>
            <p><strong>Official Address:</strong> 127, Bhatwara, Bagh Wali Gali, Meerut - 250002, Uttar Pradesh, India</p>
            <p><strong>Phone:</strong> <a href="tel:8218870579" class="text-blue-600 font-semibold">+91 8218870579</a></p>
            <p><strong>Email:</strong> <a href="mailto:tusharmanusharma@gmail.com" class="text-blue-600 font-semibold">tusharmanusharma&#64;gmail.com</a> • <a routerLink="/contact" class="text-blue-600 font-semibold underline">Official Contact Form</a></p>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class PrivacyComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly cookieConsentService = inject(CookieConsentService);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Privacy Policy & Google Ads Compliance — 100% Secure & Automatic File Purge',
      description:
        'Official FormatFlow Privacy Policy. Learn about our 60-minute automated file purge, zero document logging, Google Ads & AdSense compliance, and GDPR/CCPA user rights.',
      canonicalPath: '/privacy',
      keywords: ['privacy policy', 'google ads compliance', 'cookie policy', 'file retention', 'formatflow privacy'],
    });
  }

  openConsentSettings(): void {
    this.cookieConsentService.openPreferences();
  }
}
