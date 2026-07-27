import {
  Checkbox,
  CheckboxGroup,
  FileInput,
  Input,
  MultiRadioGroup,
  MultiSelect,
  RadioGroup,
  Select,
  Textarea,
} from '../form'
import DatePicker from '../../ui/DatePicker'
import { getEffectiveDateBounds } from '../../../lib/forms/dateBounds'
import type {
  FormAnswerValue,
  FormAnswers,
  FormField,
  StoredFileAnswer,
} from '../../../types/form'

type DynamicFormRendererProps = {
  fields: FormField[]
  answers: FormAnswers
  errors: Record<string, string>
  onChange: (fieldId: string, value: FormAnswerValue) => void
  onBlur: (fieldId: string) => void
  onFilePreparingChange?: (fieldId: string, preparing: boolean) => void
  compact?: boolean
}

export default function DynamicFormRenderer({
  fields,
  answers,
  errors,
  onChange,
  onBlur,
  onFilePreparingChange,
  compact = false,
}: DynamicFormRendererProps) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-5 sm:gap-6'}`}>
      {fields.map((field) => {
        const error = errors[field.id]
        const required = field.validation?.required

        switch (field.type) {
          case 'text':
            return (
              <Input
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                required={required}
                error={error}
                value={(answers[field.id] as string) ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'textarea':
            return (
              <Textarea
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                required={required}
                error={error}
                rows={4}
                value={(answers[field.id] as string) ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'date': {
            const { min, max } = getEffectiveDateBounds(field.validation)
            return (
              <DatePicker
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                min={min}
                max={max}
                value={(answers[field.id] as string) ?? ''}
                onChange={(val) => onChange(field.id, val)}
                onBlur={() => onBlur(field.id)}
                placeholder={field.placeholder ?? 'Select date'}
              />
            )
          }
          case 'dropdown':
            return (
              <Select
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                value={(answers[field.id] as string) ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
              >
                <option value="" disabled>
                  {field.placeholder ?? 'Select an option'}
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )
          case 'multi_dropdown':
            return (
              <MultiSelect
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                required={required}
                error={error}
                options={field.options ?? []}
                value={(answers[field.id] as string[]) ?? []}
                onChange={(val) => onChange(field.id, val)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'radio':
            return (
              <RadioGroup
                key={field.id}
                name={field.id}
                label={field.label}
                required={required}
                error={error}
                options={field.options ?? []}
                value={(answers[field.id] as string) ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'multi_radio':
            return (
              <MultiRadioGroup
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                options={field.options ?? []}
                value={(answers[field.id] as string[]) ?? []}
                onChange={(val) => onChange(field.id, val)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'checkbox':
            return (
              <Checkbox
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                checked={(answers[field.id] as boolean) ?? false}
                onChange={(e) => onChange(field.id, e.target.checked)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'checkbox_group':
            return (
              <CheckboxGroup
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                options={field.options ?? []}
                value={(answers[field.id] as string[]) ?? []}
                onChange={(val) => onChange(field.id, val)}
                onBlur={() => onBlur(field.id)}
              />
            )
          case 'file':
            return (
              <FileInput
                key={field.id}
                id={field.id}
                label={field.label}
                required={required}
                error={error}
                accept={field.validation?.allowedFileTypes}
                maxSizeMB={field.validation?.maxFileSizeMB}
                value={(answers[field.id] as File | StoredFileAnswer | null | undefined) ?? null}
                onChange={(file) => onChange(field.id, file)}
                onBlur={() => onBlur(field.id)}
                onPreparingChange={
                  onFilePreparingChange
                    ? (preparing) => onFilePreparingChange(field.id, preparing)
                    : undefined
                }
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
