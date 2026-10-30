import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { getToolBySlug, ToolDefinition, ConversionOptions, ConversionJobResult, TOOL_CATALOG } from '@formatflow/shared';
import { SeoService } from '../../core/services/seo.service.js';
import { ApiService, UploadProgressEvent } from '../../core/services/api.service.js';
import { DropzoneComponent } from '../../components/dropzone/dropzone.component.js';
import { OptionsPanelComponent } from '../../components/options-panel/options-panel.component.js';
import { ConversionProgressComponent } from '../../components/conversion-progress/conversion-progress.component.js';
import { ResultCardComponent } from '../../components/result-card/result-card.component.js';
import { AdBannerComponent } from '../../components/ad-banner/ad-banner.component.js';

@Component({
  selector: 'app-tool-page',
  standalone: true,
  imports: [
    RouterLink,
    DropzoneComponent,
    OptionsPanelComponent,
    ConversionProgressComponent,
    ResultCardComponent,
    AdBannerComponent,
  ],
  template: `
    @if (tool(); as currentTool) {
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-slate-500">
          <a routerLink="/" class="hover:text-blue-600">Home</a>
          <span>/</span>
          <span class="capitalize">{{ currentTool.category }} Tools</span>
          <span>/</span>
          <span class="text-slate-800 font-semibold">{{ currentTool.shortTitle }}</span>
        </nav>

        <!-- Tool Header Section -->
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3" [class]="getCategoryBadgeClass(currentTool.category)">
            <span>{{ currentTool.category }} Converter</span>
            @if (currentTool.badge) {
              <span>• {{ currentTool.badge }}</span>
            }
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {{ currentTool.h1 }}
          </h1>

          <p class="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {{ currentTool.description }}
          </p>

          <!-- Feature Pills -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
            @for (feat of currentTool.features; track feat) {
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ feat }}
              </span>
            }
          </div>
        </div>

        <!-- MAIN INTERACTIVE CONVERSION WORKSPACE -->
        <div class="max-w-3xl mx-auto">
          <!-- Dropzone for File Upload -->
          <app-dropzone
            [isMultiFile]="currentTool.isMultiFile"
            [acceptedExtensions]="currentTool.acceptedExtensions"
            [maxFileSizeMb]="currentTool.maxFileSizeMb"
            (filesSelected)="onFilesSelected($event)"
          />

          <!-- Options Configuration Panel -->
          @if (selectedFiles().length > 0 && !isProcessing() && completedJobs().length === 0) {
            <div class="mt-6">
              <app-options-panel
                [supportedOptions]="currentTool.supportedOptions"
                [toolSlug]="currentTool.slug"
                [files]="selectedFiles()"
                (optionsChange)="onOptionsChanged($event)"
              />

              <!-- Action Bar -->
              <div class="flex items-center justify-between gap-4 mt-4">
                <button
                  type="button"
                  (click)="startConversion()"
                  class="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-101 flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>
                    {{ currentTool.slug === 'image-compressor' ? 'Compress' : 'Convert' }}
                    {{ selectedFiles().length }} File{{ selectedFiles().length > 1 ? 's' : '' }} Now
                    @if (currentTool.slug === 'image-compressor' && selectedFiles().length > 0) {
                      <span class="text-blue-100 font-medium text-sm ml-1">
                        (Est. ~{{ formatSize(totalEstimatedCompressedSize()) }})
                      </span>
                    }
                  </span>
                </button>
              </div>
            </div>
          }

          <!-- Processing Progress Indicator -->
          @if (isProcessing()) {
            <app-conversion-progress
              [progress]="progressValue()"
              [label]="progressLabel()"
            />
          }

          <!-- Conversion Error Display -->
          @if (errorMessage()) {
            <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold my-4 flex items-center justify-between">
              <span>{{ errorMessage() }}</span>
              <button (click)="errorMessage.set(null)" class="text-rose-500 hover:underline">Dismiss</button>
            </div>
          }

          <!-- Completed Conversion Results -->
          @if (completedJobs().length > 0) {
            <div class="space-y-4 my-6">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Conversion Complete ({{ completedJobs().length }})
                </h3>
                <button
                  (click)="resetWorkspace()"
                  type="button"
                  class="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Convert Another File
                </button>
              </div>

              @for (job of completedJobs(); track job.jobId) {
                <app-result-card [job]="job" (convertAnother)="resetWorkspace()" />
              }
            </div>
          }
        </div>

        <!-- AD BANNER -->
        <app-ad-banner label="Sponsored Placement • Fast Cloud File Engine" />

        <!-- STEP BY STEP INSTRUCTIONS -->
        @if (currentTool.steps.length > 0) {
          <section class="max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h2 class="text-xl font-bold text-slate-900 mb-6">
              How to Convert with FormatFlow {{ currentTool.shortTitle }}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (step of currentTool.steps; track step.step) {
                <div class="relative">
                  <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center mb-3">
                    0{{ step.step }}
                  </div>
                  <h3 class="text-sm font-bold text-slate-800 mb-1">{{ step.title }}</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">{{ step.description }}</p>
                </div>
              }
            </div>
          </section>
        }

        <!-- FREQUENTLY ASKED QUESTIONS (FAQ) -->
        @if (currentTool.faqs.length > 0) {
          <section class="max-w-3xl mx-auto">
            <h2 class="text-xl font-bold text-slate-900 mb-4 text-center">
              Frequently Asked Questions
            </h2>

            <div class="space-y-3">
              @for (faq of currentTool.faqs; track faq.question) {
                <details class="group p-5 rounded-2xl bg-white border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
                  <summary class="flex items-center justify-between cursor-pointer font-bold text-sm text-slate-800 group-hover:text-blue-600">
                    <span>{{ faq.question }}</span>
                    <span class="ml-4 transition-transform group-open:rotate-180 text-slate-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p class="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {{ faq.answer }}
                  </p>
                </details>
              }
            </div>
          </section>
        }

        <!-- RELATED CONVERSION TOOLS -->
        <section class="max-w-3xl mx-auto pt-6 border-t border-slate-200">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
            Related {{ currentTool.category }} Tools
          </h3>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            @for (rel of getRelatedTools(currentTool); track rel.slug) {
              <a
                [routerLink]="['/tools', rel.slug]"
                class="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all text-center group"
              >
                <p class="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {{ rel.shortTitle }}
                </p>
                <span class="text-[10px] text-slate-400 uppercase mt-0.5 block">Convert</span>
              </a>
            }
          </div>
        </section>
      </div>
    } @else {
      <!-- Tool Not Found -->
      <div class="max-w-md mx-auto text-center py-20 px-4">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Tool Not Found</h2>
        <p class="text-xs text-slate-500 mb-6">The conversion tool you are looking for does not exist or has moved.</p>
        <a routerLink="/" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md">
          Return to Homepage
        </a>
      </div>
    }
  `,
})
export class ToolPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);
  private readonly apiService = inject(ApiService);

  tool = signal<ToolDefinition | null>(null);
  selectedFiles = signal<File[]>([]);
  conversionOptions: ConversionOptions = {};

  isProcessing = signal(false);
  progressValue = signal(0);
  progressLabel = signal('Uploading files...');
  completedJobs = signal<ConversionJobResult[]>([]);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadTool(slug);
      }
    });
  }

  loadTool(slug: string): void {
    const foundTool = getToolBySlug(slug);
    this.tool.set(foundTool || null);
    this.resetWorkspace();

    if (foundTool) {
      // Configure dynamic SEO with HowTo, Breadcrumbs, and FAQPage schemas
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://formatflow.app';
      const breadcrumbSchema = this.seoService.createBreadcrumbSchema([
        { name: 'Home', url: origin },
        { name: `${foundTool.category.toUpperCase()} Tools`, url: `${origin}/#${foundTool.category}` },
        { name: foundTool.shortTitle, url: `${origin}/tools/${foundTool.slug}` },
      ]);

      const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: foundTool.title,
        description: foundTool.description,
        step: foundTool.steps.map((s) => ({
          '@type': 'HowToStep',
          position: s.step,
          name: s.title,
          text: s.description,
        })),
      };

      const faqSchema = foundTool.faqs?.length
        ? this.seoService.createFaqSchema(foundTool.faqs)
        : null;

      const schemaGraph: any[] = [breadcrumbSchema, howToSchema];
      if (faqSchema) {
        schemaGraph.push(faqSchema);
      }

      this.seoService.setSeoData({
        title: foundTool.title,
        description: foundTool.metaDescription,
        canonicalPath: `/tools/${foundTool.slug}`,
        keywords: [
          foundTool.shortTitle,
          `convert ${foundTool.shortTitle}`,
          'free file converter',
          foundTool.category,
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': schemaGraph,
        },
      });
    }
  }

  onFilesSelected(files: File[]): void {
    this.selectedFiles.set(files);
    this.errorMessage.set(null);
  }

  onOptionsChanged(options: ConversionOptions): void {
    this.conversionOptions = options;
  }

  startConversion(): void {
    const currentTool = this.tool();
    const files = this.selectedFiles();

    if (!currentTool || files.length === 0) return;

    this.isProcessing.set(true);
    this.progressValue.set(10);
    this.progressLabel.set('Uploading files to conversion engine...');
    this.errorMessage.set(null);
    this.completedJobs.set([]);

    this.apiService.convertFilesWithProgress(currentTool.slug, files, this.conversionOptions).subscribe({
      next: (event: UploadProgressEvent) => {
        if (event.type === 'uploading') {
          this.progressValue.set(event.progress);
          this.progressLabel.set(`Uploading (${event.progress}%)...`);
        } else if (event.type === 'processing') {
          this.progressValue.set(90);
          this.progressLabel.set('Executing native conversion engine...');
        } else if (event.type === 'completed' && event.result) {
          this.progressValue.set(100);
          this.isProcessing.set(false);
          this.completedJobs.set(event.result.jobs);

          // Check if any job failed
          const failedJob = event.result.jobs.find((j) => j.status === 'failed');
          if (failedJob && failedJob.error) {
            this.errorMessage.set(`Conversion failed: ${failedJob.error}`);
          }
        }
      },
      error: (err: any) => {
        this.isProcessing.set(false);
        const errMsg = err?.error?.message || err?.message || 'Conversion failed. Please try again.';
        this.errorMessage.set(errMsg);
      },
    });
  }

  resetWorkspace(): void {
    this.selectedFiles.set([]);
    this.completedJobs.set([]);
    this.isProcessing.set(false);
    this.progressValue.set(0);
    this.errorMessage.set(null);
  }

  getRelatedTools(current: ToolDefinition): ToolDefinition[] {
    return TOOL_CATALOG.filter((t) => t.category === current.category && t.slug !== current.slug).slice(0, 4);
  }

  getCategoryBadgeClass(category: string): string {
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

  totalEstimatedCompressedSize(): number {
    const q = this.conversionOptions.quality ?? 85;
    const factor = q >= 85
      ? 0.35 + (q - 85) * ((0.85 - 0.35) / 15)
      : 0.06 + Math.pow((q - 10) / 75, 1.5) * (0.35 - 0.06);

    return this.selectedFiles().reduce((acc, f) => {
      const est = Math.round(f.size * factor);
      return acc + Math.min(f.size, Math.max(500, est));
    }, 0);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
