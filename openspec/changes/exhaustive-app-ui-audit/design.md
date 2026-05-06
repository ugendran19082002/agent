## Context

The ThanniGo mobile app uses Expo Router, a shared `constants/theme.ts` design token module, NativeWind in places, and many screens per role. Prior refactors (`mobile-ui-audit-design-system`, `production-ready-ui-audit`) improved foundations but did not encode an **exhaustive, no-skip** audit policy. This design defines how implementers sweep the tree, record findings, and merge work with existing theme and primitive components without forked token files.

## Goals / Non-Goals

**Goals:**

- A single **audit register** (spreadsheet or markdown matrix) listing **every** UI-related source file with status: not reviewed / issues / fixed / exempt (with reason).
- **Screen-level** notes for each route: header, body, lists, footer, spacing, alignment, scroll behavior.
- **Strict spacing** via existing `Spacing` tokens aligned to 4/8/12/16/20/24/32 (extend tokens only if a gap is truly global).
- **Responsive** layouts using flex and shared `useResponsive` / width rules; **no** uncorrected overflow on reference breakpoints.
- **Safe area + scroll** patterns applied per shell and per screen category.
- **Primitives first**: fix or extend `components/ui/*` before duplicating styles on screens.
- **Hygiene**: delete unused StyleSheets and merge duplicates; avoid inline objects in list item renders.

**Non-Goals:**

- Backend, API, or navigation graph rewrites.
- Full rebrand or new illustration set.
- Replacing NativeWind entirely in one pass (coexistence rules below).

## Decisions

**1. Canonical theme surface**

- **Choice:** Keep **`frontend/constants/theme.ts`** as the single token authority; `frontend/styles/index.ts` remains a barrel. Do **not** reintroduce separate top-level `spacing.ts`/`colors.ts` unless they re-export from theme only.
- **Rationale:** Matches existing codebase and prior audits; avoids a second source of truth.
- **Alternatives:** Split files under `theme/` with sub-exports (defer until file size forces it).

**2. Audit completeness**

- **Choice:** Enumerate files with `git ls-files` scoped to `frontend/app`, `frontend/components`, `frontend/styles`, `frontend/constants`, and layout-related `frontend/hooks`; mark non-UI files (e.g. pure API types) exempt explicitly.
- **Rationale:** Satisfies “do not skip” while avoiding false work on non-UI modules.
- **Alternatives:** Feature-area-only audit (rejected—contradicts requirement).

**3. Spacing exceptions**

- **Choice:** Allow **documented** one-off numerics only with a `// spacing-exception:` comment pointing to GitHub/issue or design rationale; CI or review enforces rarity.
- **Rationale:** Prevents scale erosion while allowing physics-based strokes (e.g. `hairlineWidth`).

**4. NativeWind vs StyleSheet**

- **Choice:** Where both exist, **screen-level** spacing for layout should still resolve to token values (Tailwind arbitrary values should match scale). Document precedence: token-equivalent class names preferred.
- **Rationale:** Project already mixes systems; full migration is non-goal.

**5. Ordering of work**

- **Choice:** (1) Inventory + register, (2) primitives + theme gaps, (3) auth/customer/shop/delivery/admin sweeps in that order or by traffic priority as long as register is updated.
- **Rationale:** Fixes propagate to screens when primitives are corrected first.

## Risks / Trade-offs

**Audit doc rots if not updated** → Tie register updates to each PR that touches a listed file.

**Large diff surface** → Ship by vertical slice (role) with feature flags off; visual QA per slice.

**Conflicting open changes** → Assign ownership in sprint: merge `production-ready-ui-audit` grep tasks with this register.

**Tablet layouts need design judgment** → Use max-width columns from design.md in `StitchScreenShell` pattern; document breakpoint numbers in theme.

## Migration Plan

1. Generate file list and empty audit register; align columns with spec IDs (audit, spacing, responsive, safe-scroll, primitives, hygiene).
2. Land any missing tokens in `theme.ts` (e.g. gap aliases) without visual change where possible.
3. Refine primitives; then sweep screens group by group, checking items in register.
4. Run lint + typecheck + targeted Detox smoke per role; update register to “fixed.”
5. Rollback: revert by slice (git revert per merged PR).

## Open Questions

- Whether to add automated ESLint rules for spacing literals (may be noisy with NativeWind).
- Exact Detox coverage for tablet vs manual-only sign-off.
- Dark mode spots still using raw hex in legacy marketing embeds—exempt or fix in same pass?
