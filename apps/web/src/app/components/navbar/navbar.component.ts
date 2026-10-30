import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2.5 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">FormatFlow</span>
                <span class="text-[10px] uppercase font-semibold text-blue-600 tracking-wider -mt-1">Free Online Converter</span>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              Home
            </a>
            <a routerLink="/tools/jpg-to-png" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              Image Tools
            </a>
            <a routerLink="/tools/merge-pdf" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              PDF Tools
            </a>
            <a routerLink="/tools/csv-to-xlsx" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              Documents
            </a>
            <a routerLink="/privacy" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              Privacy Policy
            </a>
            <a routerLink="/contact" routerLinkActive="bg-blue-50 text-blue-600 font-semibold" class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors">
              Contact
            </a>
          </nav>

          <!-- Header Right Utilities -->
          <div class="hidden md:flex items-center gap-3">
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Purge 60m
            </div>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors inline-flex items-center gap-1">
              <span>API Spec</span>
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <!-- Mobile menu button -->
          <div class="flex md:hidden">
            <button (click)="toggleMobileMenu()" type="button" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <a routerLink="/" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">Home</a>
          <a routerLink="/tools/jpg-to-png" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">Image Tools</a>
          <a routerLink="/tools/merge-pdf" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">PDF Tools</a>
          <a routerLink="/tools/csv-to-xlsx" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">Document Tools</a>
          <a routerLink="/privacy" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">Privacy & Retention</a>
          <a routerLink="/contact" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">Contact Us</a>
          <a href="http://localhost:3000/api/docs" target="_blank" class="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50">API Docs (OpenAPI)</a>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((val) => !val);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
