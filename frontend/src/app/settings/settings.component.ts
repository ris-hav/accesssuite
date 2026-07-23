import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
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
  client: ClientInfo | null = null;
  loadError: string | null = null;
  saveError: string | null = null;
  saved = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.settingsService.getMyClient().subscribe({
      next: (client) => {
        this.client = client;
        this.form.patchValue({ name: client.name });
      },
      error: () => (this.loadError = 'Could not load account settings.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saveError = null;
    this.saved = false;
    const { name } = this.form.getRawValue();
    this.settingsService.updateMyClient(name).subscribe({
      next: (client) => {
        this.client = client;
        this.saved = true;
      },
      error: (err: HttpErrorResponse) => {
        this.saveError = err.error?.message ?? 'Could not save changes.';
      },
    });
  }
}
