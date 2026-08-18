import { apiFetch } from '../core/api';

export interface ClientInfo {
  id: string;
  name: string;
  createdAt: string;
}

export function getMyClient(): Promise<ClientInfo> {
  return apiFetch<ClientInfo>('/clients/me');
}

export function updateMyClient(name: string): Promise<ClientInfo> {
  return apiFetch<ClientInfo>('/clients/me', { method: 'PATCH', body: { name } });
}
