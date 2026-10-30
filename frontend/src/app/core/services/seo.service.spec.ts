import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { SeoService } from './seo.service.js';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService, Title, Meta],
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('updates title, meta tags, and open graph properties', () => {
    service.setSeoData({
      title: 'Merge PDF Online',
      description: 'Combine multiple PDF files into one easily.',
      canonicalPath: '/tools/merge-pdf',
      keywords: ['merge pdf', 'combine pdf'],
    });

    expect(titleService.getTitle()).toBe('Merge PDF Online | FormatFlow');
    expect(metaService.getTag("name='description'")?.content).toBe(
      'Combine multiple PDF files into one easily.'
    );
    expect(metaService.getTag("property='og:title'")?.content).toBe(
      'Merge PDF Online | FormatFlow'
    );
    expect(metaService.getTag("name='keywords'")?.content).toBe('merge pdf, combine pdf');
  });

  it('generates valid BreadcrumbList schema', () => {
    const breadcrumb = service.createBreadcrumbSchema([
      { name: 'Home', url: 'https://formatflow.app/' },
      { name: 'PDF Tools', url: 'https://formatflow.app/#pdf' },
    ]);

    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb['itemListElement']).toHaveLength(2);
    expect(breadcrumb['itemListElement'][0].name).toBe('Home');
  });

  it('generates valid FAQPage schema', () => {
    const faq = service.createFaqSchema([
      { question: 'Is it free?', answer: 'Yes, 100% free.' },
    ]);

    expect(faq['@type']).toBe('FAQPage');
    expect(faq['mainEntity'][0].name).toBe('Is it free?');
  });
});
