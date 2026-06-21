# Multi-Language Feature Specification

## 1. Overview
The application will support multiple languages to ensure accessibility for different user demographics. 
The supported languages are:
1. **English (en)** - Default
2. **Hindi (hi)**
3. **Gujarati (gu)**

---

## 2. Implementation Strategy

### Technology Stack
- **`i18next`**: The core internationalization framework for JavaScript.
- **`react-i18next`**: React bindings that provide the `useTranslation` hook for easy text replacement.
- **`i18next-browser-languagedetector`**: Automatically detects browser language and persists user selections in `localStorage`.

### File Structure
All translation strings will be organized in a centralized `locales` folder, separated by language:
```text
src/
└── locales/
    ├── en/
    │   └── translation.json (English text)
    ├── hi/
    │   └── translation.json (Hindi text)
    └── gu/
        └── translation.json (Gujarati text)
```

---

## 3. User Flow

1. **Default State**: The application loads in English (or whatever language is saved in the user's `localStorage` from a previous session).
2. **Navigating to Settings**: The user logs in and navigates to the **Settings** or **Profile** page of their specific portal.
3. **Language Selection**: 
   - They find a "Localization" or "Language Preferences" section.
   - They select their preferred language from a beautifully styled dropdown.
4. **Instant Update**: The `i18next` engine instantly swaps all text on the screen to the selected language without requiring a page refresh. The preference is automatically saved.

---

## 4. Integration Points (Module Specifics)

Because there are three distinct portals, the language selector will be made available in all three so every user type can control their experience:

### Admin Portal
- **Location**: `/admin/settings`
- **Details**: Will be added as a dedicated card within the Admin Settings page.

### Agent Portal
- **Location**: `/agent/profile` or `/agent/settings`
- **Details**: Agents can change the language of their dashboard and user registration forms to better serve local clients.

### User Withdrawal Portal
- **Location**: `/withdrawal/profile` or `/withdrawal/settings`
- **Details**: End users can switch the language to understand wallet balances and withdrawal statuses in their native tongue.

---

## 5. Performance & Smoothness
To ensure the language switching feels instantaneous and premium:
- **Client-Side Caching**: Translations are bundled or loaded asynchronously and cached. Switching between already loaded languages will take `0ms`.
- **No Page Reloads**: The UI reacts dynamically using React state (`react-i18next` bindings), meaning the interface seamlessly transitions without a jarring full-page refresh.
- **Lazy Loading**: If translation files grow large, we can lazy-load the `hi` and `gu` JSON files only when requested to keep the initial application load blazing fast.

---

## 5. Next Steps for Implementation
1. Install dependencies (`npm install i18next react-i18next i18next-browser-languagedetector`).
2. Create the `i18n.ts` configuration file.
3. Scaffold the `locales` JSON files for `en`, `hi`, and `gu`.
4. Build a reusable `<LanguageSelector />` React component.
5. Embed the `<LanguageSelector />` into the Settings pages of all three portals.
6. Begin wrapping hardcoded UI text (like "Dashboard", "Total Users") with the `t()` translation function.
