import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['admin@demo.accesssuite.dev', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  // Signal, not a plain property: this app runs zoneless (no zone.js -- see
  // package.json), so only signal writes trigger a re-render for state set
  // inside an async callback like an HTTP subscribe. A plain property set
  // there would silently never appear in the view.
  readonly errorMessage = signal<string | null>(null);
  showPassword = false;

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.errorMessage.set('Invalid email or password'),
    });
  }
}
