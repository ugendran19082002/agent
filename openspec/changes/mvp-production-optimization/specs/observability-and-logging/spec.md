## ADDED Requirements

### Requirement: Request Correlation ID Middleware
The backend SHALL include a middleware at `backend/src/middleware/correlationId.js` that is mounted at the top of the Express chain (before JWT and route middlewares). The middleware SHALL read the `X-Request-ID` request header if present and valid UUID, otherwise generate a new `crypto.randomUUID()`. The ID SHALL be stored on `req.correlationId` and echoed in the `X-Request-ID` response header.

#### Scenario: Client supplies a correlation ID
- **WHEN** an inbound request includes a valid UUID in the `X-Request-ID` header
- **THEN** the same UUID is stored on `req.correlationId` and returned in the `X-Request-ID` response header

#### Scenario: Client supplies no correlation ID
- **WHEN** an inbound request does not include an `X-Request-ID` header
- **THEN** the middleware generates a new UUID, stores it on `req.correlationId`, and sets it in the `X-Request-ID` response header

#### Scenario: Correlation ID propagates to BullMQ jobs
- **WHEN** a controller or service enqueues a BullMQ job during request handling
- **THEN** the job data object includes `{ correlationId: req.correlationId }` so worker logs carry the same ID

### Requirement: Structured Log Format With Correlation ID
Every `logger.info`, `logger.warn`, and `logger.error` call made during a request's lifecycle SHALL include the `correlationId` field. The existing `winston` logger SHALL be extended to support a per-request child logger via `logger.child({ correlationId })`.

#### Scenario: Request log entry includes correlation ID
- **WHEN** any logger call is made inside a controller or service during a request
- **THEN** the JSON log entry includes a `correlationId` field matching `req.correlationId` for that request

#### Scenario: Background job log entry includes correlation ID
- **WHEN** a BullMQ worker processes a job that carries `job.data.correlationId`
- **THEN** the worker's logger calls include the same `correlationId` value in their log entries

### Requirement: Health Endpoint
The backend SHALL expose `GET /health` (no auth required, mounted before JWT middleware) that returns HTTP 200 with a JSON body `{ "status": "ok", "db": true|false, "redis": true|false, "queue": true|false }`. The endpoint SHALL return HTTP 503 if any critical dependency (`db`) is unhealthy.

#### Scenario: All dependencies healthy
- **WHEN** `GET /health` is called and MySQL, Redis, and BullMQ are all reachable
- **THEN** the response is HTTP 200 with `{ status: "ok", db: true, redis: true, queue: true }`

#### Scenario: Database unreachable
- **WHEN** `GET /health` is called and MySQL is not reachable
- **THEN** the response is HTTP 503 with `{ status: "degraded", db: false, redis: true, queue: true }`

### Requirement: Readiness Endpoint
The backend SHALL expose `GET /ready` (no auth required) that returns HTTP 200 only after the database and Redis connections have been established on startup. Before these connections are confirmed, it SHALL return HTTP 503.

#### Scenario: Service is ready
- **WHEN** `GET /ready` is called after successful DB and Redis connection
- **THEN** the response is HTTP 200 with body `{ "ready": true }`

#### Scenario: Service is still starting
- **WHEN** `GET /ready` is called before the DB connection completes
- **THEN** the response is HTTP 503 with body `{ "ready": false }`
