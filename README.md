# Referral System (React)

Frontend for the multi-portal referral system — Admin, Agent, and User Withdrawal portals.

## Documentation

All project documentation lives in [`docs/`](docs/):

| Document | Description |
|----------|-------------|
| [PROTOTYPE.md](docs/PROTOTYPE.md) | UI/UX specification, routes, and user journeys |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Frontend API reference (admins, agents) |
| [DYNAMIC_FORMS.md](docs/DYNAMIC_FORMS.md) | Dynamic form builder guide |
| [FORMS_API_IMPLEMENTATION.md](docs/FORMS_API_IMPLEMENTATION.md) | Forms module API wiring |
| [LANGUAGE_FEATURE.md](docs/LANGUAGE_FEATURE.md) | i18n (en / hi / gu) specification |
| [AGENT_PROFILE_IMPLEMENTATION.md](docs/AGENT_PROFILE_IMPLEMENTATION.md) | Agent sign-up, profile, and password |

Backend API docs: [`api/docs/`](api/docs/)

## Development

```bash
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` to point at the backend (default in code if unset).
