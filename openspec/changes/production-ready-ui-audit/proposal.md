## Why

The app has a partially built design system scattered across `constants/theme.ts`, `styles/colors.ts`, `styles/typography.ts`, and `styles/spacing.ts` with duplicated tokens and inconsistent adoption — screens mix inline hardcoded values with the theme system, components diverge in spacing and touch targets, and the backend has no systematic audit of unused routes, dead code, or architectural debt. The project is functionally complete but not production-ready in quality or maintainability.

## What Changes

- **Consolidate design tokens**: Merge `styles/colors.ts`, `styles/typography.ts`, `styles/spacing.ts` into `constants/theme.ts` as the single source of truth; delete duplicates
- **Standardize UI components**: Audit all `components/ui/` components for consistency — spacing, touch areas, dark mode, loading/empty/error states
- **Refactor all screens**: Replace inline hardcoded styles with theme tokens across all ~60+ screens (customer, delivery, admin, shop, auth, help)
- **Responsive layout system**: Add responsive scale utilities (`useResponsive` hook) to handle small phones → tablets without hardcoded pixel values
- **Full codebase audit**: File-by-file analysis of frontend and backend — identify unused components, dead API routes, orphaned utilities, duplicate code, and security gaps
- **Dependency cleanup**: Audit `package.json` (frontend + backend) for unused, heavy, or redundant packages; flag outdated ones
- **Backend architecture review**: Validate routes/controllers/services structure, error handling consistency, validation coverage, and security middleware

## Capabilities

### New Capabilities

- `design-system-unification`: Consolidate duplicate design tokens into a single authoritative theme module; establish token usage contract for all screens and components
- `responsive-ui-components`: Responsive scaling utilities and audited/standardized reusable UI components with consistent spacing, touch targets, and state handling (loading, empty, error)
- `screen-ui-standardization`: Systematic refactor of all app screens to consume design system tokens — eliminating hardcoded colors, sizes, and inline style objects
- `codebase-audit-cleanup`: Full project audit covering unused files, dead code, orphaned routes, dependency bloat, architecture issues, and security gaps across frontend and backend

### Modified Capabilities

- `ui-state-consistency`: Existing spec covers UI state — this change extends it to enforce empty/loading/error states uniformly across all role-specific screens using standardized components

## Impact

- **Frontend**: All screen files (`app/**/*.tsx`), all component files (`components/**/*.tsx`), style files (`styles/*.ts`), theme constants (`constants/theme.ts`), hooks (`hooks/`), and `package.json`
- **Backend**: All route files (`src/routes/`), controllers (`src/controllers/`), middleware (`src/middleware/`), and `package.json`
- **No breaking API changes** — this is a UI/style/structure improvement; no public contracts change
- **Coordination**: Screens using NativeWind Tailwind classes and StyleSheet must be audited separately; both coexist in the codebase
