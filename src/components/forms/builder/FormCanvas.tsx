import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { FormField } from '../../../types/form'
import CanvasFieldItem from './CanvasFieldItem'

type FormCanvasProps = {
  title: string
  description?: string
  fields: FormField[]
  selectedFieldIndex: number | null
  onSelectField: (index: number) => void
  onRemoveField: (index: number) => void
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  fieldIndexId: (index: number) => string
}

export default function FormCanvas({
  title,
  description,
  fields,
  selectedFieldIndex,
  onSelectField,
  onRemoveField,
  onTitleChange,
  onDescriptionChange,
  fieldIndexId,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'form-canvas' })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Form title"
          className="w-full border-0 bg-transparent text-xl font-bold text-text outline-none placeholder:text-text-secondary/50"
        />
        <input
          type="text"
          value={description ?? ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Form description (optional)"
          className="mt-1 w-full border-0 bg-transparent text-sm text-text-secondary outline-none placeholder:text-text-secondary/50"
        />
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-48 flex-1 rounded-lg border-2 border-dashed p-4 transition-colors ${
          isOver
            ? 'border-primary bg-primary/5'
            : 'border-border'
        }`}
      >
        {fields.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            Drag fields here to build your form
          </p>
        ) : (
          <SortableContext
            items={fields.map((_, index) => fieldIndexId(index))}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <CanvasFieldItem
                  key={fieldIndexId(index)}
                  field={field}
                  sortableId={fieldIndexId(index)}
                  isSelected={selectedFieldIndex === index}
                  onSelect={() => onSelectField(index)}
                  onRemove={() => onRemoveField(index)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
