export const labelClassName =
  'mb-1.5 block text-sm font-medium text-text-secondary'

export const hintClassName = 'mt-1.5 text-xs text-text-muted'

export const errorClassName = 'mt-1.5 text-xs text-error'

export const inputClassName = [
  'w-full min-h-10 rounded-lg border border-border bg-surface px-3.5 py-2.5',
  'text-sm text-text',
  'placeholder:text-text-muted',
  'transition-all duration-150 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

export const inputErrorClassName =
  'border-error/50 focus:border-error focus:ring-error/30'

export const optionClassName = [
  'flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface/50',
  'px-3.5 py-3 text-sm text-text transition-all duration-150',
  'hover:border-border-strong hover:bg-surface-elevated',
  'has-[:checked]:border-primary/40 has-[:checked]:bg-primary-muted',
].join(' ')

export const optionGridClassName = 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'