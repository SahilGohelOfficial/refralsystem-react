import type { PortalRole } from '../types/api';

export function isAdminPortalRole(role: string): role is 'admin' | 'superAdmin' {
  return role === 'admin' || role === 'superAdmin';
}

export function getDashboardPath(role: PortalRole): string {
  if (isAdminPortalRole(role)) return '/admin/dashboard';
  if (role === 'agent') return '/agent/dashboard';
  return '/withdrawal/dashboard';
}
