import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { createDefaultField } from '../../../lib/forms/createField'
import { DuplicateFieldLabelError } from '../../../lib/forms/fieldId'
import { useFormBuilder } from '../../../hooks/useFormBuilder'
import type { FieldType, FormSchema } from '../../../types/form'
import { FIELD_TYPE_LABELS } from '../../../types/form'
import Button from '../../ui/Button'
import FieldPalette from './FieldPalette'
import FieldPropertiesPanel from './FieldPropertiesPanel'
import FormCanvas from './FormCanvas'
import FormPreview from './FormPreview'
import FormSettingsPanel from './FormSettingsPanel'

function fieldIndexId(index: number): string {
  return `field-index-${index}`
}

function parseFieldIndexId(id: string | number): number | null {
  const str = String(id)
  const match = str.match(/^field-index-(\d+)$/)
  return match ? Number(match[1]) : null
}

type FormBuilderProps = {
  initialSchema: FormSchema
  onSave: (schema: FormSchema) => void
  onCancel: () => void
  isSaving?: boolean
}

export default function FormBuilder({
  initialSchema,
  onSave,
  onCancel,
  isSaving = false,
}: FormBuilderProps) {
  const {
    schema,
    selectedFieldIndex,
    selectedField,
    builderError,
    dispatch,
    clearBuilderError,
  } = useFormBuilder(initialSchema)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null)
  const skipPaletteClick = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const addField = (fieldType: FieldType, index?: number) => {
    try {
      const newField = createDefaultField(fieldType, schema.fields)
      dispatch({
        type: 'addField',
        fieldType,
        index: index ?? schema.fields.length,
        field: newField,
      })
    } catch (e) {
      if (e instanceof DuplicateFieldLabelError) {
        dispatch({ type: 'setBuilderError', error: e.message })
      } else {
        throw e
      }
    }
  }

  const handlePaletteClick = (fieldType: FieldType) => {
    if (skipPaletteClick.current) return
    addField(fieldType)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.source === 'palette' && data.type) {
      setActiveDragType(data.type as FieldType)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current

    if (activeData?.source === 'palette' && activeData.type) {
      const fieldType = activeData.type as FieldType
      let index = schema.fields.length

      if (over.id !== 'form-canvas') {
        const overIndex = parseFieldIndexId(over.id)
        if (overIndex !== null) index = overIndex
      }

      skipPaletteClick.current = true
      addField(fieldType, index)
      requestAnimationFrame(() => {
        skipPaletteClick.current = false
      })
      return
    }

    if (activeData?.source === 'canvas' && active.id !== over.id) {
      const from = parseFieldIndexId(active.id)
      const to = parseFieldIndexId(over.id)
      if (from !== null && to !== null) {
        dispatch({ type: 'reorderFields', from, to })
      } else if (from !== null && over.id === 'form-canvas') {
        dispatch({ type: 'reorderFields', from, to: schema.fields.length - 1 })
      }
    }
  }

  const handleSave = () => {
    if (builderError) return
    onSave(schema)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Form Builder</h1>
            <p className="text-sm text-text-secondary mt-1">
              Drag fields to build your form schema.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPreviewMode((p) => !p)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} isLoading={isSaving} disabled={!!builderError}>
              Save Form
            </Button>
          </div>
        </div>

        {previewMode ? (
          <FormPreview schema={schema} />
        ) : (
          <>
            {builderError && (
              <div
                role="alert"
                className="flex items-start justify-between gap-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
              >
                <p>{builderError}</p>
                <button
                  type="button"
                  onClick={clearBuilderError}
                  className="shrink-0 hover:opacity-70"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            <FormSettingsPanel
              isPublished={schema.isPublished ?? true}
              submissionUserType={schema.submissionUserType ?? 'agent'}
              onPublishedChange={(isPublished) =>
                dispatch({ type: 'setIsPublished', isPublished })
              }
              onSubmissionUserTypeChange={(submissionUserType) =>
                dispatch({ type: 'setSubmissionUserType', submissionUserType })
              }
            />

            <div className="rounded-[20px] border border-border bg-card p-4">
              <FieldPalette onAddField={handlePaletteClick} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
              <main className="rounded-[20px] border border-border bg-card p-4">
                <FormCanvas
                  title={schema.title}
                  description={schema.description}
                  fields={schema.fields}
                  selectedFieldIndex={selectedFieldIndex}
                  onSelectField={(index) =>
                    dispatch({ type: 'selectField', index })
                  }
                  onRemoveField={(index) =>
                    dispatch({ type: 'removeField', index })
                  }
                  onTitleChange={(title) =>
                    dispatch({ type: 'setTitle', title })
                  }
                  onDescriptionChange={(description) =>
                    dispatch({ type: 'setDescription', description })
                  }
                  fieldIndexId={fieldIndexId}
                />
              </main>

              <aside className="rounded-[20px] border border-border bg-card p-4 lg:sticky lg:top-20 lg:self-start">
                <FieldPropertiesPanel
                  field={selectedField}
                  labelError={builderError}
                  onUpdate={(patch) => {
                    if (selectedFieldIndex === null) return
                    dispatch({
                      type: 'updateField',
                      index: selectedFieldIndex,
                      patch,
                    })
                  }}
                  onUpdateValidation={(patch) => {
                    if (selectedFieldIndex === null || !selectedField) return
                    dispatch({
                      type: 'updateField',
                      index: selectedFieldIndex,
                      patch: {
                        validation: { ...selectedField.validation, ...patch },
                      },
                    })
                  }}
                />
              </aside>
            </div>
          </>
        )}
      </div>

      <DragOverlay>
        {activeDragType ? (
          <div className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm shadow-lg text-text">
            {FIELD_TYPE_LABELS[activeDragType]}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
