## Context

**Backend** is Express with routes under `backend/src/routes/v1/admin/admin.routes.js`, guarded by `router.use(authenticateToken, authorize("admin"))`. Responses use `sendSuccess` / `sendError` (`status` numeric 1/0). Pagination uses `paginationMiddleware` attaching `req.pagination`. **ErrorLog** Sequelize model already maps to `error_logs`; JSON metadata is stored as `payload` (not `args`). User-facing API MAY expose this field as `args` in JSON for parity with product language.

**Mobile admin** uses Expo Router under `frontend/app/admin/` with role gate in `app/admin/_layout.tsx`. Secondary tools are linked from `app/admin/(tabs)/more.tsx`.

## Goals / Non-Goals

**Goals:**

- Ship admin-only list/detail/delete/clear/export aligned with existing middleware and response helpers.
- RN screens mirror patterns from `complaints`, `support-tickets`, or `users` admin screens (FlatList, refresh, navigation).
- Validate numeric ids; parameterized queries only (no raw concatenated SQL).

**Non-Goals:**

- Replacing the existing `storeErrorLog` pipeline or `report-error` route behavior.
- Building a separate web admin SPA.

## Decisions

1. **Route paths** — Mount on existing admin router:
   - `GET /admin/error-logs` — list + query params: `page`, `limit`, `q` (search message/url/level substring), `level` (`ERROR`|`WARNING`|`INFO`), default sort `created_at DESC`.
   - `GET /admin/error-logs/:id` — detail.
   - `DELETE /admin/error-logs/:id` — delete one.
   - `DELETE /admin/error-logs` — clear all (consider query flag `confirm=all` or body — prefer explicit route naming `DELETE /admin/error-logs/all` **or** document single DELETE without id requires confirmation header/body to avoid accidental proxy triggers; **decision**: use `DELETE /admin/error-logs/clear-all` as distinct path OR `POST /admin/error-logs/clear` — user asked `DELETE /admin/error-logs` for clear all; implement **DELETE `/admin/error-logs`** with requirement for JSON body `{ "confirm": true }` to reduce accidental deletes, documented in API).

   _Refinement_: Express distinguishes `DELETE /admin/error-logs/:id` vs `DELETE /admin/error-logs` — use separate handler for collection delete with explicit `{ confirm: true }` body validation.

2. **CSV export** — `GET /admin/error-logs/export` with same query filters as list; set `Content-Type: text/csv` and `Content-Disposition: attachment`. Stream if large; cap rows (e.g. 10k) or mirror pagination params (`page`/`limit`) with documented max.

3. **Field mapping** — Sequelize entity uses `payload`; serialize list/detail as `{ ..., args: payload ?? null }` for mobile contract while keeping DB unchanged.

4. **RN API layer** — Add `frontend/api/adminErrorLogsApi.ts` (or extend existing admin API module) using shared `apiClient` with auth interceptors.

5. **Infinite scroll** — Use `page` increment on `onEndReached` with `hasMore` derived from total count or “full page returned” heuristic; align with backend pagination metadata in `data` (e.g. `{ rows, total, page, limit }`).

6. **Indexes** — If slow, add DB index on `(created_at)` and optionally `(level, created_at)`; document in migration task.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Clear-all destructive | Require explicit confirm body + RN modal double-step |
| Huge CSV memory | Stream + row cap or export current filter page range |
| Payload vs args naming drift | Single serialization helper in controller |

## Migration Plan

1. Ship backend routes behind existing admin auth.
2. Ship RN screens behind admin layout gate.
3. Optional: run DB index migration off-hours.

## Open Questions

- Whether CSV export should default to “current filters only” with hard max rows (recommended).

## Appendix: Implementation touchpoints (repo-specific)

| Layer | Location |
|-------|-----------|
| Routes | `backend/src/routes/v1/admin/admin.routes.js` |
| Controller | `backend/src/controllers/admin/errorLogs.controller.js` (name per project convention) |
| Model | `backend/src/model/ErrorLog.js` (existing) |
| RN list/detail | `frontend/app/admin/error-logs.tsx`, `frontend/app/admin/error-logs/[id].tsx` (or single folder route group) |
| Menu | `frontend/app/admin/(tabs)/more.tsx` → `SECONDARY_MENUS` |
| Stack | `frontend/app/admin/_layout.tsx` |
