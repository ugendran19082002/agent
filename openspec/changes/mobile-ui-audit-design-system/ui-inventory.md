# UI token inventory (Task 1.1)

**Date:** 2026-05-06  
**Source of truth:** `frontend/constants/theme.ts`

## Consolidated modules

| Module | Role |
|--------|------|
| `frontend/constants/theme.ts` | **Canonical** — palette, `Spacing`, `Radius`, `Typography`, `Shadow` / `makeShadow`, `Colors` (light/dark), `Fonts`, role helpers |
| `frontend/styles/index.ts` | Barrel re-export from `theme.ts` + `commonStyles` |
| `frontend/styles/commonStyles.ts` | `getCommonStyles(colors)` — layout, cards, form labels, primary/secondary buttons (**now uses `Shadow` tokens for cards**) |

## Removed / absent legacy split files

Per `production-ready-ui-audit` and grep: `styles/colors.ts`, `styles/typography.ts`, `styles/spacing.ts` are **not present** — duplication was already merged into `constants/theme.ts`.

## Hooks

| Hook | Path |
|------|------|
| `useResponsive()` | `frontend/hooks/use-responsive.ts` — `size` sm/md/lg, `isTablet`, `scale` (breakpoints co-sourced with **LayoutBreakpoints** in theme) |

## Primitives (audit targets)

| Component | Notes |
|-----------|------|
| `Button.tsx` | Uses `Spacing`, `Radius`; some literals normalized to tokens |
| `AppTextInput.tsx` | Uses `Radius`; spacing aligned to `Spacing`; error color uses theme `colors.error` in light/dark |
| `Card.tsx` | Uses `Shadow`, `Radius`, `Spacing` |
| `EmptyState.tsx` | Uses `Typography`, `Spacing`, `Shadow`; CTA uses shared `Button` |
| `Skeleton.tsx` | Radii aligned to `Radius` where applicable |
| `NoInternetBanner.tsx` | Uses `Spacing`, `Radius`, `Shadow`; top inset uses safe-area; banner bg uses semantic slate vs ad hoc brand red |

## Follow-up (not exhaustive in this pass)

- Grep `app/` / `components/` for remaining raw hex and numeric `padding`/`margin` (see `production-ready-ui-audit` tasks 1.5–1.6).
- Simulator matrix for task 2.4 / 7.1 remains QA-owned.
