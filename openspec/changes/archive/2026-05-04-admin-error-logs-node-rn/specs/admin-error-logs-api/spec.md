## ADDED Requirements

### Requirement: Admin list endpoint returns paginated error logs

The system SHALL expose `GET /admin/error-logs` (within the authenticated admin API prefix) that returns error log rows from `error_logs` with pagination query parameters supported by the shared pagination middleware (`page`, `limit`).

The endpoint MUST accept optional query parameters:

- `q` — search term applied across message, URL, and level (substring / case-insensitive semantics consistent with existing Sequelize patterns)
- `level` — when provided, MUST be one of `ERROR`, `WARNING`, or `INFO` and filter exactly

Default ordering MUST be newest first (`created_at` descending).

Each serialized row MUST include at minimum: `id`, `level`, `message`, `file`, `line`, `user_id`, `url`, `method`, `created_at` (or `created` mapped consistently), and `args` populated from the stored JSON payload column (`payload`) when present.

Successful responses MUST use the existing success envelope (`sendSuccess`): numeric `status: 1`, `message`, and `data` containing rows plus pagination metadata (`total`, `page`, `limit` or equivalent).

#### Scenario: Default page ordered by latest

- **WHEN** an admin calls the list endpoint without filters
- **THEN** the response has `status` equal to `1` and `data` contains the first page of logs sorted by latest `created_at`

#### Scenario: Level filter

- **WHEN** an admin passes `level=ERROR`
- **THEN** every returned row has `level` equal to `ERROR`

---

### Requirement: Admin detail endpoint returns one log with formatted context

The system SHALL expose `GET /admin/error-logs/:id` for admins.

The handler MUST validate that `:id` is a positive integer; invalid ids MUST yield a client error response without leaking stack traces.

The response MUST include full `message`, `file`, `line`, `url`, `method`, `user_id`, timestamp, and `args` (from `payload`). When `payload` is null, `args` MUST be null.

#### Scenario: Existing log

- **WHEN** an admin requests a valid id
- **THEN** `status` is `1` and `data` contains the full record

#### Scenario: Missing log

- **WHEN** an admin requests a non-existent id
- **THEN** the API returns an appropriate not-found error with `status` equal to `0`

---

### Requirement: Admin delete single log

The system SHALL expose `DELETE /admin/error-logs/:id` that removes one row after validating id.

Only admins authenticated via existing middleware MAY invoke this route.

#### Scenario: Delete succeeds

- **WHEN** admin deletes an existing id
- **THEN** the row no longer exists and the response indicates success with `status` equal to `1`

---

### Requirement: Admin clear all logs with explicit confirmation

The system SHALL expose `DELETE /admin/error-logs` (without id) OR an equivalently explicit dedicated route documented in tasks that clears all rows.

The handler MUST require an explicit confirmation payload (e.g. JSON body `{ "confirm": true }`) before deleting all rows.

#### Scenario: Without confirmation

- **WHEN** admin calls clear without confirmation
- **THEN** no rows are deleted and the API returns a validation error

#### Scenario: With confirmation

- **WHEN** admin sends valid confirmation
- **THEN** all rows are removed and the response confirms completion

---

### Requirement: Admin CSV export respects filters

The system SHALL expose `GET /admin/error-logs/export` for admins that downloads CSV.

The export MUST apply the same `q` and `level` filters as the list endpoint.

The CSV MUST include columns: id, level, message, file, line, user_id, url, method, created, args (JSON string or empty).

#### Scenario: Export filtered ERROR logs

- **WHEN** admin exports with `level=ERROR`
- **THEN** only ERROR rows appear in the CSV
