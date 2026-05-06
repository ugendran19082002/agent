## 1. Theme and token foundation

- [x] 1.1 Inventory existing color, spacing, type, and shadow definitions across the app; list duplicates and legacy files to merge or retire.
- [x] 1.2 Implement (or consolidate) the central theme module exporting `spacing`, `typography` roles, semantic `colors`, `radii`, and `shadows`/`elevation` presets.
- [x] 1.3 Replace ad hoc literals in foundational styles with named tokens; add short contributor note (import path and “no raw spacing literals” rule).
- [x] 1.4 Align semantic error/success/surface/on-surface colors for inline validation and banners with token names.

## 2. Responsive layout

- [x] 2.1 Add or unify a `useResponsive` / `useWindowDimensions` helper with documented breakpoints for phone vs large phone vs tablet.
- [x] 2.2 Audit root screen containers for flex-first layout; fix clipped or fixed-height content using `ScrollView`/`FlatList` where needed.
- [x] 2.3 Apply safe-area handling consistently for top/bottom/horizontal insets on notched devices.
- [ ] 2.4 Verify representative flows on small, large, and tablet simulators/emulators; fix overflow and alignment issues.

## 3. UI primitives

- [x] 3.1 Standardize primary/secondary buttons: height, radius, padding, typography role, disabled/loading/pressed states using tokens only.
- [x] 3.2 Standardize text inputs and selects: padding, radius, label/helper/error type roles, and border colors from semantics.
- [x] 3.3 Standardize cards/surfaces and list row chrome: elevation tokens, divider thickness/color, and consistent horizontal padding.
- [x] 3.4 Enforce minimum touch targets (and `hitSlop` where documented) on compact rows and icon buttons.

## 4. Screen conformance and audit

- [x] 4.1 Produce the screen-wise audit matrix (feature area → issues: spacing, type, hardcoded dimensions, duplicate styles, inline hot paths).
- [ ] 4.2 Refactor auth and onboarding screens to theme tokens and primitives; remove duplicate static styles.
- [ ] 4.3 Refactor customer-facing screens to tokens and primitives; consolidate repeated fragments into shared styles or components.
- [ ] 4.4 Refactor shop owner screens to tokens and primitives; align tables/lists with responsive rules.
- [ ] 4.5 Refactor delivery and logistics screens to tokens and primitives; verify list performance (no inline styles in `renderItem`).
- [ ] 4.6 Refactor admin/help/settings screens to tokens and primitives; verify wide layouts.
- [ ] 4.7 Eliminate or merge duplicate/unused style modules discovered during the audit.

## 5. Loading, empty, error, and offline surfaces

- [x] 5.1 Align skeleton/loader spacing and width with content containers using theme spacing.
- [x] 5.2 Align `EmptyState` (and equivalents) with typography roles and button primitives for CTAs.
- [x] 5.3 Align error and offline banners with semantic colors, spacing scale, and retry actions via shared button styles.

## 6. Performance and cleanup

- [ ] 6.1 Replace static inline style objects in hot paths with `StyleSheet.create` or memoized styles; profile list screens if needed.
- [x] 6.2 Add or tighten lint rules (or code-review checklist) discouraging magic numbers for margin/padding/fontSize where tokens exist.

## 7. Verification and handoff

- [ ] 7.1 Complete the before/after audit summary and attach device matrix results (small phone, large phone, tablet).
- [ ] 7.2 Run automated tests and smoke critical journeys after UI refactors; fix regressions.
- [x] 7.3 Resolve overlap with `production-ready-ui-audit` (merge scope, archive duplicate tasks, or reconcile theme paths) so owners are not duplicated.
