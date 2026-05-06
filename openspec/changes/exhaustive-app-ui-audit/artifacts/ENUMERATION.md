# UI file enumeration (Task 1.1)

## Why not `git ls-files`

The repository root **`.gitignore` ignores the entire `frontend/` tree**, so `git ls-files` returns **no paths** under `frontend/`. Enumeration for this audit uses a **filesystem scan** instead:

```bash
find frontend/app frontend/components frontend/styles frontend/constants frontend/hooks \
  -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) | sort
```

Output: **`artifacts/ui-files-enumeration.txt`** (203 entries at generation time).

## Exempt patterns (non-UI or out of scope for screen audit)

| Pattern | Rationale |
|---------|-----------|
| `**/__tests__/**`, `**/*.test.ts` | Test files — not production UI (add under `frontend/` if introduced). |
| `**/*.d.ts` | Types only — not included in enumeration (no `.d.ts` in current find). |
| `hooks/*` non-layout | Each hook file is **listed** with area `shared`; purely data hooks are marked **exempt** during review (see register notes column when applicable). |

## Layout-related hooks (priority review)

Hooks that directly affect layout or responsiveness should be reviewed first: `use-responsive.ts`, navigation wrappers, theme/color scheme hooks used by screens.
