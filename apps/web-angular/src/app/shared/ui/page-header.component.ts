import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="title-group">
        @if (eyebrow()) { <p class="eyebrow">{{ eyebrow() }}</p> }
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <p class="subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      align-items: flex-start;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .title-group {
      min-width: 0;
    }
    .eyebrow {
      color: hsl(var(--muted-text));
      font-size: 0.75rem;
      font-weight: 650;
      letter-spacing: 0;
      margin: 0 0 0.25rem;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(1.25rem, 1.08rem + 0.55vw, 1.75rem);
      font-weight: 720;
      line-height: 1.15;
      margin: 0;
    }
    .subtitle {
      color: hsl(var(--muted-text));
      font-size: 0.875rem;
      line-height: 1.45;
      margin: 0.375rem 0 0;
      max-width: 46rem;
    }
    .actions {
      align-items: center;
      display: flex;
      flex-shrink: 0;
      gap: 0.5rem;
    }
    @media (max-width: 640px) {
      .page-header {
        display: grid;
      }
      .actions {
        justify-content: stretch;
      }
      .actions ::ng-deep button {
        width: 100%;
      }
    }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  eyebrow = input<string>('');
}
