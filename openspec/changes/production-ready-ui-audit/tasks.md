## 1. Design Token Consolidation

- [x] 1.1 Audit `styles/colors.ts`, `styles/typography.ts`, `styles/spacing.ts` — list every token that differs from or duplicates `constants/theme.ts`
- [x] 1.2 Update `styles/index.ts` to re-export `Colors`, `Typography`, `Spacing`, `Radius`, `Shadow` from `constants/theme.ts` (backward-compat shim)
- [x] 1.3 Search all files in `app/` and `components/` for direct imports of `styles/colors.ts`, `styles/typography.ts`, `styles/spacing.ts` — migrate each to `constants/theme.ts` or `@/styles`
- [x] 1.4 Delete `styles/colors.ts`, `styles/typography.ts`, `styles/spacing.ts` after all imports are migrated and no remaining references exist
- [ ] 1.5 Grep `app/` and `components/` for bare hex strings (e.g. `'#[0-9a-fA-F]{3,6}'`) and replace each with the corresponding theme token
- [ ] 1.6 Grep `app/` and `components/` for bare numeric padding/margin values (e.g. `padding: 16`) and replace with `Spacing.*` tokens

## 2. Responsive Utilities

- [x] 2.1 Create `hooks/use-responsive.ts` with `useResponsive()` returning `{ size: 'sm'|'md'|'lg', scale: number, isTablet: boolean }` based on `Dimensions.get('window').width`
- [x] 2.2 Add `Dimensions` change listener in `useResponsive` so it re-evaluates on orientation change
- [x] 2.3 Update `components/ui/ScreenContainer.tsx` to use `useResponsive` for horizontal padding (md on small, xl on tablet, center-constrained max-width on tablet)
- [x] 2.4 Search screens for `width: 375` or other hardcoded device-pixel widths and replace with `'100%'` or `flex: 1`

## 3. UI Component Audit & Standardization

- [x] 3.1 Audit `components/ui/Button.tsx` — verify minimum 44dp touch height for `size="sm"`, check dark mode label contrast, add `hitSlop` if needed
- [x] 3.2 Audit `components/ui/Card.tsx` — verify it uses `Shadow` tokens, `Radius` tokens, and `Colors.surface`/`Colors.dark.surface` correctly
- [x] 3.3 Audit `components/ui/AppTextInput.tsx` — verify `Colors.inputBg`, `Colors.placeholder`, `Colors.border`, and error state using `Colors.error`
- [x] 3.4 Audit `components/ui/Badge.tsx` — verify semantic color variants (success/warning/error/info) all use theme tokens
- [x] 3.5 Audit `components/ui/EmptyState.tsx` — verify it accepts icon, title, subtitle, action button props; uses `Typography` and `Spacing` tokens
- [x] 3.6 Audit `components/ui/Skeleton.tsx` — verify animation uses `Colors.border` → `Colors.inputBg` interpolation; accepts width/height props
- [x] 3.7 Audit `components/ui/PageHeader.tsx` — verify it uses `Typography.h3`/`Typography.h4`, role gradient or neutral header, and `BackButton` with `hitSlop`
- [x] 3.8 Audit `components/ui/StatCard.tsx` — verify it uses `Typography.h2` for value, `Typography.caption` for label, theme surface/shadow
- [x] 3.9 Audit `components/ui/RoleHeader.tsx` — verify role gradient, role label, and accent come from `roleGradients`, `roleLabel`, `roleAccent` in `constants/theme.ts`
- [x] 3.10 Audit `components/ui/PromoBanner.tsx`, `Timeline.tsx`, `ProgressBar.tsx`, `NoInternetBanner.tsx` for token compliance

## 4. Auth Screen Refactor

- [x] 4.1 Refactor `app/auth/login.tsx` — replace inline hex/size values with theme tokens, verify `AppTextInput` and `Button size="lg"` are used
- [x] 4.2 Refactor `app/auth/otp.tsx` — standardize digit input sizing with `Spacing` tokens, verify resend timer uses `Colors.muted`
- [x] 4.3 Refactor `app/auth/role.tsx` — verify role selector cards use `roleSurface`, `roleAccent`, and `Card` component
- [x] 4.4 Refactor `app/auth/quick-login.tsx` and `app/auth/forgot-pin.tsx` — apply theme tokens throughout

## 5. Customer Screen Refactor

- [ ] 5.1 Refactor `app/(customer)/` tab screens — verify `Colors.customerSoft`, customer blue accent, `ScreenContainer`, and `PageHeader` usage
- [ ] 5.2 Refactor `app/customer-payment-history.tsx`, `app/customer-payment-methods.tsx` — apply `Card`, `Typography`, `Spacing` tokens
- [ ] 5.3 Refactor `app/customer-reviews.tsx`, `app/customer-analytics.tsx` — apply `StatCard`, `EmptyState`, and `Skeleton` where applicable
- [ ] 5.4 Refactor `app/customer-raise-complaint.tsx` — verify `AppTextInput`, `Button`, `FormErrorMessage` usage with theme tokens
- [ ] 5.5 Audit `components/customer/CustomerHomeShopCard.tsx` — apply `Card`, `Shadow.sm`, and `Spacing.md` tokens

## 6. Shop Owner Screen Refactor

- [ ] 6.1 Refactor `app/shop/` and `app/(shop)/` screens — replace hardcoded teal with `Colors.shopAccent`/`thannigoPalette.shopTeal` from theme
- [ ] 6.2 Verify shop order list uses `Card`, semantic `Badge` for status, `EmptyState` for empty, `Skeleton` for loading
- [ ] 6.3 Refactor shop settings, product management, and staff management screens for token compliance

## 7. Delivery Screen Refactor

- [ ] 7.1 Refactor `app/delivery/index.tsx` — apply delivery green accent, `Card`, `Spacing` tokens
- [ ] 7.2 Refactor `app/delivery/task/[taskId].tsx` — verify status colors use `Colors.success`/`Colors.warning`/`Colors.error`
- [ ] 7.3 Refactor `app/delivery/earnings.tsx` — apply `StatCard` for summary figures, `Typography.h2` for amounts
- [ ] 7.4 Refactor `app/delivery/history.tsx` — apply `EmptyState`, `Skeleton`, and `DeliveryTripCard` token compliance
- [ ] 7.5 Audit `components/delivery/DeliveryTripCard.tsx` — standardize padding, typography, shadow tokens

## 8. Admin Screen Refactor

- [ ] 8.1 Refactor `app/admin/index.tsx` and `app/admin/(tabs)/` — apply admin red accent, `PageHeader`, `Card`, `StatCard`
- [ ] 8.2 Refactor `app/admin/orders.tsx` and `app/admin/order/[id].tsx` — apply semantic badge colors, `Spacing` row gaps, `Typography.label` headers
- [ ] 8.3 Refactor `app/admin/error-logs/index.tsx` and `app/admin/error-logs/[id].tsx` — apply severity badges, `Typography.body` for error text, no hardcoded colors
- [ ] 8.4 Refactor `app/admin/users.tsx`, `app/admin/vendors/[id].tsx`, `app/admin/banks.tsx` — token compliance pass
- [ ] 8.5 Refactor `app/admin/coupons.tsx`, `app/admin/payouts.tsx`, `app/admin/refunds.tsx`, `app/admin/complaints.tsx` — token compliance pass

## 9. Help & Remaining Screen Refactor

- [ ] 9.1 Refactor `app/help/` screens — neutral `Colors.background`, `Card` for topic items, `Typography.h4` section headers
- [ ] 9.2 Refactor `app/edit-profile.tsx`, `app/addresses.tsx`, `app/appearance.tsx` — apply `AppTextInput`, `Button`, `Spacing` tokens
- [ ] 9.3 Refactor `app/change-login-pin.tsx`, `app/emergency-help.tsx`, `app/enable-notifications.tsx` — token compliance pass

## 10. Frontend Codebase Audit

- [ ] 10.1 Run `find frontend/app frontend/components -name '*.tsx' | xargs grep -l 'import' > /tmp/all_files.txt` — build import graph baseline
- [ ] 10.2 Identify components in `components/` with zero import references in `app/` — list candidates for deletion
- [ ] 10.3 Identify duplicate utility functions across `utils/` — consolidate or delete duplicates
- [ ] 10.4 Audit `hooks/` — remove unused hooks, verify all hooks use theme tokens and follow naming convention `use-*.ts`
- [ ] 10.5 Audit `stores/` (Zustand) — identify unused stores or stale state slices
- [ ] 10.6 Audit `api/` — identify API functions with no callers; flag for deletion
- [ ] 10.7 Write audit findings to `frontend/audit_report.md` with file-by-file KEEP/REFACTOR/DELETE table
- [ ] 10.8 Execute all DELETE actions from audit report; execute REFACTOR actions for any quick wins

## 11. Frontend Dependency Cleanup

- [ ] 11.1 Run `npx depcheck` in `frontend/` — capture output
- [ ] 11.2 Evaluate each reported unused package: confirm unused (vs. peer dep / Expo plugin), then remove confirmed unused packages
- [ ] 11.3 Flag packages with known CVEs or 2+ major versions behind in `frontend/audit_report.md`
- [ ] 11.4 Evaluate `moment` vs `dayjs` duplication — designate one as canonical and migrate call sites of the other

## 12. Backend Route & Controller Audit

- [ ] 12.1 List all routes in `src/routes/v1/` — verify each is mounted in `src/routes/index.routes.js`
- [ ] 12.2 Check every route handler for: auth middleware, at least one validation rule, consistent error response format
- [ ] 12.3 Check every controller for `try/catch` blocks and consistent use of `logger` (not `console.log`)
- [ ] 12.4 Identify routes/controllers with no callers (dead routes) — flag as DELETE in audit
- [ ] 12.5 Write backend audit findings to `backend/audit_report.md`
- [ ] 12.6 Execute DELETE actions for confirmed dead routes; apply REFACTOR fixes for missing auth/validation

## 13. Backend Dependency & Code Quality

- [ ] 13.1 Run `npx depcheck` in `backend/` — evaluate unused packages and remove confirmed unused ones
- [ ] 13.2 Run `grep -r "console.log" backend/src/` — replace all found instances with `logger.info/warn/error`
- [ ] 13.3 Verify ESLint config exists in `frontend/` (`eslint.config.js`) and passes with zero errors

## 14. Final QA Pass

- [ ] 14.1 Verify dark mode on auth, customer home, checkout, delivery task, and admin orders screens
- [ ] 14.2 Verify layout on small viewport (375px) for the same 5 screens — no overflow, no overlapping elements
- [ ] 14.3 Verify layout on tablet viewport (768px) — confirm `ScreenContainer` max-width constraint and two-column layouts where applicable
- [ ] 14.4 Run `npx tsc --noEmit` in `frontend/` — confirm zero TypeScript errors
- [ ] 14.5 Run ESLint in `frontend/` — confirm zero errors
