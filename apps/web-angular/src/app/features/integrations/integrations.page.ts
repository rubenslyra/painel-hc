import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { runtimeConfig, saveRuntimeConfig } from '@app/core/config/runtime-config';
import { SyncService } from '@app/core/adapters/sync.service';
import { PageHeaderComponent } from '@app/shared/ui/page-header.component';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, PageHeaderComponent],
  templateUrl: './integrations.page.html',
  styleUrl: './integrations.page.scss'
})
export class IntegrationsPage {
  sync = inject(SyncService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    apiBaseUrl: [runtimeConfig.apiBaseUrl, [Validators.required]],
    erpBaseUrl: [runtimeConfig.erpBaseUrl, [Validators.required]]
  });

  saveUrls(): void {
    if (this.form.invalid) return;
    saveRuntimeConfig(this.form.getRawValue());
    this.sync.refreshPending();
  }
}
