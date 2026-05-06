## Why

The React Native client has grown across many routes, shared components, and style helpers; without an **exhaustive**, file-complete audit, spacing drift, fixed layouts, duplicate styles, and inconsistent primitives will keep reappearing despite partial refactors. This change establishes a **mandatory full-codebase UI audit** and a enforceable contract for spacing, responsiveness, safe areas, scrolling, primitives, centralized theme usage, and cleanup so the app can match a production, consumer-app quality bar (clear hierarchy, no overflow, predictable rhythm).

## What Changes

- **Full-tree audit**: Systematic review of **every** relevant UI file under the mobile app (`app/`, `components/`, theme/styles, layout utilities, hooks used for layout)—documented with a **file-wise and screen-wise issue register**; **no files skipped** by policy except non-UI files explicitly excluded in design.
- **Screen-by-screen pass**: For each route-level screen, validate structure top → middle → bottom (headers, body, lists, actions, footers) for spacing, alignment, and balance.
- **Spacing system**: Enforce the shared scale (**4, 8, 12, 16, 20, 24, 32** mapped through design tokens); eliminate ad hoc padding/margin numbers except documented exceptions.
- **Responsiveness**: Replace brittle fixed width/height with flex, percentage widths, and shared breakpoint helpers; prevent overflow on small phones, large phones, and tablets.
- **Safe area & scroll**: Standardize safe-area usage and scroll/list containment so content does not sit under notches/status bars and long content scrolls predictably.
- **Component primitives**: One standard for buttons, cards, inputs, list rows (heights, radius, padding, type roles).
- **Central theme**: Consolidate consumption through the existing **`constants/theme.ts`** (and barrel exports); avoid parallel `spacing.ts`/`colors.ts` forks unless migrated into the single surface described in design.
- **Cleanup & performance**: Remove duplicate and unused styles, reduce harmful inline style churn in hot paths (`FlatList`/`ScrollView` children), simplify nesting where it improves clarity.

## Capabilities

### New Capabilities

- `rn-exhaustive-audit-coverage`: Mandatory enumeration and audit of all UI-related files; file-wise and screen-wise issue list; explicit completeness criteria (what “done” means per folder).
- `rn-spacing-scale-contract`: Normative spacing scale and replacement of non-token spacing literals across the codebase.
- `rn-responsive-overflow-contract`: Layout rules for flex/relative sizing, breakpoints, and overflow prevention across device classes.
- `rn-safe-area-scroll-contract`: Safe-area insets, `ScrollView`/`FlatList` usage, and overlap avoidance with system chrome.
- `rn-ui-primitives-contract`: Standard heights, padding, radii, and typography roles for buttons, cards, inputs, and list items.
- `rn-theme-cleanup-hygiene`: Central theme modules, removal of duplicate/unused styles, and performance-oriented style patterns.

### Modified Capabilities

- `ui-state-consistency`: Extend requirements so loading, empty, error, and offline surfaces are included in the exhaustive audit and must conform to the same spacing, typography, and primitive patterns as primary content (audit completeness, not new product behaviors).

## Impact

- **Frontend only:** `frontend/app/**`, `frontend/components/**`, `frontend/constants/theme.ts`, `frontend/styles/**`, responsive/layout hooks, and related tests/snapshots.
- **Coordination:** Overlaps with in-repo changes **`mobile-ui-audit-design-system`** and **`production-ready-ui-audit`** — executor MUST dedupe task lists and merge findings to avoid duplicated audit work.
- **No backend API or contract changes.**
- **No breaking public API** for the mobile app beyond internal style refactors; visual output may shift where incorrect spacing/layout is corrected.
