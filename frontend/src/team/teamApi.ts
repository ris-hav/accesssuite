import { apiFetch } from '../core/api';

export interface TeamMember {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
  createdAt: string;
}

export function listUsers(): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>('/users');
}

export function createUser(email: string, password: string, role: string): Promise<TeamMember> {
  return apiFetch<TeamMember>('/users', { method: 'POST', body: { email, password, role } });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}
