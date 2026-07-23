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
  loadError: string | null = null;

  ngOnInit(): void {
    this.reportsService.getUsageReport().subscribe({
      next: (report) => this.report.set(report),
      error: () => (this.loadError = 'Could not load the report.'),
    });
  }
}
