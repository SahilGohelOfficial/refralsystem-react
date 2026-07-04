export function formatLocation(
  state?: string | null,
  city?: string | null,
): string {
  if (city && state) return `${city}, ${state}`;
  return state ?? city ?? '—';
}