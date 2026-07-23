import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsageReport {
  client: { name: string; createdAt: string };
  subscription: { status: string; trialEndsAt: string } | null;
  userCounts: Record<'ADMIN' | 'MANAGER' | 'VIEWER', number>;
  enabledModules: string[];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  getUsageReport(): Observable<UsageReport> {
    return this.http.get<UsageReport>(`${environment.apiBase}/reports`);
  }
}
