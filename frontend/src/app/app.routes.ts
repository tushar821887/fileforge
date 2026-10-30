import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component.js').then((m) => m.HomeComponent),
  },
  {
    path: 'studio',
    loadComponent: () =>
      import('./pages/studio/studio.component.js').then((m) => m.StudioComponent),
  },
  {
    path: 'tools/:slug',
    loadComponent: () =>
      import('./pages/tool-page/tool-page.component.js').then((m) => m.ToolPageComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy.component.js').then((m) => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/terms/terms.component.js').then((m) => m.TermsComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component.js').then((m) => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component.js').then((m) => m.ContactComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
