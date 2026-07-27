/**
 * Format a byte count as a human-readable size (B, KB, MB, GB).
 * Uses 1024-based units. Values under 1 KB stay whole bytes.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} B`;
  }

  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  const display = value.toFixed(decimals).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  return `${display} ${units[unitIndex]}`;
}
