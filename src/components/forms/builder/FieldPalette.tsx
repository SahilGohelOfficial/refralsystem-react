import { useDraggable } from '@dnd-kit/core'
import type { FieldType } from '../../../types/form'
import { FIELD_TYPE_LABELS } from '../../../types/form'

const PALETTE_TYPES: FieldType[] = [
  'text',
  'textarea',
  'dropdown',
  'multi_dropdown',
  'radio',
  'multi_radio',
  'checkbox',
  'checkbox_group',
  'file',
]

type PaletteItemProps = {
  type: FieldType
  onAdd: (type: FieldType) => void
}

function PaletteItem({ type, onAdd }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: 'palette' as const },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => onAdd(type)}
      className={`shrink-0 cursor-grab rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:border-primary hover:bg-primary/10 active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {FIELD_TYPE_LABELS[type]}
    </button>
  )
}

type FieldPaletteProps = {
  onAddField: (type: FieldType) => void
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-text-secondary">Insert field</p>
      <div className="flex flex-wrap gap-2">
        {PALETTE_TYPES.map((type) => (
          <PaletteItem key={type} type={type} onAdd={onAddField} />
        ))}
      </div>
    </div>
  )
}
