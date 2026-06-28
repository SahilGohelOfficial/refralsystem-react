const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
