import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ClientInfo, SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  // Signals, not plain properties: this app runs zoneless (no zone.js), so
  // state set inside an HTTP subscribe callback must be a signal to
  // actually trigger a re-render -- a plain property write here is the bug
  // that made this page get stuck on "Loading..." despite the request
  // succeeding.
  readonly client = signal<ClientInfo | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.settingsService.getMyClient().subscribe({
      next: (client) => {
        this.client.set(client);
        this.form.patchValue({ name: client.name });
      },
      error: () => this.loadError.set('Could not load account settings.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saveError.set(null);
    this.saved.set(false);
    const { name } = this.form.getRawValue();
    this.settingsService.updateMyClient(name).subscribe({
      next: (client) => {
        this.client.set(client);
        this.saved.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.saveError.set(err.error?.message ?? 'Could not save changes.');
      },
    });
  }
}
