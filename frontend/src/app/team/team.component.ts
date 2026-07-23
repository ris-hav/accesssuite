import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamMember, TeamService } from './team.service';

@Component({
  selector: 'app-team',
  imports: [ReactiveFormsModule],
  templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);

  readonly members = signal<TeamMember[]>([]);
  loadError: string | null = null;
  formError: string | null = null;

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
      error: () => (this.loadError = 'Could not load the team.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.formError = null;
    const { email, password, role } = this.form.getRawValue();
    this.teamService.createUser(email, password, role).subscribe({
      next: () => {
        this.form.reset({ email: '', password: '', role: 'VIEWER' });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.formError = err.error?.message ?? 'Could not add that user.';
      },
    });
  }
}
