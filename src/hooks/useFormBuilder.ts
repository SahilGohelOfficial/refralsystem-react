import { useCallback, useReducer } from 'react'
import {
  DuplicateFieldLabelError,
  assertUniqueFieldLabel,
  fieldWithLabelId,
  labelToFieldId,
  validateFormSchema,
} from '../lib/forms/fieldId'
import type { FieldType, FormField, FormSchema } from '../types/form'

type BuilderState = {
  schema: FormSchema
  selectedFieldIndex: number | null
  builderError: string | null
}

type BuilderAction =
  | { type: 'addField'; fieldType: FieldType; index?: number; field: FormField }
  | { type: 'updateField'; index: number; patch: Partial<FormField> }
  | { type: 'removeField'; index: number }
  | { type: 'reorderFields'; from: number; to: number }
  | { type: 'selectField'; index: number | null }
  | { type: 'setTitle'; title: string }
  | { type: 'setDescription'; description: string }
  | { type: 'setIsPublished'; isPublished: boolean }
  | { type: 'setSubmissionUserType'; submissionUserType: FormSchema['submissionUserType'] }
  | { type: 'setBuilderError'; error: string }
  | { type: 'clearBuilderError' }

function migrateLoadedSchema(schema: FormSchema): {
  schema: FormSchema
  builderError: string | null
} {
  const fields = schema.fields.map((f) => ({
    ...f,
    id: labelToFieldId(f.label),
  }))
  const migrated = { ...schema, fields }

  let builderError: string | null = null
  try {
    validateFormSchema(migrated)
  } catch (e) {
    if (e instanceof DuplicateFieldLabelError) {
      builderError = e.message
    } else {
      throw e
    }
  }

  return { schema: migrated, builderError }
}

function createInitialState(initialSchema: FormSchema): BuilderState {
  const { schema, builderError } = migrateLoadedSchema(initialSchema)
  return { schema, selectedFieldIndex: null, builderError }
}

function reducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'addField': {
      try {
        assertUniqueFieldLabel(state.schema.fields, action.field.label)
        const fields = [...state.schema.fields]
        const index = action.index ?? fields.length
        fields.splice(index, 0, action.field)
        return {
          schema: { ...state.schema, fields },
          selectedFieldIndex: index,
          builderError: null,
        }
      } catch (e) {
        if (e instanceof DuplicateFieldLabelError) {
          return { ...state, builderError: e.message }
        }
        throw e
      }
    }
    case 'updateField': {
      const field = state.schema.fields[action.index]
      if (!field) return state

      if (action.patch.label !== undefined) {
        try {
          const updated = fieldWithLabelId(
            field,
            action.patch.label,
            state.schema.fields,
            action.index,
          )
          const merged = { ...updated, ...action.patch, id: updated.id }
          const fields = state.schema.fields.map((f, i) =>
            i === action.index ? merged : f,
          )
          return {
            schema: { ...state.schema, fields },
            selectedFieldIndex: action.index,
            builderError: null,
          }
        } catch (e) {
          if (e instanceof DuplicateFieldLabelError) {
            return { ...state, builderError: e.message }
          }
          throw e
        }
      }

      const fields = state.schema.fields.map((f, i) =>
        i === action.index ? { ...f, ...action.patch } : f,
      )
      return {
        ...state,
        schema: { ...state.schema, fields },
        builderError: null,
      }
    }
    case 'removeField': {
      const fields = state.schema.fields.filter((_, i) => i !== action.index)
      let selectedFieldIndex = state.selectedFieldIndex
      if (selectedFieldIndex === action.index) {
        selectedFieldIndex = null
      } else if (
        selectedFieldIndex !== null &&
        selectedFieldIndex > action.index
      ) {
        selectedFieldIndex -= 1
      }
      return {
        schema: { ...state.schema, fields },
        selectedFieldIndex,
        builderError: null,
      }
    }
    case 'reorderFields': {
      const fields = [...state.schema.fields]
      const [moved] = fields.splice(action.from, 1)
      fields.splice(action.to, 0, moved)

      let selectedFieldIndex = state.selectedFieldIndex
      if (selectedFieldIndex !== null) {
        if (selectedFieldIndex === action.from) {
          selectedFieldIndex = action.to
        } else if (
          action.from < selectedFieldIndex &&
          action.to >= selectedFieldIndex
        ) {
          selectedFieldIndex -= 1
        } else if (
          action.from > selectedFieldIndex &&
          action.to <= selectedFieldIndex
        ) {
          selectedFieldIndex += 1
        }
      }

      return {
        ...state,
        schema: { ...state.schema, fields },
        selectedFieldIndex,
      }
    }
    case 'selectField':
      return { ...state, selectedFieldIndex: action.index }
    case 'setTitle':
      return {
        ...state,
        schema: { ...state.schema, title: action.title },
      }
    case 'setDescription':
      return {
        ...state,
        schema: { ...state.schema, description: action.description },
      }
    case 'setIsPublished':
      return {
        ...state,
        schema: { ...state.schema, isPublished: action.isPublished },
      }
    case 'setSubmissionUserType':
      return {
        ...state,
        schema: {
          ...state.schema,
          submissionUserType: action.submissionUserType,
        },
      }
    case 'setBuilderError':
      return { ...state, builderError: action.error }
    case 'clearBuilderError':
      return { ...state, builderError: null }
    default:
      return state
  }
}

export function useFormBuilder(initialSchema: FormSchema) {
  const [state, dispatch] = useReducer(
    reducer,
    initialSchema,
    createInitialState,
  )

  const clearBuilderError = useCallback(() => {
    dispatch({ type: 'clearBuilderError' })
  }, [])

  const selectedField =
    state.selectedFieldIndex !== null
      ? (state.schema.fields[state.selectedFieldIndex] ?? null)
      : null

  return {
    schema: state.schema,
    selectedFieldIndex: state.selectedFieldIndex,
    selectedField,
    builderError: state.builderError,
    dispatch,
    clearBuilderError,
  }
}

export type FormBuilderDispatch = ReturnType<typeof useFormBuilder>['dispatch']
