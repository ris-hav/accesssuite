import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TeamMember {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${environment.apiBase}/users`);
  }

  createUser(email: string, password: string, role: string): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${environment.apiBase}/users`, { email, password, role });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/users/${id}`);
  }
}
