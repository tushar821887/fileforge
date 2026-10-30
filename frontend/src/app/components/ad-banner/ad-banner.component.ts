import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  template: `
    <div class="my-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 text-center text-xs text-slate-500">
      <div class="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
        <span>Advertisement</span>
      </div>
      <div class="min-h-[90px] flex items-center justify-center">
        <p class="text-slate-500 font-medium">
          {{ label() || 'Sponsored Placement Space — Non-intrusive Ad Zone' }}
        </p>
      </div>
    </div>
  `,
})
export class AdBannerComponent {
  label = input<string>('');
}
