## ADDED Requirements

### Requirement: Unified Pagination Envelope
Every backend list endpoint that returns more than one record SHALL respond with the envelope `{ "data": [...], "total": <integer>, "page": <integer>, "limit": <integer> }`. Raw array responses from list endpoints are not permitted.

#### Scenario: Paginated list is requested
- **WHEN** a list endpoint receives a valid request with optional `?page` and `?limit` query params
- **THEN** the response body is `{ data: [...], total: <n>, page: <n>, limit: <n> }` with HTTP 200

#### Scenario: First page default
- **WHEN** a list endpoint is called without `?page` or `?limit` query params
- **THEN** the response defaults to `page: 1` and `limit: 20`

### Requirement: Pagination Middleware
The backend SHALL provide a shared `paginationMiddleware` at `backend/src/middleware/pagination.js` that parses `?page` and `?limit` from the query string, coerces them to positive integers, caps `limit` at 100, and attaches `req.pagination = { page, limit, offset }` for use in controllers. Invalid values SHALL be replaced with defaults silently (no 400 error).

#### Scenario: Valid params parsed
- **WHEN** a request includes `?page=3&limit=25`
- **THEN** `req.pagination` is `{ page: 3, limit: 25, offset: 50 }`

#### Scenario: Limit exceeds cap
- **WHEN** a request includes `?limit=500`
- **THEN** `req.pagination.limit` is clamped to 100

#### Scenario: Non-numeric params
- **WHEN** a request includes `?page=abc&limit=xyz`
- **THEN** `req.pagination` defaults to `{ page: 1, limit: 20, offset: 0 }`

### Requirement: Affected Endpoints Upgraded
The following endpoint groups SHALL be upgraded to use the pagination middleware and unified envelope:
- `GET /api/v1/admin/shops` — admin shop list
- `GET /api/v1/admin/complaints` — admin complaint queue
- `GET /api/v1/admin/coupons` — admin coupon list
- `GET /api/v1/shop-owner/orders` — shop order list
- `GET /api/v1/shop-owner/customers` — shop customer list
- `GET /api/v1/orders` — customer order history
- `GET /api/v1/delivery/orders` — delivery person order list

#### Scenario: Admin shop list returns paginated response
- **WHEN** `GET /api/v1/admin/shops?page=2&limit=10` is called by an authenticated admin
- **THEN** the response contains `{ data: [...], total: <n>, page: 2, limit: 10 }` with at most 10 shop records

#### Scenario: Customer order history is paginated
- **WHEN** `GET /api/v1/orders?page=1&limit=20` is called by an authenticated customer
- **THEN** the response contains `{ data: [...], total: <n>, page: 1, limit: 20 }` and the frontend can derive total page count from `total / limit`
