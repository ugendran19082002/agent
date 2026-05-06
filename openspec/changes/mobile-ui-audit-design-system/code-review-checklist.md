# UI review checklist (task 6.2)

Use in PR review when touching `frontend/app/` or `frontend/components/`.

- [ ] No new raw `padding`/`margin` numbers without `Spacing.*` (or documented exception).
- [ ] No new arbitrary `fontSize` — use `Typography` roles or extend theme.
- [ ] No new hex colors — use `thannigoPalette` / `Colors` / `useAppTheme().colors`.
- [ ] Lists: avoid allocating new style objects inside `renderItem` / `FlatList` row render.
- [ ] Touch targets ≥ `TouchTarget.min` (import from `@/constants/theme`) or explicit `hitSlop`.
- [ ] Breakpoints: use `useResponsive()` / `LayoutBreakpoints`, not one-off width checks.

> **ESLint:** blanket `no-magic-numbers` is not enabled (too noisy for business logic). Prefer this checklist and future scoped custom rules if needed.
