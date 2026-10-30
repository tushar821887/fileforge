import { Component, input } from '@angular/core';

@Component({
  selector: 'app-conversion-progress',
  standalone: true,
  template: `
    <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center my-6 animate-fade-in">
      <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-spin">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <h4 class="text-base font-bold text-slate-800 mb-1">
        {{ label() || 'Processing your conversion...' }}
      </h4>

      <p class="text-xs text-slate-500 mb-4">
        Native server-side engine running. This usually takes just a few seconds.
      </p>

      <div class="w-full max-w-md mx-auto bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          [style.width.%]="progress()"
        ></div>
      </div>

      <span class="inline-block mt-2 text-xs font-semibold text-slate-600">
        {{ progress() }}%
      </span>
    </div>
  `,
})
export class ConversionProgressComponent {
  progress = input<number>(0);
  label = input<string>('Processing...');
}
