import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { TeamMember, TeamService } from './team.service';

@Component({
  selector: 'app-team',
  imports: [ReactiveFormsModule],
  templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);
  private readonly authService = inject(AuthService);

  readonly members = signal<TeamMember[]>([]);
  // Signals, not plain properties: this app runs zoneless, so state set
  // inside an HTTP subscribe callback must be a signal to actually re-render.
  readonly loadError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly removeError = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly removingId = signal<string | null>(null);
  showPassword = false;

  // computed(), not a one-time snapshot: the shell's fetchMe() call hasn't
  // necessarily resolved yet when this component is constructed, so reading
  // authService.user() once here would capture `undefined` forever. This
  // re-evaluates every time the underlying signal changes, same as any
  // other signal read.
  readonly currentUserId = computed(() => this.authService.user()?.userId);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['VIEWER', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.teamService.listUsers().subscribe({
      next: (members) => this.members.set(members),
      error: () => this.loadError.set('Could not load the team.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.formError.set(null);
    this.isSubmitting.set(true);
    const { email, password, role } = this.form.getRawValue();
    this.teamService.createUser(email, password, role).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({ email: '', password: '', role: 'VIEWER' });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.formError.set(err.error?.message ?? 'Could not add that user.');
      },
    });
  }

  removeMember(id: string): void {
    this.removeError.set(null);
    this.removingId.set(id);
    this.teamService.deleteUser(id).subscribe({
      next: () => {
        this.removingId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.removingId.set(null);
        this.removeError.set(err.error?.message ?? 'Could not remove that user.');
      },
    });
  }
}
