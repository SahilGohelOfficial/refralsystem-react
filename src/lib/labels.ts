import type { AgentStatus, PaymentStatus } from '../types/api';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function agentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

export function agentStatusBadgeVariant(
  status: AgentStatus,
): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'inactive':
    default:
      return 'neutral';
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === 'received') return 'Received';
  if (status === 'not_received') return 'Not received';
  return 'Pending';
}

export function paymentStatusBadgeVariant(
  status: PaymentStatus,
): 'success' | 'warning' | 'error' {
  if (status === 'received') return 'success';
  if (status === 'not_received') return 'error';
  return 'warning';
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function toTitleLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function resolveFieldLabel(
  fieldId: string,
  labelMap: Map<string, string>,
  fallback = 'Unknown field',
): string {
  const label = labelMap.get(fieldId);
  if (label) return label;
  if (isUuid(fieldId)) return fallback;
  return toTitleLabel(fieldId);
}
