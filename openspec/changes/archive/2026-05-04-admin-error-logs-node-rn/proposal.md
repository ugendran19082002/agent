## Why

Persisted errors already land in MySQL `error_logs`, but platform admins cannot browse, filter, export, or prune them from the existing Node API or React Native admin app without database access. Surfacing this data through secured admin endpoints and a dedicated mobile UI reduces incident response time and aligns with the current monorepo architecture.

## What Changes

- **Backend**: Add admin-only REST routes under the existing v1 admin router for listing (pagination + search + level filter + sort), detail by id, single-row delete, bulk clear, and CSV export; implement controller (+ thin service if helpful) using the existing Sequelize `ErrorLog` model.
- **Mobile admin**: Add **ErrorLogs** list screen with infinite scroll / pagination, search, level filter, pull-to-refresh, badges, truncation + navigation to detail; add **ErrorLogsDetail** screen with full message, formatted JSON args (from stored payload), file/line, URL/method, timestamp; wire actions for clear-all (confirm) and CSV export (open/share download).
- **Navigation**: Register new routes in `app/admin/_layout.tsx` and add a **More** menu entry (and optional tab shortcut if desired later).

No **BREAKING** API changes to existing clients; new routes only.

## Capabilities

### New Capabilities

- `admin-error-logs-api`: Admin-authenticated HTTP API on `/admin/error-logs` (within existing `/api/v1` mount) for querying and managing `error_logs` rows with pagination, filters, CSV export, and consistent JSON envelopes using project response helpers.
- `admin-error-logs-mobile`: React Native admin UI screens and API client integration for browsing error logs with loading/error/empty states and destructive-action confirmations.

### Modified Capabilities

- _(none — no existing OpenSpec capability defines this module.)_

## Impact

- **Backend**: `backend/src/routes/v1/admin/admin.routes.js`; new controller under `backend/src/controllers/admin/`; optional service; Sequelize queries against `ErrorLog` (`error_logs`). Recommend composite index review on `(created_at DESC)` / `level` once query patterns are stable.
- **Frontend**: `frontend/app/admin/` new screens; `apiClient` usage consistent with other admin screens; `app/admin/_layout.tsx` stack registration; `app/admin/(tabs)/more.tsx` menu entry.
- **Contract**: Success responses follow existing `sendSuccess` shape (`status: 1`, `message`, `data`) — not literal boolean `status: true`.
