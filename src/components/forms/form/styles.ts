export const labelClassName =
  'mb-1.5 block text-sm font-medium text-text'

export const hintClassName = 'mt-1.5 text-sm text-text-secondary'

export const errorClassName = 'mt-1.5 text-sm text-error'

export const inputClassName = [
  'w-full min-h-11 rounded-lg border border-border bg-surface px-3 py-2.5',
  'text-base sm:text-sm text-text',
  'placeholder:text-text-secondary/50',
  'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

export const inputErrorClassName =
  'border-error focus:border-error focus:ring-error/20'

export const optionClassName = [
  'flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface/50',
  'px-3 py-3 sm:py-2.5 text-sm text-text transition-colors',
  'hover:border-primary/40 hover:bg-primary/5',
  'has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10',
].join(' ')

export const optionGridClassName = 'grid grid-cols-1 sm:grid-cols-2 gap-2'
