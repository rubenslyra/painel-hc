import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '@app/core/auth/auth.service';
import { LoadingSplashComponent } from '@app/shared/ui/loading-splash.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, LoadingSplashComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    username: ['demo', [Validators.required]],
    password: ['demo', [Validators.required, Validators.minLength(4)]]
  });

  canSubmit = computed(() => this.form.valid && !this.loading());

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (!this.form.valid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigate(['/']);
    } catch {
      this.error.set('Usuário ou senha inválidos.');
    } finally {
      this.loading.set(false);
    }
  }
}
