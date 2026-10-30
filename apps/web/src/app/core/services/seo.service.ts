import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  robots?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private readonly defaultImage = 'https://formatflow.app/favicon.ico';
  private readonly siteName = 'FormatFlow';

  /**
   * Updates all essential SEO, Open Graph, Twitter, and Schema.org tags for the active route.
   */
  setSeoData(options: SeoOptions): void {
    // 1. Page Title
    const fullTitle = options.title.includes(this.siteName)
      ? options.title
      : `${options.title} | ${this.siteName}`;
    this.titleService.setTitle(fullTitle);

    // 2. Primary Meta Tags
    this.metaService.updateTag({ name: 'description', content: options.description });
    this.metaService.updateTag({
      name: 'robots',
      content: options.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });
    this.metaService.updateTag({ name: 'author', content: this.siteName });

    if (options.keywords && options.keywords.length > 0) {
      this.metaService.updateTag({ name: 'keywords', content: options.keywords.join(', ') });
    }

    // 3. Open Graph Tags
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://formatflow.app';
    const canonicalUrl = `${origin}${options.canonicalPath || ''}`;
    const imageUrl = options.image || this.defaultImage;

    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: options.description });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:type', content: options.type || 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: this.siteName });
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });

    // 4. Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:site', content: '@formatflow' });
    this.metaService.updateTag({ name: 'twitter:creator', content: '@formatflow' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: options.description });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });

    // 5. Canonical Link
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    // 6. JSON-LD Structured Data
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

  /**
   * Helper to generate a BreadcrumbList Schema object
   */
  createBreadcrumbSchema(items: { name: string; url: string }[]): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  /**
   * Helper to generate an FAQPage Schema object
   */
  createFaqSchema(faqs: { question: string; answer: string }[]): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }
}
