# Reconciliation with `production-ready-ui-audit`

- **`production-ready-ui-audit`** (same repo under `openspec/changes/production-ready-ui-audit/`) already tracks grepping hex literals, deprecating duplicate style files, responsive shell, and broad screen refactors.
- **`mobile-ui-audit-design-system`** is the **spec contract** for tokens, responsive rules, primitives, and screen conformance.

**How to avoid duplicate work**

1. Treat **`constants/theme.ts`** as the single token source — both changes assume this.
2. Complete remaining **grep migrations** (tasks 1.5–1.6 in `production-ready-ui-audit`) alongside screen rows in `screen-audit-matrix.md` in this change.
3. When archiving, merge any overlapping checkbox items into one archived record or close one change as superseded.
