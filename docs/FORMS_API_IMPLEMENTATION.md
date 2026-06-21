# Forms API Implementation Guide

> **UI builder complete** — see [DYNAMIC_FORMS.md](DYNAMIC_FORMS.md) for the drag-and-drop builder. This document covers wiring the admin Forms module to the real backend APIs.

## Overview

Replace `localStorage` (`admin:forms`) with NestJS form endpoints. The builder UI in `src/components/forms/builder/` stays unchanged; only the data layer and pages change.

**API contract:** [api/docs/super-admin-form-api-reference.md](../api/docs/super-admin-form-api-reference.md)  
**Full form flows:** [api/docs/frontend-api-reference.md](../api/docs/frontend-api-reference.md)  
**Backend source:** [api/src/controllers/form.controller.ts](../api/src/controllers/form.controller.ts), [api/src/services/form.service.ts](../api/src/services/form.service.ts), [api/src/dto/form.dto.ts](../api/src/dto/form.dto.ts), [api/src/entities/forms.entity.ts](../api/src/entities/forms.entity.ts)

---

## Authentication and access

| Action | Endpoint | Who can call |
|--------|----------|--------------|
| List | `GET /forms` | Authenticated admin or agent JWT |
| Get schema | `GET /forms/:id` | Authenticated admin or agent JWT |
| Create | `POST /forms` | **superAdmin only** |
| Update | `PUT /forms/:id` | **superAdmin only** |
| Delete | `DELETE /forms/:id` | **superAdmin only** |

- Base URL: `VITE_API_URL` via [src/lib/api.ts](src/lib/api.ts) (`Authorization` + `Accept-Language` headers)
- Super-admin login: `POST /admins/login` with `role: "superAdmin"`
- **List** (`/admin/forms`): all admins can view
- **Create / Edit / Delete**: superAdmin only — routes guarded + buttons hidden for regular admins

---

## Architecture

```
Forms.tsx          → GET /forms, DELETE /forms/:id
FormBuilderPage    → GET /forms/:id (edit), POST /forms (create), PUT /forms/:id (update)
forms.service.ts   → api() wrapper
formMappers.ts     → Form ↔ FormSchema ↔ payloads
```

---

## Backend validation rules

| Rule | Backend | Frontend impact |
|------|---------|-----------------|
| Field `id` unique per form | `form.service.ts` → `assertValidFields` | `fieldId.ts` slug logic; unique IDs in payload |
| Option types need `options[]` | `form.dto.ts` | Builder adds default options |
| `submissionUserType` required on create | `CreateFormSchema` | Builder settings default `'agent'` |
| `title` 1–255 chars | Zod | Validate before save |
| `description` max 2000 | Zod | Validate before save |
| `fields` on PUT replaces entire array | `form.service.ts` `update` | Always send full `fields` on save |
| Soft delete | `form.service.ts` `remove` | Form disappears from `GET /forms` |

---

## Type mapping

### API types (`src/types/api.ts`)

- `FormSummary` — list row from `GET /forms`
- `Form` — full schema from `GET /forms/:id`, `POST`, `PUT`
- `CreateFormPayload` / `UpdateFormPayload`

### Builder state (`src/types/form.ts`)

`FormSchema` extends with `isPublished`, `submissionUserType`. `formId` maps to API `Form.id` (UUID from server on create).

### Mappers (`src/lib/forms/formMappers.ts`)

| Function | Purpose |
|----------|---------|
| `toFormSchema(form)` | API `Form` → builder state |
| `toCreatePayload(schema)` | New form → `POST /forms` body |
| `toUpdatePayload(schema)` | Edit → `PUT /forms/:id` body |

---

## Service layer (`src/services/forms.service.ts`)

```ts
listForms()           → GET  /forms
getForm(id)           → GET  /forms/:id
createForm(payload)   → POST /forms
updateForm(id, body)  → PUT  /forms/:id
deleteForm(id)        → DELETE /forms/:id
```

---

## Page integration

### Forms list (`src/pages/Admin/Forms.tsx`)

- Fetch on mount via `listForms()` service
- Columns: Title, Published, Submission type, Last updated, Actions
- Delete via API with confirm modal
- Hide Create / Edit / Delete for `user.role !== 'superAdmin'`

### Form builder page (`src/pages/Admin/FormBuilderPage.tsx`)

- **Create:** `createEmptySchema()` with `isPublished: true`, `submissionUserType: 'agent'`
- **Edit:** `getForm(id)` on mount; loading + 404 states
- **Save:** `POST` (create) or `PUT` (update) via mappers
- Routes wrapped in `ProtectedRoute allowedRoles={['superAdmin']}`

### Builder settings (`FormBuilder.tsx`)

- `isPublished` toggle
- `submissionUserType` select (`agent` | `user`)

---

## Error handling

| Status | Key | UI behavior |
|--------|-----|-------------|
| `400` | `form.duplicateFieldId` | Toast |
| `400` | `form.optionsRequired` | Toast |
| `403` | `auth.notAuthorized` | Toast — super admin required |
| `404` | `form.notFound` | Not-found state / redirect |
| `401` | `auth.*` | Global handler in `api()` |

Use `formatApiError()` for toast messages.

---

## Deprecation

[src/lib/forms/formsStorage.ts](src/lib/forms/formsStorage.ts) is no longer used for CRUD. Safe to remove in a follow-up cleanup.

---

## Verification checklist

- [ ] Super admin: create form → appears in `GET /forms` list
- [ ] Super admin: edit → `PUT` persists after refresh
- [ ] Super admin: delete → soft-deleted, gone from list
- [ ] Regular admin: can list forms, cannot create/edit/delete
- [ ] API validation errors surface in toasts
- [ ] `GET /forms/:id` loads full schema for edit (all 9 field types)
- [ ] No `localStorage` reads/writes for form CRUD

---

## Out of scope

- Agent form submit (`POST /forms/:id/responses`)
- S3 presign upload (`POST /forms/:id/uploads/presign`)
- Response listing/deletion

---

## Implementation order

1. Types + mappers + `forms.service.ts`
2. `Forms.tsx` list + delete via API
3. `FormBuilderPage.tsx` create/edit via API
4. Builder settings + `useFormBuilder` extensions
5. Route guards + i18n
6. Remove `formsStorage` usage
