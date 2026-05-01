# System Overview

## Description
Thannigo is a three-tier hyperlocal delivery platform. The backend exposes a versioned REST API consumed by the mobile app. A separate static website serves marketing content.

## Modules
| Module | Role |
|---|---|
| `backend` | API server — auth, orders, shops, delivery, payments, admin |
| `frontend` | React Native app — customer, shop owner, delivery person UIs |
| `website` | Static marketing pages |

## Entry Points
- **Backend:** `backend/src/server.js` — binds Express app and Socket.io to a TCP port
- **Backend app:** `backend/src/app.js` — Express app setup, middleware stack, route mounting
- **Frontend root:** `frontend/app/_layout.tsx` — Expo root layout, session bootstrapping
- **Frontend tabs:** `frontend/app/(tabs)/_layout.tsx` — customer tab navigator
- **Website:** `website/index.html` — static landing page

## Domain Packages
- [`auth`](packages/auth.md) — identity, OTP, JWT tokens
- [`shop`](packages/shop.md) — shop profiles, schedules, promotions, settings
- [`order`](packages/order.md) — order lifecycle, slots, status tracking
- [`delivery`](packages/delivery.md) — fleet, assignments, charge requests
- [`payment`](packages/payment.md) — Razorpay integration, refunds, payouts
- [`admin`](packages/admin.md) — admin controls, analytics, categories
- [`engagement`](packages/engagement.md) — loyalty, referrals, ratings, coupons, complaints

## External Systems
- **Razorpay** — payment gateway
- **Firebase** — push notifications (FCM)
- **Mapbox / Google Maps** — map rendering and geocoding in mobile app
- **Redis** — BullMQ job queue broker
- **MySQL** — primary relational data store
- **SMTP (Nodemailer)** — transactional email
