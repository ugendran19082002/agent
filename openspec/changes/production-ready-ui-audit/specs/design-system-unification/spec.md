## ADDED Requirements

### Requirement: Single Token Source
The codebase SHALL use `constants/theme.ts` as the single authoritative source for all design tokens (colors, typography, spacing, radius, shadow). No other file SHALL define token values that duplicate those in `constants/theme.ts`.

#### Scenario: Importing colors in a screen
- **WHEN** any screen or component imports a color token
- **THEN** the import comes from `constants/theme.ts` (directly or via `styles/index.ts` re-export), not from a parallel `styles/colors.ts` definition

#### Scenario: Importing spacing values
- **WHEN** any screen or component uses a spacing constant
- **THEN** the value comes from the `Spacing` export in `constants/theme.ts` and not from a separately defined object in `styles/spacing.ts`

### Requirement: Backward-Compatible Re-Export Shim
The file `styles/index.ts` SHALL re-export all token objects from `constants/theme.ts` so existing import paths do not break during the transition period.

#### Scenario: Existing import of styles/index.ts
- **WHEN** a screen uses `import { Spacing } from '@/styles'`
- **THEN** the import resolves to the same object as `import { Spacing } from '@/constants/theme'`

#### Scenario: Duplicate token files are removed
- **WHEN** all import sites have been migrated to the canonical source
- **THEN** `styles/colors.ts`, `styles/typography.ts`, and `styles/spacing.ts` are deleted and no module references them

### Requirement: Token Coverage
`constants/theme.ts` SHALL define and export all of the following token categories:
- `Colors` — light and dark variants for all semantic roles (text, background, surface, primary, secondary, border, error, success, warning, muted)
- `Typography` — font size, weight, line height for h1–h4, body, label, caption, overline scales
- `Spacing` — named scale from `xxs` (4) to `3xl` (40)
- `Radius` — named scale sm–full
- `Shadow` — named levels none, xs, sm, md, lg, hero with platform-aware elevation/shadow

#### Scenario: Dark mode token resolution
- **WHEN** `useAppTheme()` returns `isDark: true`
- **THEN** `Colors.dark` is used for all token lookups, producing a visually distinct dark palette without any hardcoded overrides

#### Scenario: Role-specific accent tokens
- **WHEN** a component calls `useRoleTheme()`
- **THEN** it receives the correct accent, gradient, surface soft tint, and label for the authenticated user's role from `roleAccent`, `roleGradients`, `roleSurface`, and `roleLabel`

### Requirement: No Hardcoded Color Values in Components or Screens
Every screen and component in `app/` and `components/` SHALL reference color values through theme tokens. Inline hardcoded hex strings (e.g. `color: '#0077B6'`) SHALL NOT appear outside of `constants/theme.ts`.

#### Scenario: Lint/grep check passes
- **WHEN** the codebase is scanned for hex color patterns in `app/` and `components/`
- **THEN** zero matches are found outside of `constants/theme.ts` and `styles/index.ts`

#### Scenario: Hardcoded size values
- **WHEN** a screen uses a padding or margin value
- **THEN** it is expressed as `Spacing.md` (or equivalent) rather than a bare number like `padding: 16`
