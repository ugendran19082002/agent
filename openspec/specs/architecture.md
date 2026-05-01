# Architecture

## Style
Multi-tier REST + real-time: a stateless HTTP API backend, a React Native mobile client, and a static website. Background work is offloaded to an async queue. Real-time events are delivered over WebSockets.

## Layers

| Layer | Technologies | Path |
|---|---|---|
| Presentation (mobile) | React Native, Expo Router, NativeWind | `frontend/app/` |
| State management | Zustand stores | `frontend/stores/` |
| API client | Axios wrappers | `frontend/api/` |
| API gateway | Express, JWT middleware | `backend/src/routes/` |
| Business logic | Service classes | `backend/src/services/` |
| Controllers | Express route handlers | `backend/src/controllers/` |
| Data access | Sequelize models | `backend/src/model/` |
| Background jobs | BullMQ workers | `backend/src/queue/` |
| Scheduled tasks | node-cron | `backend/src/cron/` |
| Presentation (web) | Static HTML + Tailwind CDN | `website/` |

## Component Interaction
```
Mobile App (Expo Router)
  ├─> API layer (Axios) ──HTTP/REST──> Backend (Express)
  │     └─> Domain services ──────> Sequelize ──> MySQL
  │                          └────> Redis (cache / rate limit)
  │                          └────> BullMQ (async jobs)
  └─> Socket.io client <──WS──> Socket.io server (backend)
                                    └─> real-time order/delivery events

Backend async workers
  ├─> Firebase FCM  ──> Push notifications to devices
  └─> Nodemailer    ──> Transactional email
```

## Data Flow (high-level)
1. Client authenticates via OTP → receives JWT access + refresh tokens
2. Client attaches JWT to every API request; backend middleware validates it
3. Write operations go through a controller → service → Sequelize model → MySQL
4. Long-running side effects (push notifications, payout calculations) are enqueued in BullMQ
5. Order status changes are broadcast to subscribed clients over Socket.io
6. Scheduled jobs (e.g. loyalty expiry, report generation) run via node-cron

## Notes
- All backend API routes are namespaced under `/v1`
- Swagger docs are auto-generated from JSDoc annotations in route files
- The `frontend/api/` layer mirrors the backend's domain structure (one file per domain)
- Role separation (customer / shop-owner / delivery / admin) is enforced at the route-middleware level in the backend and at the Expo Router `RouteGuard` provider in the frontend
