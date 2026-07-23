import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    clientName: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Signal, not a plain property: this app runs zoneless, so state set
  // inside an HTTP subscribe callback must be a signal to actually re-render.
  readonly errorMessage = signal<string | null>(null);
  showPassword = false;

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage.set(null);
    const { clientName, adminEmail, adminPassword } = this.form.getRawValue();
    this.authService.signup(clientName, adminEmail, adminPassword).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.message ?? 'Signup failed');
      },
    });
  }
}
