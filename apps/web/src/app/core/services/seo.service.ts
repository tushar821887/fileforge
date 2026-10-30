import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setSeoData(options: {
    title: string;
    description: string;
    canonicalPath?: string;
    keywords?: string[];
    jsonLd?: Record<string, any>;
  }): void {
    // 1. Page Title
    const fullTitle = `${options.title} | FormatFlow`;
    this.titleService.setTitle(fullTitle);

    // 2. Meta Tags
    this.metaService.updateTag({ name: 'description', content: options.description });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: options.description });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: options.description });

    if (options.keywords && options.keywords.length > 0) {
      this.metaService.updateTag({ name: 'keywords', content: options.keywords.join(', ') });
    }

    // 3. Canonical Link
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://formatflow.app';
    const canonicalUrl = `${origin}${options.canonicalPath || ''}`;
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // 4. JSON-LD Structured Data
    if (options.jsonLd) {
      const existingScript = this.document.querySelector("script[id='structured-data-jsonld']");
      if (existingScript) {
        existingScript.remove();
      }

      const script = this.document.createElement('script');
      script.id = 'structured-data-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(options.jsonLd);
      this.document.head.appendChild(script);
    }
  }
}
