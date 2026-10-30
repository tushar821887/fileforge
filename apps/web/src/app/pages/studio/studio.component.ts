import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, UploadProgressEvent } from '../../core/services/api.service.js';
import { SeoService } from '../../core/services/seo.service.js';
import { SUPPORTED_LANGUAGES } from '../../core/constants/languages.js';
import type {
  SupportedLanguage,
  TranslationJobResult,
} from '@formatflow/shared';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#070E0D] text-slate-100 py-6 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div class="max-w-6xl mx-auto space-y-6">

        <!-- Top Studio Window Frame -->
        <div class="bg-[#0D1817] border border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          <!-- Window Header Bar -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-emerald-900/40 bg-[#091211]">
            <div class="flex items-center space-x-3">
              <div class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center font-black text-xs text-emerald-400 tracking-wider">
                FF
              </div>
              <span class="font-bold text-sm tracking-wide text-white">FormatFlow Studio</span>
              <span class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Design & Layout Preserved
              </span>
            </div>

            <!-- Window controls mock & Back link -->
            <div class="flex items-center space-x-4">
              <a routerLink="/" class="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1 mr-2">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span class="hidden sm:inline">Back to Converters</span>
              </a>
              <div class="flex items-center space-x-3 text-slate-400 text-xs font-mono">
                <span class="cursor-pointer hover:text-white transition">_</span>
                <span class="cursor-pointer hover:text-white transition">□</span>
                <a routerLink="/" class="cursor-pointer hover:text-rose-400 transition">✕</a>
              </div>
            </div>
          </div>

          <!-- Studio Main Stage -->
          <div class="p-6 sm:p-8 space-y-8">

            <!-- Subheading & Pipeline Intro -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Document Layout Translator
                </h1>
                <p class="text-xs sm:text-sm text-slate-400 mt-1">
                  Translate presentations and documents into multiple languages with 100% visual layout, fonts, shapes, and geometry preservation.
                </p>
              </div>

              <!-- Quick Demo Button -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="loadSamplePresentation()"
                  class="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition flex items-center gap-1.5 shadow-sm"
                  [disabled]="isTranslating()"
                >
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Load Sample Presentation (PPTX)</span>
                </button>
              </div>
            </div>

            <!-- Error Notification Banner -->
            @if (errorMessage(); as err) {
              <div class="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between shadow-lg">
                <div class="flex items-center space-x-2.5">
                  <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ err }}</span>
                </div>
                <button type="button" (click)="errorMessage.set(null)" class="text-rose-400 hover:text-white text-xs px-2 py-0.5 rounded transition">✕</button>
              </div>
            }

            <!-- Pipeline 3-Card Grid with Glowing Connecting Line -->
            <div class="relative">
              
              <!-- Glowing Horizontal Pipeline Connector Line (Desktop) -->
              <div class="hidden lg:block absolute top-[45%] left-12 right-12 h-[2px] bg-emerald-500/30 -translate-y-1/2 pointer-events-none z-0">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/60 to-emerald-500/20 shadow-[0_0_12px_#10B981]"></div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                <!-- CARD 1: Source File -->
                <div class="bg-[#0B1514] border border-emerald-900/40 rounded-2xl p-6 flex flex-col justify-between min-h-[360px] shadow-lg relative group transition hover:border-emerald-700/50">
                  <div>
                    <h3 class="text-sm font-semibold text-slate-300 tracking-wide mb-6">Source file</h3>

                    @if (!selectedFile()) {
                      <!-- Upload State: No file selected -->
                      <div class="flex flex-col items-center justify-center text-center py-6">
                        <div class="w-20 h-24 rounded-xl border-2 border-dashed border-emerald-800/60 bg-emerald-950/20 flex flex-col items-center justify-center mb-4 transition group-hover:border-emerald-500/60">
                          <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>

                        <label class="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition">
                          <span>Select Document</span>
                          <input
                            type="file"
                            (change)="onFileInputChange($event)"
                            accept=".pptx,.docx,.txt,.csv,.html,.htm"
                            class="hidden"
                          />
                        </label>
                        <p class="text-[11px] text-slate-400 mt-2">PPTX, DOCX, TXT, CSV, HTML</p>
                      </div>
                    } @else {
                      <!-- File Loaded State (Directly matches the screenshot!) -->
                      @if (selectedFile(); as file) {
                        <div class="flex flex-col items-center text-center">
                          <!-- Big Document Icon with Badge -->
                          <div class="relative w-24 h-32 bg-slate-100 rounded-xl shadow-2xl p-3 flex flex-col justify-between border border-slate-300 mb-4 transition-transform hover:scale-105">
                            <div class="space-y-1.5 opacity-40">
                              <div class="h-1.5 w-12 bg-slate-600 rounded"></div>
                              <div class="h-1.5 w-16 bg-slate-600 rounded"></div>
                              <div class="h-1.5 w-14 bg-slate-600 rounded"></div>
                              <div class="h-1.5 w-10 bg-slate-600 rounded"></div>
                            </div>

                            <!-- Format Badge -->
                            <div
                              class="self-end px-2 py-0.5 rounded text-[11px] font-black tracking-wider text-white shadow-sm"
                              [ngClass]="getFormatBadgeClass(fileFormat())"
                            >
                              {{ fileFormat().toUpperCase() }}
                            </div>
                          </div>

                          <!-- File Details -->
                          <h4 class="font-bold text-white text-sm max-w-[240px] truncate" [title]="file.name">
                            {{ file.name }}
                          </h4>

                          <p class="text-xs text-slate-400 mt-1 font-mono">
                            @if (slideCount()) {
                              <span>{{ slideCount() }} slides · </span>
                            }
                            @if (pageCount()) {
                              <span>{{ pageCount() }} pages · </span>
                            }
                            <span>{{ formatFileSize(file.size) }}</span>
                          </p>
                        </div>
                      }
                    }
                  </div>

                  <!-- Loaded Locally Badge & Actions -->
                  <div class="pt-4 mt-auto border-t border-emerald-950/60 flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
                      <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span>Loaded locally</span>
                    </div>

                    @if (selectedFile()) {
                      <div>
                        <label class="text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer underline transition">
                          Change
                          <input
                            type="file"
                            (change)="onFileInputChange($event)"
                            accept=".pptx,.docx,.txt,.csv,.html,.htm"
                            class="hidden"
                            [disabled]="isTranslating()"
                          />
                        </label>
                      </div>
                    }
                  </div>

                  <!-- Glowing connector node right side (Desktop) -->
                  <div class="hidden lg:flex absolute -right-4 top-[45%] -translate-y-1/2 w-8 h-8 rounded-full bg-[#0B1514] border-2 border-emerald-400 items-center justify-center z-20 shadow-[0_0_12px_#10B981]">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                </div>

                <!-- CARD 2: Target Languages -->
                <div class="bg-[#0B1514] border border-emerald-900/40 rounded-2xl p-6 flex flex-col justify-between min-h-[360px] shadow-lg relative transition hover:border-emerald-700/50">
                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-sm font-semibold text-slate-300 tracking-wide">
                        Target languages · {{ selectedLanguageCodes().length }} selected
                      </h3>
                      <button
                        type="button"
                        (click)="toggleAllLanguages()"
                        class="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition"
                      >
                        {{ selectedLanguageCodes().length === availableLanguages.length ? 'Clear' : 'Select All' }}
                      </button>
                    </div>

                    <!-- Languages List (Max 5 with scrollable container) -->
                    <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      @for (lang of availableLanguages; track lang.code) {
                        <button
                          type="button"
                          (click)="toggleLanguage(lang.code)"
                          [disabled]="isTranslating()"
                          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition text-xs group"
                          [ngClass]="
                            isLanguageSelected(lang.code)
                              ? 'bg-emerald-950/40 border-emerald-600/60 text-white shadow-sm'
                              : 'bg-[#0E1B19]/50 border-emerald-950/60 text-slate-300 hover:border-emerald-800/60 hover:text-white'
                          "
                        >
                          <div class="flex items-center space-x-3">
                            <span
                              class="w-6 h-5 rounded font-mono font-bold text-[10px] flex items-center justify-center uppercase transition"
                              [ngClass]="
                                isLanguageSelected(lang.code)
                                  ? 'bg-emerald-500 text-[#0B1514]'
                                  : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                              "
                            >
                              {{ lang.countryCode }}
                            </span>
                            <span class="font-medium text-slate-100">{{ lang.name }}</span>
                            <span class="text-slate-500 font-mono text-[10px]">{{ lang.code }}</span>
                          </div>

                          <!-- Checkmark icon -->
                          <div
                            class="w-4 h-4 rounded flex items-center justify-center transition"
                            [ngClass]="
                              isLanguageSelected(lang.code)
                                ? 'text-emerald-400 font-bold'
                                : 'text-transparent'
                            "
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Quick presets footer -->
                  <div class="pt-3 mt-auto border-t border-emerald-950/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Popular presets:</span>
                    <button
                      type="button"
                      (click)="selectPreset(['zh-CN', 'fr-FR', 'de-DE'])"
                      class="text-emerald-400 hover:underline"
                    >
                      CN + FR + DE
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      (click)="selectPreset(['es-ES', 'pt-BR', 'it-IT'])"
                      class="text-emerald-400 hover:underline"
                    >
                      ES + PT + IT
                    </button>
                  </div>

                  <!-- Glowing connector node right side (Desktop) -->
                  <div class="hidden lg:flex absolute -right-4 top-[45%] -translate-y-1/2 w-8 h-8 rounded-full bg-[#0B1514] border-2 border-emerald-400 items-center justify-center z-20 shadow-[0_0_12px_#10B981]">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                </div>

                <!-- CARD 3: Translation and Review -->
                <div class="bg-[#0B1514] border border-emerald-900/40 rounded-2xl p-6 flex flex-col justify-between items-center text-center min-h-[360px] shadow-lg relative transition hover:border-emerald-700/50">
                  <div class="w-full">
                    <h3 class="text-sm font-semibold text-slate-300 tracking-wide mb-4 text-left">
                      Translation and review
                    </h3>

                    <!-- Circular Progress Gauge (Matches the reference!) -->
                    <div class="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                      <svg class="w-36 h-36 transform -rotate-90">
                        <!-- Background ring -->
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="currentColor"
                          stroke-width="8"
                          class="text-slate-800/80"
                          fill="transparent"
                        />
                        <!-- Animated Emerald Progress ring -->
                        <circle
                          cx="72"
                          cy="72"
                          r="54"
                          stroke="currentColor"
                          stroke-width="8"
                          class="text-emerald-400 transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                          stroke-linecap="round"
                          fill="transparent"
                          [attr.stroke-dasharray]="circumference"
                          [attr.stroke-dashoffset]="strokeDashoffset()"
                        />
                      </svg>

                      <!-- Center Percentage -->
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-black text-white tracking-tight">
                          {{ progress() }}%
                        </span>
                      </div>
                    </div>

                    <!-- Status Display -->
                    <div class="space-y-0.5">
                      <div
                        class="text-sm font-bold tracking-wide"
                        [ngClass]="{
                          'text-emerald-400': translationJob()?.status === 'completed',
                          'text-amber-400': isTranslating(),
                          'text-slate-300': !isTranslating() && translationJob()?.status !== 'completed'
                        }"
                      >
                        {{ statusTitle() }}
                      </div>
                      <div class="text-xs text-slate-400">
                        {{ statusSubtitle() }}
                      </div>
                    </div>
                  </div>

                  <!-- Translation Action CTA -->
                  <div class="w-full pt-4 mt-auto">
                    <button
                      type="button"
                      (click)="startTranslation()"
                      [disabled]="!canStartTranslation() || isTranslating()"
                      class="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-[#061210] bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.4)] transition active:scale-95 flex items-center justify-center space-x-2"
                    >
                      @if (isTranslating()) {
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#061210]" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Translating Layout...</span>
                      } @else {
                        <span>Translate Document</span>
                      }
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- CARD 4: Review Pack (Appears when completed) -->
            @if (translationJob(); as job) {
              @if (job.status === 'completed') {
                <div class="bg-[#0B1514] border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div class="flex items-center space-x-3">
                    <div class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <div>
                      <h3 class="text-sm font-bold text-white tracking-wide">Review pack</h3>
                      <p class="text-xs text-slate-300">
                        All translations complete. Files were processed locally on this machine.
                      </p>
                    </div>
                  </div>

                  <!-- Translated Files List -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (file of job.translatedFiles; track file.filename) {
                      <div class="flex items-center justify-between p-3 rounded-xl bg-[#081110] border border-emerald-950/80 hover:border-emerald-600/40 transition">
                        <div class="min-w-0 pr-2">
                          <div class="text-xs font-semibold text-slate-100 truncate" [title]="file.filename">
                            {{ file.filename }}
                          </div>
                          <div class="text-[11px] text-emerald-400 flex items-center space-x-2">
                            <span>{{ file.languageName }}</span>
                            <span class="text-slate-600">·</span>
                            <span class="text-slate-400">{{ formatFileSize(file.size) }}</span>
                          </div>
                        </div>

                        <a
                          [href]="getDownloadUrl(file.downloadUrl)"
                          download
                          class="shrink-0 p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 transition"
                          title="Download file"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    }
                  </div>

                  <!-- Bottom Actions: Download All as ZIP & Instant Purge -->
                  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-950/60">
                    <div class="flex items-center space-x-2 text-xs text-slate-400">
                      <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Auto-purges automatically within 60 minutes</span>
                    </div>

                    <div class="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        type="button"
                        (click)="purgeFiles()"
                        class="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 transition"
                      >
                        Purge Now
                      </button>

                      @if (job.zipDownloadUrl) {
                        <a
                          [href]="getDownloadUrl(job.zipDownloadUrl)"
                          download
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-[#061210] bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download All as ZIP (Review Pack)</span>
                        </a>
                      }
                    </div>
                  </div>

                </div>
              }
            }

            <!-- Architecture & Feature Highlights -->
            <div class="pt-6 border-t border-emerald-950/40 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div class="space-y-1">
                <div class="font-bold text-emerald-400 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span>100% Layout Integrity</span>
                </div>
                <p class="text-slate-400 leading-relaxed">
                  Only XML text content is translated. Shapes, coordinates, themes, master slides, and custom fonts remain strictly untouched.
                </p>
              </div>

              <div class="space-y-1">
                <div class="font-bold text-emerald-400 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Private Local Execution</span>
                </div>
                <p class="text-slate-400 leading-relaxed">
                  Processing runs in-memory with strict access controls. Your sensitive presentations never get retained or trained upon.
                </p>
              </div>

              <div class="space-y-1">
                <div class="font-bold text-emerald-400 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Multi-Language Review Pack</span>
                </div>
                <p class="text-slate-400 leading-relaxed">
                  Generate multiple language deliverables in parallel and download individual files or the bundled ZIP review pack.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(13, 24, 23, 0.4);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.3);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.6);
    }
  `],
})
export class StudioComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly seoService = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly availableLanguages: SupportedLanguage[] = SUPPORTED_LANGUAGES;
  readonly selectedLanguageCodes = signal<string[]>(['zh-CN', 'fr-FR', 'de-DE']);

  readonly selectedFile = signal<File | null>(null);
  readonly fileFormat = signal<string>('pptx');
  readonly slideCount = signal<number | null>(null);
  readonly pageCount = signal<number | null>(null);

  readonly isTranslating = signal<boolean>(false);
  readonly progress = signal<number>(0);
  readonly circumference = 2 * Math.PI * 54; // ~339.29

  readonly translationJob = signal<TranslationJobResult | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly strokeDashoffset = computed(() => {
    return this.circumference - (this.progress() / 100) * this.circumference;
  });

  readonly canStartTranslation = computed(() => {
    return !!this.selectedFile() && this.selectedLanguageCodes().length > 0;
  });

  readonly statusTitle = computed(() => {
    if (this.translationJob()?.status === 'completed') return 'Complete';
    if (this.isTranslating()) return 'Translating...';
    if (this.selectedFile()) return 'Ready to Translate';
    return 'Waiting for File';
  });

  readonly statusSubtitle = computed(() => {
    if (this.translationJob()?.status === 'completed') return 'Ready for review';
    if (this.isTranslating()) return 'Preserving 100% visual layout...';
    if (this.selectedFile()) return `${this.selectedLanguageCodes().length} languages selected`;
    return 'Select a file to begin';
  });

  ngOnInit(): void {
    this.seoService.setSeoData({
      title: 'FormatFlow Studio — AI Document & Presentation Layout Translator',
      description:
        'Translate PowerPoint (.pptx), Word (.docx), and text documents into multiple languages while preserving 100% of shapes, fonts, geometries, and visual layouts.',
      canonicalPath: '/studio',
      keywords: [
        'presentation translator',
        'translate pptx keep design',
        'document translator',
        'powerpoint translator preserve layout',
        'multi language document studio',
      ],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'FormatFlow Studio',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        description:
          'Translate presentation slides and documents into multiple languages while preserving 100% visual layout, fonts, shapes, and styling.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    });
  }

  isLanguageSelected(code: string): boolean {
    return this.selectedLanguageCodes().includes(code);
  }

  toggleLanguage(code: string): void {
    if (this.isTranslating()) return;
    const current = [...this.selectedLanguageCodes()];
    const index = current.indexOf(code);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
        this.selectedLanguageCodes.set(current);
      }
    } else {
      current.push(code);
      this.selectedLanguageCodes.set(current);
    }
  }

  toggleAllLanguages(): void {
    if (this.isTranslating()) return;
    if (this.selectedLanguageCodes().length === this.availableLanguages.length) {
      this.selectedLanguageCodes.set(['zh-CN']);
    } else {
      this.selectedLanguageCodes.set(this.availableLanguages.map((l) => l.code));
    }
  }

  selectPreset(codes: string[]): void {
    if (this.isTranslating()) return;
    this.selectedLanguageCodes.set([...codes]);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelected(input.files[0]);
    }
  }

  handleFileSelected(file: File): void {
    this.selectedFile.set(file);
    const fmt = file.name.split('.').pop()?.toLowerCase() || 'pptx';
    this.fileFormat.set(fmt);
    this.translationJob.set(null);
    this.progress.set(0);

    if (fmt === 'pptx') {
      this.slideCount.set(Math.max(1, Math.round(file.size / 350000)));
      this.pageCount.set(null);
    } else if (fmt === 'docx' || fmt === 'txt') {
      this.pageCount.set(Math.max(1, Math.round(file.size / 50000)));
      this.slideCount.set(null);
    } else {
      this.slideCount.set(null);
      this.pageCount.set(null);
    }
    this.cdr.detectChanges();
  }

  loadSamplePresentation(): void {
    this.apiService.getSamplePresentationBlob().subscribe({
      next: (blob: Blob) => {
        const file = new File([blob], 'Q2_Investor_Update.pptx', {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        this.selectedFile.set(file);
        this.fileFormat.set('pptx');
        this.slideCount.set(24);
        this.pageCount.set(null);
        this.selectedLanguageCodes.set(['zh-CN', 'fr-FR', 'de-DE']);
        this.translationJob.set(null);
        this.progress.set(0);
        this.errorMessage.set(null);
        this.cdr.detectChanges();
      },
      error: () => {
        const blob = new Blob([''], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        const file = new File([blob], 'Q2_Investor_Update.pptx', {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
        this.selectedFile.set(file);
        this.fileFormat.set('pptx');
        this.slideCount.set(24);
        this.selectedLanguageCodes.set(['zh-CN', 'fr-FR', 'de-DE']);
        this.cdr.detectChanges();
      },
    });
  }

  startTranslation(): void {
    const file = this.selectedFile();
    const languages = this.selectedLanguageCodes();
    if (!file || languages.length === 0 || this.isTranslating()) {
      return;
    }

    this.isTranslating.set(true);
    this.progress.set(10);
    this.errorMessage.set(null);
    this.cdr.detectChanges();

    this.apiService.translateDocument(file, languages).subscribe({
      next: (event: UploadProgressEvent<TranslationJobResult>) => {
        if (event.type === 'uploading') {
          this.progress.set(event.progress);
          this.cdr.detectChanges();
        } else if (event.type === 'processing') {
          this.progress.set(85);
          this.cdr.detectChanges();
        } else if (event.type === 'completed' && event.result) {
          this.progress.set(100);
          this.isTranslating.set(false);
          this.translationJob.set(event.result);
          if (event.result.slideCount) {
            this.slideCount.set(event.result.slideCount);
          }
          if (event.result.pageCount) {
            this.pageCount.set(event.result.pageCount);
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isTranslating.set(false);
        this.progress.set(0);
        this.errorMessage.set(err.error?.message || 'Translation failed. Please try again.');
        this.cdr.detectChanges();
      },
    });
  }

  purgeFiles(): void {
    const job = this.translationJob();
    if (job?.jobId) {
      this.apiService.deleteTranslationJob(job.jobId).subscribe({
        next: () => {
          this.translationJob.set(null);
          this.progress.set(0);
          this.cdr.detectChanges();
        },
      });
    }
  }

  getDownloadUrl(relativeUrl: string): string {
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `http://localhost:3000${relativeUrl}`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  getFormatBadgeClass(fmt: string): string {
    switch (fmt.toLowerCase()) {
      case 'pptx':
        return 'bg-gradient-to-r from-orange-600 to-red-600';
      case 'docx':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case 'txt':
        return 'bg-gradient-to-r from-slate-600 to-gray-700';
      case 'csv':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600';
      case 'html':
      case 'htm':
        return 'bg-gradient-to-r from-purple-600 to-pink-600';
      default:
        return 'bg-slate-700';
    }
  }
}
