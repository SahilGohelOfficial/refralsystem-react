# Dynamic Forms — Admin Module Implementation Guide

> **API wiring:** see [FORMS_API_IMPLEMENTATION.md](FORMS_API_IMPLEMENTATION.md) for connecting this UI to the backend (`POST/PUT/DELETE /forms`).

## Overview

The admin **Dynamic Forms** module lets admins create, edit, and delete form schemas through a drag-and-drop builder. This is a **UI-only prototype**: all data is stored in `localStorage` under the key `admin:forms`. No API calls are made.

Reference implementation: [`ref_forms/`](ref_forms/) — a standalone form builder prototype.

Aligned with [`PROTOTYPE.md`](PROTOTYPE.md): route `/admin/forms` and **Forms** sidebar item.

---

## Reference Mapping from `ref_forms/`

| ref_forms source | Purpose in main app |
|------------------|---------------------|
| `ref_forms/src/types/form.ts` | `FormSchema`, `FormField`, `FieldType`, validation types |
| `ref_forms/src/lib/createField.ts` | Default field + empty schema factory |
| `ref_forms/src/lib/fieldId.ts` | Label-to-id slug, duplicate label validation |
| `ref_forms/src/lib/validateField.ts` | Preview/submit field validation |
| `ref_forms/src/hooks/useFormBuilder.ts` | Builder state reducer (adapted: no auto-save) |
| `ref_forms/src/components/builder/*` | Palette, canvas, properties panel, preview, DnD |
| `ref_forms/src/components/form/*` | Field renderers for preview |
| `ref_forms/src/lib/formStorage.ts` | **Extended** to multi-form list in `formsStorage.ts` |

**Key adaptation:** `ref_forms` stores a single schema (`form-builder:schema`). The admin module stores a **list** of forms keyed by `formId`.

---

## Data Model

```ts
type FieldType =
  | 'text' | 'textarea' | 'dropdown' | 'multi_dropdown'
  | 'radio' | 'multi_radio' | 'checkbox' | 'checkbox_group' | 'file'

type FormField = {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  options?: string[]
  validation?: FieldValidation
}

type FormSchema = {
  formId: string       // frm_<uuid8>
  title: string
  description?: string
  fields: FormField[]
  createdAt?: string   // ISO date — list display
  updatedAt?: string
}
```

**Storage:** `localStorage.getItem('admin:forms')` → `FormSchema[]`

**Storage API** (`src/lib/forms/formsStorage.ts`):

| Function | Description |
|----------|-------------|
| `listForms()` | Returns all forms, newest first |
| `getForm(formId)` | Returns one form or `null` |
| `saveForm(schema)` | Insert or update by `formId`; sets `updatedAt` |
| `deleteForm(formId)` | Removes form from list |

---

## Admin UI Flows (No API)

### List (`/admin/forms`)

- Load forms from `listForms()`
- Table columns: Title, Field count, Last updated, Actions
- Search by title
- **Create Form** → navigate to `/admin/forms/new`
- **Edit** → navigate to `/admin/forms/:formId/edit`
- **Delete** → confirm modal → `deleteForm()` → toast

### Create (`/admin/forms/new`)

- Start with `createEmptySchema()`
- Drag-and-drop builder (palette + canvas + properties panel)
- **Save** → validate schema → `saveForm()` → toast → redirect to list
- **Cancel** → navigate back to list
- **Preview** toggle → renders form with client-side validation (no response storage)

### Edit (`/admin/forms/:formId/edit`)

- Load schema via `getForm(formId)`; show not-found state if missing
- Same builder as create; **Save** updates existing entry

---

## File Structure

```
src/
  types/form.ts
  lib/forms/
    cn.ts
    createField.ts
    fieldId.ts
    validateField.ts
    formsStorage.ts
  hooks/useFormBuilder.ts
  components/forms/
    form/                    # Field renderers (preview)
    builder/                 # Builder UI (DnD)
  pages/Admin/
    Forms.tsx                # List + delete
    FormBuilderPage.tsx      # Create / edit wrapper
```

---

## Routing & Navigation

| Route | Component |
|-------|-----------|
| `/admin/forms` | `Forms` |
| `/admin/forms/new` | `FormBuilderPage` |
| `/admin/forms/:formId/edit` | `FormBuilderPage` |

Sidebar: **Forms** item at `/admin/forms` (between Referrals and Withdrawals).

i18n keys: `nav.admin.forms`, `forms.*` in `en`, `hi`, `gu` locale files.

---

## Styling Conventions

Builder components use the app design tokens instead of `ref_forms` zinc palette:

| ref_forms | Main app |
|-----------|----------|
| `text-zinc-900` | `text-text` |
| `text-zinc-500` | `text-text-secondary` |
| `border-zinc-200` | `border-border` |
| `bg-white` / `bg-zinc-800` | `bg-surface` / `bg-card` |
| `accent` | `primary` |
| `accent-muted` | `bg-primary/10` |
| `red-*` | `error` |

Reuse existing UI primitives where possible: `Button`, `Modal`, `Table`, `Card`, `Input`.

Builder-specific field components (`MultiSelect`, `CheckboxGroup`, `FileInput`, etc.) live under `components/forms/form/`.

---

## Dependencies

Required for drag-and-drop builder (from `ref_forms`):

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

---

## Builder Features

- **9 field types:** text, textarea, dropdown, multi_dropdown, radio, multi_radio, checkbox, checkbox_group, file
- **Drag from palette** or click to add fields
- **Reorder** fields on canvas via drag
- **Properties panel:** label, placeholder, options, validation rules
- **Duplicate label detection** via `fieldId.ts`
- **Preview mode:** live form render with validation (submit shows success message only)

---

## Future API Integration

When backend is ready, replace `formsStorage.ts` calls with a service layer. Suggested endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/forms` | List all forms |
| GET | `/admin/forms/:id` | Get one form schema |
| POST | `/admin/forms` | Create form |
| PUT | `/admin/forms/:id` | Update form |
| DELETE | `/admin/forms/:id` | Delete form |

Builder components and `useFormBuilder` should remain unchanged; only the page-level save/load/delete handlers swap storage for API calls.

---

## Out of Scope

- API calls / service files
- Agent-facing form fill/submit flows
- Response collection (`ref_forms/responseStorage.ts`)
- Reports or analytics on form submissions

---

## Verification Checklist

- [ ] Admin sidebar shows **Forms** link
- [ ] `/admin/forms` lists forms from localStorage
- [ ] Create → builder → Save → appears in list
- [ ] Edit → changes persist after refresh
- [ ] Delete → removed from list after confirm
- [ ] Preview mode renders all 9 field types
- [ ] Duplicate field labels show builder error
- [ ] No network calls in DevTools when using forms module
