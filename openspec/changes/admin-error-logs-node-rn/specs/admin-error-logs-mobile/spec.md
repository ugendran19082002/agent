## ADDED Requirements

### Requirement: Admin mobile navigation exposes Error Logs

The React Native admin application SHALL include an **Error Logs** entry in the admin **More** menu (or equivalent navigation surface) that routes to the list screen.

#### Scenario: Visible to admin session

- **WHEN** an authenticated admin opens the More menu
- **THEN** Error Logs is visible and navigates to the list screen

---

### Requirement: Error logs list screen

The system SHALL provide `ErrorLogsScreen` listing logs with columns / fields: ID, Level, Message, URL, Method, Date.

The screen MUST:

- Use a scrollable list (`FlatList` or equivalent)
- Support pull-to-refresh
- Support infinite scroll or explicit pagination consistent with API `page` / `limit`
- Provide a search input bound to API `q`
- Provide a level filter control (`ERROR` / `WARNING` / `INFO` / All)
- Truncate long messages in the row with navigation affordance to detail (“View more” / row tap)

Level MUST render as colored badges: ERROR → red, WARNING → yellow, INFO → blue (semantic colors aligned with existing admin theme tokens).

#### Scenario: Loading and empty states

- **WHEN** data is loading
- **THEN** a loading indicator is shown

- **WHEN** the API returns zero rows
- **THEN** an empty state is shown

#### Scenario: Error state

- **WHEN** the API returns an error
- **THEN** the user sees an error message and may retry

---

### Requirement: Error log detail screen

The system SHALL provide a detail screen reachable from the list that shows:

- Full message
- `args` formatted as readable JSON (pretty-printed when object/array)
- File and line
- URL and HTTP method
- Created timestamp

#### Scenario: JSON args

- **WHEN** `args` is a JSON object
- **THEN** the UI renders formatted JSON without crashing if keys are unexpected

---

### Requirement: Clear all and export actions

The list screen SHALL expose:

- **Clear all logs** — requires confirmation modal before calling the backend clear endpoint with required confirmation payload
- **Export CSV** — triggers download/share flow appropriate for React Native (open URL with auth token pattern used elsewhere or fetch blob + share), aligned with `GET /admin/error-logs/export`

#### Scenario: Clear cancelled

- **WHEN** user dismisses confirmation
- **THEN** no delete request is sent

---

### Requirement: Routing integration

New screens MUST be registered in `app/admin/_layout.tsx` Stack so deep links and back navigation behave consistently with other admin tools.

#### Scenario: Back navigation

- **WHEN** user navigates list → detail → back
- **THEN** the user returns to the list preserving scroll position when feasible
