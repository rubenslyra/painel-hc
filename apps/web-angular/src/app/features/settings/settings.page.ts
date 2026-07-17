import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { ThresholdsApi } from '@app/core/adapters/api';
import { PageHeaderComponent } from '@app/shared/ui/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  private api = inject(ThresholdsApi);
  private fb = inject(FormBuilder);

  saving = signal(false);

  form = this.fb.nonNullable.group({
    consumptionAttention: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
    gapAttentionMin: [10, [Validators.required, Validators.min(0)]],
    gapCriticalMin: [25, [Validators.required, Validators.min(0)]],
    daysUntilAttention: [30, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    this.api.get().subscribe(config => this.form.patchValue(config));
  }

  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (!this.form.valid || this.saving()) return;

    this.saving.set(true);
    try {
      await firstValueFrom(this.api.save(this.form.getRawValue()));
    } finally {
      this.saving.set(false);
    }
  }
}