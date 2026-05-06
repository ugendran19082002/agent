## 1. Audit inventory (no skipped files)

- [x] 1.1 Generate enumerated file list (`git ls-files`) for `frontend/app`, `frontend/components`, `frontend/styles`, `frontend/constants`, and layout-related `frontend/hooks`; define exempt non-UI patterns with rationale.
- [x] 1.2 Create the master audit register (markdown or sheet) with columns: path, area (auth/customer/shop/delivery/admin/shared), status, issues (spacing/type/responsive/safe-scroll/perf/dup), screen sections notes, last updated.
- [x] 1.3 Seed register with every enumerated path; none left “TBD” without exempt tag.

## 2. Theme alignment

- [x] 2.1 Confirm `Spacing` scale in `constants/theme.ts` maps to 4/8/12/16/20/24/32; add named aliases only for gaps clearly missing project-wide.
- [x] 2.2 Document spacing-exception comment convention for rare non-scale literals (e.g. hairline).
- [x] 2.3 Reconcile with `mobile-ui-audit-design-system` / `production-ready-ui-audit` so token edits land once.

## 3. Primitives and shared layout

- [ ] 3.1 Align `Button`, `AppTextInput`, `Card`, list row patterns, `PageHeader`, `EmptyState`, skeletons, banners to `rn-ui-primitives-contract`.
- [ ] 3.2 Standardize `ScreenContainer` / shell patterns for safe-area + scroll contract.

## 4. Spacing scale enforcement pass

- [ ] 4.1 Replace non-token `padding`/`margin`/`gap` literals in `components/ui` and `components/*`.
- [ ] 4.2 Replace literals in `app/auth/**` and register rows as fixed.
- [ ] 4.3 Replace literals in customer routes `app/(tabs)/**`, `app/*` customer flows.
- [ ] 4.4 Replace literals in `app/shop/**`.
- [ ] 4.5 Replace literals in `app/delivery/**`.
- [ ] 4.6 Replace literals in `app/admin/**` and help/settings routes.

## 5. Responsive & overflow

- [ ] 5.1 Audit fixed `width`/`height` usage; convert to flex/percent/shared max-width patterns per `rn-responsive-overflow-contract`.
- [ ] 5.2 Verify tablet and small-phone simulators for overflow on representative routes per role; log fixes in register.

## 6. Safe area & scroll

- [ ] 6.1 Audit top/bottom safe areas on stacks modals and pinned footers; fix per `rn-safe-area-scroll-contract`.
- [ ] 6.2 Ensure long forms and settings use scroll + keyboard avoidance where applicable.

## 7. State surfaces

- [ ] 7.1 Audit loading, empty, error, offline, maintenance UIs against tokens and primitives; update `ui-state-consistency` scope in register.

## 8. Hygiene & performance

- [ ] 8.1 Consolidate duplicate StyleSheets; remove unused styles/files found during audit.
- [ ] 8.2 Fix hot-path inline styles in major lists (`FlashList`/`FlatList` rows).

## 9. Deliverables & verification

- [x] 9.1 Produce file-wise issue summary and screen-wise before/after notes for stakeholders.
- [x] 9.2 Run `npm run typecheck` and `npm run lint` in `frontend`; fix regressions.
- [ ] 9.3 Run targeted Detox or manual QA matrix (small phone, large phone, tablet) and record results in the register.
- [ ] 9.4 Mark every register row **fixed** or **exempt**; open follow-up tickets for any intentional deferrals.
