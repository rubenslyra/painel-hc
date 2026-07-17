import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-splash',
  standalone: true,
  template: `
    <section class="loading-splash" [class.fullscreen]="fullscreen" role="status" aria-live="polite">
      <img src="/assets/hcp-logo.svg" alt="" />
      <p>{{ label }}</p>
    </section>
  `,
  styles: [`
    .loading-splash {
      align-items: center;
      background: hsl(var(--surface));
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      color: hsl(var(--muted-text));
      display: grid;
      gap: 0.875rem;
      justify-items: center;
      min-height: 14rem;
      padding: 1.5rem;
      text-align: center;
    }

    .loading-splash.fullscreen {
      background:
        linear-gradient(135deg, hsl(214 72% 16% / 0.88), hsl(156 50% 18% / 0.8)),
        url('/assets/bg-login.jpg') center / cover;
      border: 0;
      border-radius: 0;
      color: white;
      inset: 0;
      min-height: 100vh;
      position: fixed;
      z-index: 1000;
    }

    img {
      animation: pulse 1.4s ease-in-out infinite;
      display: block;
      height: 4.5rem;
      max-width: min(12rem, 72vw);
      object-fit: contain;
      width: auto;
    }

    p {
      font-size: 0.9375rem;
      font-weight: 650;
      margin: 0;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.72; transform: scale(0.98); }
      50% { opacity: 1; transform: scale(1); }
    }
  `]
})
export class LoadingSplashComponent {
  @Input() label = 'Carregando dados';
  @Input() fullscreen = false;
}
