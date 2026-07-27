import type { AdminRole, PortalRole } from '../types/api';

export function isAdminPortalRole(role: string): role is 'admin' | 'superAdmin' {
  return role === 'admin' || role === 'superAdmin';
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === 'superAdmin';
}

export function formatRoleLabel(role?: PortalRole | AdminRole | null): string {
  if (role === 'superAdmin') return 'Super Admin';
  if (!role) return 'Admin';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function getDashboardPath(role: PortalRole): string {
  if (isAdminPortalRole(role)) return '/admin/dashboard';
  if (role === 'agent') return '/agent/dashboard';
  return '/user/dashboard';
}
