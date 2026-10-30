import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service.js';
import { ApiService } from '../../core/services/api.service.js';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200">
          <span class="w-2 h-2 rounded-full bg-blue-600"></span>
          We'd love to hear from you
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Us</span>
        </h1>
        <p class="mt-3 text-sm sm:text-base text-slate-600">
          Have a question, feedback, or API integration request? Please feel free to reach out using the form or the official details below. We usually respond within 24 hours.
        </p>
      </div>

      <!-- Main Contact Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <!-- Left: Official Contact Cards (2 cols) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <h2 class="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Get in Touch
            </h2>

            <!-- Address Card -->
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Office Address</h4>
                <p class="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">
                  127, Bhatwara, Bagh Wali Gali,<br>
                  Meerut - 250002,<br>
                  Uttar Pradesh, India
                </p>
              </div>
            </div>

            <!-- Phone Card -->
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Phone</h4>
                <a
                  href="tel:8218870579"
                  class="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors mt-0.5 block"
                >
                  +91 8218870579
                </a>
                <span class="text-[11px] text-slate-500">Call / WhatsApp available</span>
              </div>
            </div>

            <!-- Email Card -->
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Email</h4>
                <a
                  href="mailto:tusharmanusharma@gmail.com"
                  class="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors mt-0.5 block break-all"
                >
                  tusharmanusharma&#64;gmail.com
                </a>
                <span class="text-[11px] text-slate-500">Priority inbox response</span>
              </div>
            </div>

            <!-- Hours Card -->
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Working Hours</h4>
                <p class="text-xs font-medium text-slate-800 mt-0.5">
                  Mon – Sat: 9:00 AM – 7:00 PM IST
                </p>
                <p class="text-[11px] text-slate-500">Automated file servers run 24/7/365</p>
              </div>
            </div>
          </div>

          <!-- Location Map Visual -->
          <div class="p-5 rounded-3xl bg-slate-100 border border-slate-200/80 text-center">
            <div class="w-10 h-10 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Location Headquarters</h4>
            <p class="text-xs text-slate-600 mt-0.5 font-medium">Meerut, Uttar Pradesh, India</p>
            <span class="text-[11px] text-slate-500">Pincode: 250002</span>
          </div>
        </div>

        <!-- Right: Interactive Contact Form (3 cols) -->
        <div class="lg:col-span-3">
          <div class="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <h2 class="text-xl font-bold text-slate-900 mb-1">Send Us a Message</h2>
            <p class="text-xs text-slate-500 mb-6">Fill in the fields below and we'll reply to your email promptly.</p>

            <!-- Success Alert -->
            @if (submitSuccess()) {
              <div class="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 animate-fade-in">
                <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                  <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Request Successfully Submitted & In Progress!</span>
                </div>
                <p class="text-xs text-emerald-700 leading-relaxed ml-7">
                  Thank you! We've received your inquiry and our team is actively reviewing it. We will get back to you within 24 hours.
                </p>
              </div>
            }

            <!-- Error Alert -->
            @if (submitError()) {
              <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-6 flex items-center justify-between">
                <span>{{ submitError() }}</span>
                <button (click)="submitError.set(null)" class="text-rose-500 hover:underline">Dismiss</button>
              </div>
            }

            <form (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="name" class="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name <span class="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  [(ngModel)]="contactData.name"
                  [disabled]="isSubmitting()"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="name&#64;example.com"
                    [(ngModel)]="contactData.email"
                    [disabled]="isSubmitting()"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label for="phone" class="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXXXXXXX"
                    [(ngModel)]="contactData.phone"
                    [disabled]="isSubmitting()"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label for="message" class="block text-xs font-semibold text-slate-700 mb-1">
                  Your Message <span class="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  placeholder="How can we help you? Describe your issue, feedback, or inquiry..."
                  [(ngModel)]="contactData.message"
                  [disabled]="isSubmitting()"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 resize-y"
                ></textarea>
              </div>

              <button
                type="submit"
                [disabled]="isSubmitting() || !contactData.name || !contactData.message"
                class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending Message...</span>
                } @else {
                  <span>Send Message</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly apiService = inject(ApiService);

  contactData = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Contact Us — Get in Touch with FormatFlow',
      description:
        'Have a question or feedback? Contact FormatFlow via phone, email, or our online form. We usually respond within 24 hours.',
      canonicalPath: '/contact',
      keywords: ['contact formatflow', 'support', 'meerut', 'customer service', 'file converter help'],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact FormatFlow',
        description: 'Get in touch with the FormatFlow engineering and support team.',
        mainEntity: {
          '@type': 'Organization',
          name: 'FormatFlow',
          url: 'https://formatflow.app',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-8218870579',
            contactType: 'Customer Support',
            email: 'tusharmanusharma@gmail.com',
          },
        },
      },
    });
  }

  onSubmit(): void {
    if (!this.contactData.name || !this.contactData.message) {
      this.submitError.set('Please fill in your name and message.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);

    this.apiService.sendContactMessage(this.contactData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.contactData = { name: '', email: '', phone: '', message: '' };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set(err?.error?.message || 'Failed to submit message. Please try again later.');
      },
    });
  }
}
