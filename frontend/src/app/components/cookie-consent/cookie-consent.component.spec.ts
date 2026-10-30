import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CookieConsentComponent } from './cookie-consent.component.js';
import { CookieConsentService } from '../../core/services/cookie-consent.service.js';
import { provideRouter } from '@angular/router';

describe('CookieConsentComponent', () => {
  let service: CookieConsentService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CookieConsentComponent],
      providers: [CookieConsentService, provideRouter([])],
    });

    service = TestBed.inject(CookieConsentService);
  });

  it('initializes with unanswered consent on fresh visit', () => {
    expect(service.hasAnswered()).toBe(false);
  });

  it('marks consent answered when user accepts all', () => {
    service.acceptAll();
    expect(service.hasAnswered()).toBe(true);
    expect(service.preferences().analytics).toBe(true);
    expect(service.preferences().advertising).toBe(true);
  });

  it('marks consent answered with non-essential rejected', () => {
    service.rejectNonEssential();
    expect(service.hasAnswered()).toBe(true);
    expect(service.preferences().analytics).toBe(false);
    expect(service.preferences().advertising).toBe(false);
  });

  it('allows opening and closing preferences modal', () => {
    expect(service.isPreferencesOpen()).toBe(false);
    service.openPreferences();
    expect(service.isPreferencesOpen()).toBe(true);
    service.closePreferences();
    expect(service.isPreferencesOpen()).toBe(false);
  });
});
