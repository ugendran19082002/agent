# Master audit register

- **Machine-readable:** `audit-register.csv` — columns: `path`, `area`, `status`, `issues`, `screen_sections_notes`, `last_updated`
- **Row count:** same as `ui-files-enumeration.txt` (every file seeded; status starts as `pending-review`)

## Area values

| area | Meaning |
|------|---------|
| auth | `frontend/app/auth/` |
| admin | `frontend/app/admin/` |
| delivery | `frontend/app/delivery/` |
| shop | `frontend/app/shop/` and shop routes |
| customer | Other `frontend/app/` routes (tabs, addresses, orders, etc.) |
| shared | `components/`, `styles/`, `constants/`, `hooks/` |

Update `status` to `in-progress`, `fixed`, or `exempt` as the exhaustive pass proceeds.
