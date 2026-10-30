import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StudioComponent } from './studio.component.js';
import { ApiService } from '../../core/services/api.service.js';

describe('StudioComponent', () => {
  let component: StudioComponent;
  let fixture: ComponentFixture<StudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates successfully with default languages selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedLanguageCodes()).toContain('zh-CN');
    expect(component.selectedLanguageCodes()).toContain('fr-FR');
    expect(component.selectedLanguageCodes()).toContain('de-DE');
  });

  it('loads sample presentation (Q2_Investor_Update.pptx) with 24 slides', () => {
    const apiService = TestBed.inject(ApiService);
    vi.spyOn(apiService, 'getSamplePresentationBlob').mockReturnValue(of(new Blob(['test-presentation'])));
    component.loadSamplePresentation();
    expect(component.selectedFile()).toBeTruthy();
    expect(component.selectedFile()?.name).toBe('Q2_Investor_Update.pptx');
    expect(component.slideCount()).toBe(24);
    expect(component.canStartTranslation()).toBe(true);
  });

  it('toggles target languages correctly', () => {
    // Already has zh-CN
    expect(component.isLanguageSelected('zh-CN')).toBe(true);
    // Add Spanish
    component.toggleLanguage('es-ES');
    expect(component.isLanguageSelected('es-ES')).toBe(true);
    // Remove Spanish
    component.toggleLanguage('es-ES');
    expect(component.isLanguageSelected('es-ES')).toBe(false);
  });
});
