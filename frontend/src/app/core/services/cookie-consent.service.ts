import { Injectable, signal } from '@angular/core';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const STORAGE_KEY = 'formatflow_cookie_consent';

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  readonly hasAnswered = signal<boolean>(false);
  readonly isPreferencesOpen = signal<boolean>(false);

  readonly preferences = signal<CookiePreferences>({
    essential: true,
    analytics: false,
    advertising: false,
    timestamp: 0,
  });

  constructor() {
    this.loadSavedConsent();
  }

  private loadSavedConsent(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CookiePreferences;
        this.preferences.set(parsed);
        this.hasAnswered.set(true);
        this.applyGoogleConsent(parsed);
      } else {
        this.hasAnswered.set(false);
      }
    } catch {
      this.hasAnswered.set(false);
    }
  }

  acceptAll(): void {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      advertising: true,
      timestamp: Date.now(),
    };
    this.saveConsent(prefs);
  }

  rejectNonEssential(): void {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: false,
      advertising: false,
      timestamp: Date.now(),
    };
    this.saveConsent(prefs);
  }

  saveCustom(analytics: boolean, advertising: boolean): void {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      advertising,
      timestamp: Date.now(),
    };
    this.saveConsent(prefs);
  }

  openPreferences(): void {
    this.isPreferencesOpen.set(true);
  }

  closePreferences(): void {
    this.isPreferencesOpen.set(false);
  }

  private saveConsent(prefs: CookiePreferences): void {
    this.preferences.set(prefs);
    this.hasAnswered.set(true);
    this.isPreferencesOpen.set(false);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch (err) {
        console.error('Failed to save cookie preferences', err);
      }
      this.applyGoogleConsent(prefs);
    }
  }

  /**
   * Dispatches Google Consent Mode v2 updates
   */
  private applyGoogleConsent(prefs: CookiePreferences): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.advertising ? 'granted' : 'denied',
      ad_user_data: prefs.advertising ? 'granted' : 'denied',
      ad_personalization: prefs.advertising ? 'granted' : 'denied',
    });
  }
}
