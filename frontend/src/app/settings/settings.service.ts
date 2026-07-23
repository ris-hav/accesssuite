import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientInfo {
  id: string;
  name: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);

  getMyClient(): Observable<ClientInfo> {
    return this.http.get<ClientInfo>(`${environment.apiBase}/clients/me`);
  }

  updateMyClient(name: string): Observable<ClientInfo> {
    return this.http.patch<ClientInfo>(`${environment.apiBase}/clients/me`, { name });
  }
}
