# File-wise changes (session log — Task 9.1 partial)

**Change:** `exhaustive-app-ui-audit` · **Date:** 2026-05-06

## Inventory & register (§1)

- `artifacts/ENUMERATION.md` — `find`-based enumeration (`frontend/` gitignored).
- `artifacts/ui-files-enumeration.txt` — 203 `.ts` / `.tsx` / `.css` paths.
- `artifacts/audit-register.csv` — seeded rows for all paths (`pending-review`).
- `artifacts/AUDIT_REGISTER.md` — column legend.
- `artifacts/RECONCILIATION.md` — coordination with other UI audit changes.

## Theme (§2)

- `constants/theme.ts` — spacing-exception convention + scale comment on `Spacing`.

## Components updated (spacing tokens / primitives)

| File | Notes |
|------|------|
| `components/ui/OfflineScreen.tsx` | `Spacing`, `Radius` for card, tips, retry |
| `components/ui/MaintenanceScreen.tsx` | same pattern |
| `components/ui/ShopCard.tsx` | `Radius`/`Spacing` for card, chips, footer |
| `components/ui/RoleHeader.tsx` | header padding; `TouchTarget.min` icon buttons |
| `components/ui/StatCard.tsx` | micro-gaps, icon radius |
| `components/ui/collapsible.tsx` | heading/content margins and gaps |

## Remaining scope

- Most `app/**` routes still need literal pass (tasks 4.2–4.6).
- Simulator matrix (5.2, 9.3) not run in CI here.
