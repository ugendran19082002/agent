# Module: backend

## Responsibility
Provides the REST API and real-time WebSocket layer for the entire platform. Handles authentication, business logic, data persistence, background jobs, and external integrations.

## Key Components
| Component | Path | Kind | Role |
|---|---|---|---|
| `app` | `src/app.js` | function | Express app factory — wires middleware and mounts all route trees |
| `server` | `src/server.js` | function | Process entry — starts HTTP server and Socket.io |
| `index.routes` | `src/routes/index.routes.js` | function | Top-level route aggregator; delegates to versioned sub-routers |
| `queue` | `src/queue/index.js` | function | BullMQ queue definitions and worker registration |
| `cron` | `src/cron/index.js` | function | node-cron scheduled task registrations |
| `errorMiddleware` | `src/middleware/errorMiddleware.js` | function | Global Express error handler |
| `xssMiddleware` | `src/middleware/xssMiddleware.js` | function | XSS sanitisation on request bodies |

## Sub-packages (domain)
- `auth` — authentication controllers, services, JWT helpers
- `shop` — shop management controllers and services
- `order` — order lifecycle controllers and services
- `delivery` — delivery fleet and assignment logic
- `payment` — Razorpay integration and payout processing
- `admin` — admin-only endpoints and analytics
- `engagement` — loyalty, referrals, ratings, coupons, complaints

## Dependencies
- **Runtime:** Express, Sequelize/MySQL, Redis/BullMQ, Socket.io, Firebase Admin, Razorpay, Winston, Nodemailer
- **Inbound:** REST calls from `frontend/api/`, admin dashboards
- **Outbound:** MySQL, Redis, Razorpay API, Firebase FCM, SMTP

## Notes
- Swagger API docs are served at `/api-docs` via `swagger-ui-express`
- Security headers are applied globally via `helmet` and `hpp`
- Rate limiting is applied per-route via `express-rate-limit`
- Uploads (images, documents) are handled via `multer` + `sharp` (resize/compress)
