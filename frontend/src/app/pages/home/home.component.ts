import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TOOL_CATALOG, ToolDefinition, ToolCategory } from '@formatflow/shared';
import { SeoService } from '../../core/services/seo.service.js';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner.component.js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AdBannerComponent],
  template: `
    <div class="space-y-16 py-8 sm:py-12">
      <!-- HERO SECTION -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
          <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          100% Free • Private • Fast Real Conversions
        </div>

        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Convert Your Files, <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">Effortlessly.</span>
        </h1>

        <p class="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          High-performance online file converter for Images, PDFs, and Documents. Real native transformations with zero watermarks, no registration, and automated privacy auto-deletion.
        </p>

        <!-- Popular Shortcuts -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <a
            routerLink="/studio"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-white shadow-md text-xs font-bold transition-all hover:scale-105 mr-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FormatFlow Studio (Translator)</span>
            <span class="px-1.5 py-0.2 text-[9px] uppercase font-black bg-emerald-400 text-slate-950 rounded">NEW</span>
          </a>
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">Popular:</span>
          @for (tool of popularTools; track tool.slug) {
            <a
              [routerLink]="['/tools', tool.slug]"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 shadow-2xs text-xs font-semibold text-slate-700 transition-all hover:scale-103"
            >
              <span>{{ tool.shortTitle }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          }
        </div>
      </section>

      <!-- AD BANNER -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <app-ad-banner label="Sponsored Placement • Fast Cloud Conversions" />
      </div>

      <!-- CATEGORY TOOL DIRECTORY -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-slate-900">Explore Conversion Tools</h2>
            <p class="text-xs text-slate-500 mt-0.5">Select a specialized conversion tool from our complete catalog</p>
          </div>

          <!-- Category Filter Tabs -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold">
            <button
              (click)="selectedCategory.set('all')"
              [class.bg-white]="selectedCategory() === 'all'"
              [class.text-blue-600]="selectedCategory() === 'all'"
              [class.shadow-xs]="selectedCategory() === 'all'"
              class="px-3.5 py-1.5 rounded-lg text-slate-600 transition-colors"
            >
              All Tools ({{ allTools.length }})
            </button>
            <button
              (click)="selectedCategory.set('image')"
              [class.bg-white]="selectedCategory() === 'image'"
              [class.text-blue-600]="selectedCategory() === 'image'"
              [class.shadow-xs]="selectedCategory() === 'image'"
              class="px-3.5 py-1.5 rounded-lg text-slate-600 transition-colors"
            >
              Images ({{ countCategory('image') }})
            </button>
            <button
              (click)="selectedCategory.set('pdf')"
              [class.bg-white]="selectedCategory() === 'pdf'"
              [class.text-blue-600]="selectedCategory() === 'pdf'"
              [class.shadow-xs]="selectedCategory() === 'pdf'"
              class="px-3.5 py-1.5 rounded-lg text-slate-600 transition-colors"
            >
              PDF ({{ countCategory('pdf') }})
            </button>
            <button
              (click)="selectedCategory.set('document')"
              [class.bg-white]="selectedCategory() === 'document'"
              [class.text-blue-600]="selectedCategory() === 'document'"
              [class.shadow-xs]="selectedCategory() === 'document'"
              class="px-3.5 py-1.5 rounded-lg text-slate-600 transition-colors"
            >
              Documents ({{ countCategory('document') }})
            </button>
          </div>
        </div>

        <!-- Tool Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (tool of filteredTools(); track tool.slug) {
            <a
              [routerLink]="['/tools', tool.slug]"
              class="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md" [class]="getCategoryBadgeClass(tool.category)">
                    {{ tool.category }}
                  </span>
                  @if (tool.badge) {
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {{ tool.badge }}
                    </span>
                  }
                </div>

                <h3 class="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                  {{ tool.shortTitle }}
                </h3>

                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {{ tool.description }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Convert now</span>
                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-100/70 rounded-3xl border border-slate-200">
        <div class="text-center max-w-xl mx-auto mb-10">
          <h2 class="text-2xl font-bold text-slate-900">How FormatFlow Works</h2>
          <p class="text-xs text-slate-600 mt-1">Convert any file in three lightning-fast steps</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6 rounded-2xl bg-white shadow-xs border border-slate-200/80">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center">
              1
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1">Select & Upload</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Choose your conversion tool and drop your files into the browser. We validate formats using binary signatures.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-white shadow-xs border border-slate-200/80">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-lg flex items-center justify-center">
              2
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1">Configure & Process</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Fine-tune quality, dimensions, margins, or background colors. Conversions run via sharp and pdf-lib in milliseconds.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-white shadow-xs border border-slate-200/80">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-lg flex items-center justify-center">
              3
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1">Instant Download</h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              Download your converted files instantly. Temporary files are purged automatically within 60 minutes or on demand.
            </p>
          </div>
        </div>
      </section>

      <!-- PRIVACY & SECURITY PLEDGE -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Privacy First Guarantee
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Your Files Stay Completely Private.
            </h2>
            <p class="text-sm text-slate-300 leading-relaxed">
              FormatFlow never analyzes, inspects, sells, or permanently retains your uploaded files. Every uploaded file and converted output is completely wiped from our servers after 60 minutes, or you can delete it immediately with our instant purge button.
            </p>
          </div>

          <a routerLink="/privacy" class="shrink-0 px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md transition-all hover:scale-102">
            Read Retention Policy
          </a>
        </div>
      </section>

      <!-- FREQUENTLY ASKED QUESTIONS (FAQ) -->
      <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p class="text-xs text-slate-500 mt-1">Everything you need to know about FormatFlow</p>
        </div>

        <div class="space-y-4">
          @for (faq of faqs; track faq.q) {
            <details class="group p-5 rounded-2xl bg-white border border-slate-200 transition-all [&_summary::-webkit-details-marker]:hidden">
              <summary class="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-800 group-hover:text-blue-600">
                <span>{{ faq.q }}</span>
                <span class="ml-4 transition-transform group-open:rotate-180 text-slate-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p class="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {{ faq.a }}
              </p>
            </details>
          }
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  allTools: ToolDefinition[] = TOOL_CATALOG;
  popularTools: ToolDefinition[] = TOOL_CATALOG.filter((t) => t.badge === 'Popular');
  selectedCategory = signal<'all' | ToolCategory>('all');

  faqs = [
    {
      q: 'Is FormatFlow 100% free to use?',
      a: 'Yes! All image conversions, PDF merges, splits, compressions, and spreadsheet conversions are completely free without hidden watermarks or mandatory user registrations.',
    },
    {
      q: 'How long are my uploaded files stored on the server?',
      a: 'All files are automatically deleted after 60 minutes by our scheduled cleanup daemon. You can also click the trash can icon on the download card to delete your file immediately.',
    },
    {
      q: 'Does FormatFlow support transparent PNG to JPG conversion?',
      a: 'Yes! Because JPG does not support alpha transparency, you can pick any custom background color (defaulting to clean white) to render transparent areas seamlessly.',
    },
    {
      q: 'Can I convert multiple images into a single PDF document?',
      a: 'Yes! Use our "Images to PDF" tool to upload up to 30 JPG, PNG, and WebP images and bind them into a single organized PDF with customizable A4 or Letter page sizing.',
    },
  ];

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'Free Online File Converter — Images, PDFs & Documents',
      description:
        'Convert images (JPG, PNG, WebP, AVIF), PDF tools (Merge, Split, Compress, Rotate), and documents (CSV, XLSX, TXT) online for free. Fast, private, and secure.',
      canonicalPath: '/',
      keywords: ['file converter', 'convert jpg to png', 'merge pdf', 'compress pdf', 'csv to xlsx', 'free pdf tools'],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'FormatFlow',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    });
  }

  filteredTools(): ToolDefinition[] {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.allTools;
    return this.allTools.filter((t) => t.category === cat);
  }

  countCategory(cat: ToolCategory): number {
    return this.allTools.filter((t) => t.category === cat).length;
  }

  getCategoryBadgeClass(category: ToolCategory): string {
    switch (category) {
      case 'image':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'pdf':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'document':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  }
}
