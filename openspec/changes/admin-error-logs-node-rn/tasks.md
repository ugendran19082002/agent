## 1. Backend API

- [ ] 1.1 Add Sequelize query helpers for `ErrorLog` (filters: `q`, `level`; sort `created_at DESC`; safe ILIKE / Op.or patterns)
- [ ] 1.2 Implement `errorLogs.controller.js` with `getAllLogs`, `getLogById`, `deleteLog`, `clearLogs`, `exportLogsCSV` using `sendSuccess` / `sendError`
- [ ] 1.3 Serialize `payload` model field as `args` in JSON responses for list and detail
- [ ] 1.4 Register routes on `admin.routes.js` in correct order: static paths (`export`, `clear` if separate) before parameterized `:id`; paths: `GET /error-logs`, `GET /error-logs/export`, `GET /error-logs/:id`, `DELETE /error-logs/:id`, `DELETE /error-logs` with confirmation body
- [ ] 1.5 Attach `paginationMiddleware` to list route; return `{ rows, total, page, limit }` inside `data`
- [ ] 1.6 CSV: apply filters, set attachment headers, enforce maximum exported rows if needed

## 2. Database performance

- [ ] 2.1 Verify / add index on `error_logs(created_at)` and optional `(level, created_at)` via migration if explain shows scans

## 3. React Native — API client

- [ ] 3.1 Create thin API module (e.g. `api/adminErrorLogsApi.ts`) wrapping list, detail, delete, clear, export URLs with `apiClient`

## 4. React Native — UI

- [ ] 4.1 Add `app/admin/error-logs.tsx` (list) with FlatList, badges, search, filter, pull-to-refresh, infinite scroll, empty/error/loading states
- [ ] 4.2 Add `app/admin/error-logs/[id].tsx` (detail) with full fields + formatted JSON
- [ ] 4.3 Register screens in `app/admin/_layout.tsx`
- [ ] 4.4 Add More menu item in `app/admin/(tabs)/more.tsx`
- [ ] 4.5 Implement Clear All confirmation modal and Export action (share/link pattern consistent with project)

## 5. Verification

- [ ] 5.1 Manual test as admin: list filters, pagination, detail, delete one, clear all, export CSV
- [ ] 5.2 Confirm non-admin token receives 403 from existing `authorize("admin")`
