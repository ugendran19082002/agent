## Context

The product is a multi-screen React Native application with shared components. Styling is expected to be split across theme constants, StyleSheets, and occasional inline objects, which often leads to drift: duplicate numeric values, inconsistent vertical rhythm, and layouts tuned for a single device size. This change codifies a single design system and a repeatable audit path so implementation can proceed in parallel across feature areas without re-debating spacing or type scales each time.

## Goals / Non-Goals

**Goals:**

- One authoritative token set for spacing, typography, color roles, radii, and elevation, imported by screens and primitives.
- Responsive defaults using flex, `flexGrow`/`flexShrink`, percentage widths, and measured breakpoints only where needed—not fixed pixel layouts that break on small or large devices.
- Reusable UI primitives (buttons, inputs, cards, list rows, headers) with uniform padding, minimum touch targets (~44pt), and aligned borders/shadows.
- A screen-level conformance pass: every route-level screen audited for token usage, hardcoded dimensions, and duplicate styles removed or consolidated.
- Style creation patterns that avoid recreating style objects on every render where it affects performance.

**Non-Goals:**

- Full visual rebrand or new illustration/iconography system (colors may be rationalized but not replaced wholesale unless already planned).
- Backend API, data model, or navigation structure changes.
- Replacing the navigation library or state management.

## Decisions

**1. Single theme module (or clearly split theme barrel)**

- **Choice**: Consolidate design tokens in one import surface (e.g. `constants/theme.ts` or `theme/index.ts`) exporting `spacing`, `typography`, `colors`, `radii`, `shadows`, and semantic text variants.
- **Rationale**: One import reduces divergence; linters and code review can enforce “no raw numbers” for spacing and font sizes.
- **Alternatives**: Colocated tokens per feature (rejected—reintroduces drift); CSS-in-JS-only theme (only viable if the codebase already standardizes on it).

**2. Spacing scale**

- **Choice**: Fixed scale (e.g. 4/8/12/16/20/24/32) with no arbitrary values except rare edge cases documented inline with a comment.
- **Rationale**: Predictable vertical rhythm and faster layout decisions.
- **Alternatives**: Fluid spacing only (harder to QA); 8pt-only grid (sometimes too coarse for tight rows).

**3. Typography**

- **Choice**: Named roles (`display`, `title`, `body`, `caption`, `label`) mapping to size, weight, lineHeight, and letterSpacing; components reference roles, not raw sizes.
- **Rationale**: Accessibility and device scaling are easier when roles change in one place.
- **Alternatives**: Per-screen font sizes (rejected—inconsistent); dynamic type plugins (optional later).

**4. Responsiveness**

- **Choice**: Prefer flex and relative units; use `useWindowDimensions` or a small `useResponsive` helper for breakpoints (e.g. phone / large phone / tablet) when multi-column or wider gutters are required.
- **Rationale**: Minimizes magic numbers and aligns with RN layout model.
- **Alternatives**: Only Portrait iPhone SE testing (rejected—fails tablets); `PixelRatio`-for-everything (use sparingly to avoid fuzzy borders).

**5. Component strategy**

- **Choice**: Strengthen existing shared components under a `components/ui` (or equivalent) namespace; add thin wrappers only when duplication appears three or more times.
- **Rationale**: Avoid abstracting too early while still killing duplication.
- **Alternatives**: Full third-party UI kit (rejected—large migration and bundle cost).

**6. Performance**

- **Choice**: `StyleSheet.create` or memoized style objects at module scope; avoid inline objects/functions in hot lists (`FlatList` rows).
- **Rationale**: Reduces needless re-renders in lists and tab screens.

## Risks / Trade-offs

**Token migration is tedious** → Mitigate with codemod-friendly patterns (`spacing.md` not `13`), automate ESLint `no-magic-numbers` for JSX where feasible, and migrate by app section.

**Stricter tokens may slow one-off experiments** → Mitigate with a short-lived `theme.experimental` slot or feature-flagged styles, not scattered literals.

**Tablet layouts may require new breakpoints** → Mitigate by listing breakpoints in one module and documenting max content width for large screens.

**Overlap with prior change `production-ready-ui-audit`** → Align file paths and naming during implementation; merge or archive one proposal to avoid duplicate work.

## Migration Plan

1. Land theme tokens and exports; document import path in README or AGENTS note for contributors.
2. Refactor primitives (`Button`, inputs, cards) to consume tokens first—screens inherit fixes for free.
3. Sweep screens by area (auth → customer → shop → delivery → admin) replacing literals and tightening layouts.
4. Run smoke tests on small/large simulators and one tablet target; fix regressions.
5. Optional rollback: revert per-PR; keep tokens backward-compatible (same visual) in the first pass if needed.

## Open Questions

- Whether NativeWind/Tailwind and StyleSheet coexist in the repo—if so, which layer owns spacing (document a single precedence rule).
- Whether dark mode is in scope for the first pass; if yes, semantic color roles (`surface`, `onSurface`, `primary`) must be confirmed.
- Exact ESLint/prettier rules the repo already enforces for numeric literals—may need a small custom rule for `padding`/`margin` keys.
