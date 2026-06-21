import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FormField } from '../../../types/form'
import { FIELD_TYPE_LABELS } from '../../../types/form'

type CanvasFieldItemProps = {
  field: FormField
  sortableId: string
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

export default function CanvasFieldItem({
  field,
  sortableId,
  isSelected,
  onSelect,
  onRemove,
}: CanvasFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId, data: { source: 'canvas' as const, field } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface hover:border-primary/30'
      } ${isDragging ? 'opacity-50 shadow-md' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none p-1 text-text-secondary hover:text-text active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      <button
        type="button"
        className="flex flex-1 items-center gap-2 text-left"
        onClick={onSelect}
      >
        <span className="text-sm font-medium text-text">{field.label}</span>
        <span className="rounded bg-surface px-1.5 py-0.5 text-xs text-text-secondary border border-border">
          {FIELD_TYPE_LABELS[field.type]}
        </span>
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="rounded p-1 text-text-secondary opacity-0 transition-opacity hover:bg-error/10 hover:text-error group-hover:opacity-100"
        aria-label="Remove field"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  )
}
