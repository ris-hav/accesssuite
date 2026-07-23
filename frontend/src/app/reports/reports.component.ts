import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportsService, UsageReport } from './reports.service';

@Component({
  selector: 'app-reports',
  imports: [DatePipe],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private readonly reportsService = inject(ReportsService);

  readonly report = signal<UsageReport | null>(null);
  // Signal, not a plain property: this app runs zoneless, so state set
  // inside an HTTP subscribe callback must be a signal to actually re-render.
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.reportsService.getUsageReport().subscribe({
      next: (report) => this.report.set(report),
      error: () => this.loadError.set('Could not load the report.'),
    });
  }
}
