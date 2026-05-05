## Context

The Thannigo app is a multi-role React Native/Expo app (customer, shop owner, delivery, admin, staff) with ~60+ screens built using Expo Router, NativeWind, and hand-rolled StyleSheet styles. A design system was started — `constants/theme.ts` contains `Typography`, `Spacing`, `Radius`, `Shadow`, `Colors`, and role palettes — but it was built in parallel with `styles/colors.ts`, `styles/typography.ts`, and `styles/spacing.ts`, producing two competing token systems. Screens inconsistently import from either source or use hardcoded values entirely. The UI library in `components/ui/` covers ~15 primitives but several screens bypass them in favor of inline styles.

The backend (`src/routes/v1/`) has 14 route namespaces across Express with controllers, services, and validators, but no systematic audit has been done for dead routes, inconsistent error formats, or unused middleware.

## Goals / Non-Goals

**Goals:**
- Single authoritative design token source (`constants/theme.ts`) consumed by all screens and components
- All `components/ui/` primitives audited: consistent spacing, touch targets (≥44px), dark mode, and state handling
- All screens refactored to eliminate hardcoded hex/size values in favor of theme tokens
- Responsive scaling hook (`useResponsive`) to replace hardcoded pixel values for cross-device layouts
- Full file-level audit of frontend + backend with a concrete action (KEEP/REFACTOR/DELETE) for every file
- Unused imports, dead functions, orphaned routes identified and removed
- Dependency audit with removal candidates and security-relevant updates flagged

**Non-Goals:**
- Changing navigation structure or routing logic
- Rebuilding any business logic (ordering, payments, delivery)
- Changing backend API contracts or database schema
- Adding new features or screens
- Migrating away from NativeWind/Tailwind or Expo Router

## Decisions

### D1: `constants/theme.ts` is the single design token source; `styles/` files become re-exports or are deleted

**Rationale**: `constants/theme.ts` is the most complete and already used by the newest components. Consolidating avoids import-site confusion. `styles/index.ts` can re-export from `constants/theme.ts` during the transition for backward compatibility, then be cleaned up in a follow-up.

**Alternative considered**: Keep `styles/` as the canonical source and copy tokens from `constants/theme.ts` there. Rejected — `constants/theme.ts` is more complete and used by more code.

### D2: `useResponsive` hook based on `Dimensions` + breakpoint map, not a library

**Rationale**: The app already has `Dimensions` from React Native. A thin hook (`useResponsive`) returning scale factors avoids adding another dependency (e.g. `react-native-responsive-screen`). Implementation: small (<380px width), medium (380-600px), large (>600px tablet).

**Alternative considered**: `react-native-size-matters` or `react-native-responsive-screen`. Rejected — adds a dependency for what is ~20 lines of code.

### D3: Screens are refactored in role groups, not all at once

**Rationale**: Auth screens affect all roles; customer/shop/delivery/admin have distinct component patterns. Batching by role group makes review and testing tractable. Order: auth → customer → shop → delivery → admin/staff → help.

### D4: Codebase audit produces a findings document before any deletion

**Rationale**: Blind deletion risks breaking functionality. Audit first produces a list with KEEP/REFACTOR/DELETE plus a risk rating. Deletions happen as a second pass after human review of the findings.

### D5: Backend audit covers routes and middleware only — not query optimization

**Rationale**: Query optimization (Sequelize N+1, index usage) requires profiling against live data and is out of scope for a UI/audit pass. The audit flags dead routes, missing validation, and security gaps only.

## Risks / Trade-offs

- **Breaking imports during token consolidation** → Mitigation: update `styles/index.ts` as a re-export shim before removing source files; use `grep` to verify all import sites updated before deleting.
- **NativeWind classes and StyleSheet coexist** → Some components use Tailwind className props, others use StyleSheet. We will not unify these in this pass — just ensure both reference the same color tokens via CSS variables or the theme object. Mixing is acceptable and documented.
- **Screen refactor scope is large (~60 screens)** → Mitigation: prioritize high-traffic screens (auth, customer home, checkout, order detail) and do role groups in batches. Measure lines of hardcoded styles before/after.
- **Deleting backend files may have undiscovered callers** → Mitigation: `grep`/`find` for every identified dead route before deletion; only DELETE files with zero references.
- **Dark mode regressions** → Refactoring styles must preserve `isDark`-conditional token paths. Every modified screen must be spot-checked in dark mode.

## Migration Plan

1. **Token consolidation** — Update `styles/index.ts` to re-export from `constants/theme.ts`; verify no import breaks; delete duplicate token files.
2. **Component audit** — Go through each `components/ui/` file, apply fixes, and write brief "before/after" notes in the component file header comment.
3. **Add `useResponsive` hook** — New file at `hooks/use-responsive.ts`; update `ScreenContainer` to use it.
4. **Screen refactor batches** — Auth → Customer → Shop → Delivery → Admin/Staff → Help. For each: replace hardcoded tokens, apply standard components, verify dark mode.
5. **Backend audit** — Run file-by-file analysis, produce `audit_report.md` findings, then execute REFACTOR/DELETE actions with sign-off.
6. **Dependency cleanup** — Run `depcheck` on both frontend and backend, remove confirmed unused packages.
7. **Final QA pass** — Spot-check each role flow on a small-device (375px) and large-device (428px) viewport.

**Rollback**: All changes are in-tree file edits with no data migrations. Rolling back is `git revert` of the relevant commits.

## Open Questions

- Should `styles/commonStyles.ts` be kept as a utility file for shared layout patterns (e.g., `flex: 1, padding: 16`) or deleted in favor of inline token usage? Decision needed before the screen refactor pass.
- Are there any screens that intentionally deviate from the design system (e.g., a promo screen with custom brand colors)? If so, they should be documented as exceptions rather than refactored.
- The backend has two `package.json` files (root + `backend/`). Confirm dependency audit covers both.
