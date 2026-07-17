import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProjectStatus, STATUS_LABEL } from '@app/core/domain/models';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span class="status-chip" [class]="className()" [attr.aria-label]="label()">
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .status-chip {
      align-items: center;
      border-radius: 999px;
      display: inline-flex;
      font-size: 0.75rem;
      font-weight: 650;
      gap: 0.375rem;
      line-height: 1;
      min-height: 1.75rem;
      padding: 0 0.625rem;
      white-space: nowrap;
    }
    mat-icon {
      font-size: 1rem;
      height: 1rem;
      width: 1rem;
    }
    .status-healthy { background: hsl(var(--healthy) / 0.12); color: hsl(var(--healthy)); }
    .status-attention { background: hsl(var(--attention) / 0.16); color: hsl(32 95% 32%); }
    .status-critical { background: hsl(var(--critical) / 0.12); color: hsl(var(--critical)); }
    .status-inconsistent { background: hsl(var(--neutral) / 0.12); color: hsl(var(--neutral)); }
  `]
})
export class StatusChipComponent {
  status = input.required<ProjectStatus>();

  label = computed(() => STATUS_LABEL[this.status()] ?? this.status());
  className = computed(() => `status-${this.status().toLowerCase()}`);
  icon = computed(() => {
    switch (this.status()) {
      case 'Healthy': return 'check_circle';
      case 'Attention': return 'error';
      case 'Critical': return 'warning';
      default: return 'help';
    }
  });
}
