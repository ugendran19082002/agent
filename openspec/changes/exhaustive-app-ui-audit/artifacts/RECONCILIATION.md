# Reconciliation: other UI audit changes (Task 2.3)

| Change | Path | Relationship |
|--------|------|--------------|
| `mobile-ui-audit-design-system` | `openspec/changes/mobile-ui-audit-design-system/` | Shared goals (tokens, primitives). **Do not** fork theme edits; merge PRs in one order after Conflict check with `constants/theme.ts`. |
| `production-ready-ui-audit` | `openspec/changes/production-ready-ui-audit/` | Broader grep-and-refactor checklist. **Merge** hex/spacing grep results into this register so each file has a single status row. |

**Rule:** One authoritative **`audit-register.csv`** for `exhaustive-app-ui-audit`; link findings from other changes instead of duplicating conflicting “fixed” states.
