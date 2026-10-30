import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookieConsentService } from '../../core/services/cookie-consent.service.js';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Floating Cookie Banner (shown on first visit) -->
    @if (!consentService.hasAnswered()) {
      <aside
        aria-label="Cookie and Privacy Consent Banner"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/15 backdrop-blur-xl">
          <div class="flex items-start gap-3.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="space-y-1.5">
              <h3 class="text-sm font-bold text-slate-900 tracking-tight">
                Your Privacy & Cookie Choices
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                FormatFlow uses cookies and related technologies to provide essential file conversion services, measure performance, and support Google Ads policy-compliant advertising. Your uploaded files are never inspected, indexed, or shared.
              </p>
              <div class="pt-1">
                <a
                  routerLink="/privacy"
                  class="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Read our full Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
            <button
              type="button"
              (click)="openSettings()"
              class="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
            >
              Customize Choices
            </button>
            <button
              type="button"
              (click)="rejectAll()"
              class="px-3.5 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition"
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              (click)="acceptAll()"
              class="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-sm transition"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </aside>
    }

    <!-- Modal: Cookie Preferences & Google Ads Consent Settings -->
    @if (consentService.isPreferencesOpen()) {
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div class="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 id="cookie-preferences-title" class="text-base font-bold text-slate-900">
                Cookie & Consent Preferences
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Compliant with GDPR, ePrivacy, and Google Ads EU User Consent Policy
              </p>
            </div>
            <button
              type="button"
              (click)="closeSettings()"
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
            <!-- 1. Strictly Necessary Cookies -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 text-sm">Strictly Necessary Cookies</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                  Always Active
                </span>
              </div>
              <p class="text-slate-600 leading-relaxed">
                Essential for website operation, session handling, file uploading security, CSRF protection, and load-balancing during batch conversions. These cannot be disabled.
              </p>
            </div>

            <!-- 2. Performance & Analytics Cookies -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-900 text-sm">Performance & Analytics</span>
                  <p class="text-[11px] text-slate-500">Google Analytics / Performance measurement</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="analyticsEnabled()"
                    (change)="toggleAnalytics()"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p class="text-slate-600 leading-relaxed">
                Helps us understand conversion speeds, popular document types, and browser compatibility issues without ever reading your file contents.
              </p>
            </div>

            <!-- 3. Advertising & Personalization Cookies -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-slate-900 text-sm">Advertising & Google Ads</span>
                  <p class="text-[11px] text-slate-500">Google AdSense / DoubleClick cookies</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="advertisingEnabled()"
                    (change)="toggleAdvertising()"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <p class="text-slate-600 leading-relaxed">
                Allows Google and authorized ad partners to serve non-intrusive banner advertisements that fund our free platform. If disabled, you will still see general ads without behavioral profiling.
              </p>
            </div>

            <!-- Transparency notice -->
            <div class="text-[11px] text-slate-500 pt-1 leading-relaxed">
              You can withdraw or modify your consent at any time via the <strong>Cookie Preferences</strong> link in the footer. To learn more about how Google uses data from partner sites, visit
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 underline font-semibold"
              >
                Google’s Privacy & Terms
              </a>.
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              (click)="rejectAll()"
              class="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-semibold transition"
            >
              Reject All Non-Essential
            </button>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="saveCustom()"
                class="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition"
              >
                Save Preferences
              </button>
              <button
                type="button"
                (click)="acceptAll()"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent {
  readonly consentService = inject(CookieConsentService);

  readonly analyticsEnabled = signal<boolean>(false);
  readonly advertisingEnabled = signal<boolean>(false);

  constructor() {
    const prefs = this.consentService.preferences();
    this.analyticsEnabled.set(prefs.analytics);
    this.advertisingEnabled.set(prefs.advertising);
  }

  openSettings(): void {
    const prefs = this.consentService.preferences();
    this.analyticsEnabled.set(prefs.analytics);
    this.advertisingEnabled.set(prefs.advertising);
    this.consentService.openPreferences();
  }

  closeSettings(): void {
    this.consentService.closePreferences();
  }

  toggleAnalytics(): void {
    this.analyticsEnabled.set(!this.analyticsEnabled());
  }

  toggleAdvertising(): void {
    this.advertisingEnabled.set(!this.advertisingEnabled());
  }

  acceptAll(): void {
    this.consentService.acceptAll();
  }

  rejectAll(): void {
    this.consentService.rejectNonEssential();
  }

  saveCustom(): void {
    this.consentService.saveCustom(this.analyticsEnabled(), this.advertisingEnabled());
  }
}
