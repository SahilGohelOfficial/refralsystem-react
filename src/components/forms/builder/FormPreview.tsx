import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Monitor, RotateCcw, Smartphone, Tablet } from 'lucide-react'
import type { FormAnswerValue, FormAnswers, FormSchema } from '../../../types/form'
import { validateField, validateForm } from '../../../lib/forms/validateField'
import { cn } from '../../../lib/forms/cn'
import Button from '../../ui/Button'
import DynamicFormRenderer from './DynamicFormRenderer'

type FormPreviewProps = {
  schema: FormSchema
}

type Viewport = 'mobile' | 'tablet' | 'desktop'

const VIEWPORTS: { id: Viewport; label: string; icon: typeof Smartphone; widthClass: string }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, widthClass: 'w-full max-w-[390px]' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, widthClass: 'w-full max-w-[768px]' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, widthClass: 'w-full max-w-3xl' },
]

function getDefaultAnswers(fields: FormSchema['fields']): FormAnswers {
  const answers: FormAnswers = {}
  for (const field of fields) {
    switch (field.type) {
      case 'checkbox':
        answers[field.id] = false
        break
      case 'multi_dropdown':
      case 'multi_radio':
      case 'checkbox_group':
        answers[field.id] = []
        break
      case 'file':
        answers[field.id] = null
        break
      default:
        answers[field.id] = ''
    }
  }
  return answers
}

export default function FormPreview({ schema }: FormPreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [answers, setAnswers] = useState<FormAnswers>(() =>
    getDefaultAnswers(schema.fields),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const fieldSignature = schema.fields.map((f) => `${f.id}:${f.type}:${f.label}`).join('|')

  useEffect(() => {
    setAnswers(getDefaultAnswers(schema.fields))
    setErrors({})
    setSubmitted(false)
  }, [schema.formId, fieldSignature, schema.title, schema.description])

  const handleChange = useCallback((fieldId: string, value: FormAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleBlur = useCallback(
    (fieldId: string) => {
      const field = schema.fields.find((f) => f.id === fieldId)
      if (!field) return
      const error = validateField(field, answers[fieldId])
      setErrors((prev) => {
        const next = { ...prev }
        if (error) next[fieldId] = error
        else delete next[fieldId]
        return next
      })
    },
    [schema.fields, answers],
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const formErrors = validateForm(schema.fields, answers)
    setErrors(formErrors)
    if (Object.keys(formErrors).length === 0) {
      setSubmitted(true)
    }
  }

  const handleFillAgain = () => {
    setAnswers(getDefaultAnswers(schema.fields))
    setErrors({})
    setSubmitted(false)
  }

  const activeViewport = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[2]
  const isCompact = viewport === 'mobile'

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border border-border bg-card/80 backdrop-blur-sm p-3 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/25">
            Live Preview
          </span>
          <span className="text-xs text-text-secondary truncate hidden sm:inline">
            {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div
          className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto"
          role="tablist"
          aria-label="Preview device size"
        >
          {VIEWPORTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={viewport === id}
              aria-label={`${label} preview`}
              onClick={() => setViewport(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all sm:px-3',
                viewport === id
                  ? 'bg-primary text-background shadow-[0_0_12px_rgba(212,160,23,0.25)]'
                  : 'text-text-secondary hover:text-text hover:bg-surface/80',
              )}
            >
              <Icon size={14} className="shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Device frame */}
      <div className="flex justify-center overflow-x-auto pb-2 -mx-1 px-1">
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            activeViewport.widthClass,
            viewport !== 'desktop' && 'rounded-[28px] border-2 border-border/80 bg-surface/50 p-2 sm:p-3 shadow-xl shadow-black/40',
          )}
        >
          {viewport !== 'desktop' && (
            <div className="flex items-center justify-center gap-1.5 pb-2 pt-0.5">
              <div className="h-1 w-10 rounded-full bg-border" aria-hidden />
            </div>
          )}

          <article
            className={cn(
              'glass-panel overflow-hidden',
              viewport === 'mobile' && 'rounded-[22px]',
              viewport === 'tablet' && 'rounded-[20px]',
              viewport === 'desktop' && 'rounded-[24px]',
            )}
          >
            {/* Form header */}
            <header className="border-b border-border bg-surface/60 px-4 py-5 sm:px-6 sm:py-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text leading-tight break-words">
                {schema.title || 'Untitled Form'}
              </h2>
              {schema.description ? (
                <p className="mt-2 text-sm text-text-secondary leading-relaxed break-words">
                  {schema.description}
                </p>
              ) : (
                <p className="mt-2 text-sm text-text-secondary/60 italic">
                  No description provided
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary border border-primary/20">
                  {schema.fields.length} field{schema.fields.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-xs text-text-secondary border border-border">
                  {viewport === 'mobile' ? '390px' : viewport === 'tablet' ? '768px' : 'Full width'}
                </span>
              </div>
            </header>

            {/* Form body */}
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-4 sm:py-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 border border-success/30">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text">Validation passed</p>
                    <p className="mt-1 text-sm text-text-secondary max-w-xs mx-auto">
                      Preview only — no data is saved. This is how users will see a successful submit.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleFillAgain}
                    className="gap-2"
                  >
                    <RotateCcw size={16} />
                    Fill again
                  </Button>
                </div>
              ) : schema.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-14 text-center">
                  <div className="rounded-full bg-surface border border-border p-4 mb-3">
                    <Monitor className="h-6 w-6 text-text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-text">No fields yet</p>
                  <p className="mt-1 text-xs text-text-secondary max-w-[240px]">
                    Switch to Edit mode and add fields to preview your form.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6" noValidate>
                  <DynamicFormRenderer
                    fields={schema.fields}
                    answers={answers}
                    errors={errors}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    compact={isCompact}
                  />

                  <div className="pt-2 border-t border-border/60">
                    <Button type="submit" fullWidth={isCompact || viewport === 'tablet'} size={isCompact ? 'lg' : 'md'}>
                      Submit
                    </Button>
                    <p className="mt-2 text-center text-xs text-text-secondary/70">
                      Preview submit — validates fields only
                    </p>
                  </div>
                </form>
              )}
            </div>
          </article>

          {viewport !== 'desktop' && (
            <div className="flex justify-center pt-2 pb-0.5" aria-hidden>
              <div className="h-1 w-24 rounded-full bg-border/80" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
