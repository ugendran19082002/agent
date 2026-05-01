# Project

## Purpose
Thannigo is a hyperlocal delivery and marketplace platform. It connects customers with local shops for on-demand ordering and delivery, and provides shop owners and delivery personnel with dedicated management interfaces.

## Tech Stack
- **Backend:** Node.js, Express, MySQL (Sequelize ORM), Redis (BullMQ), Socket.io, Firebase Admin
- **Frontend:** React Native (Expo), TypeScript, Expo Router, NativeWind (Tailwind), Zustand
- **Website:** Static HTML, Tailwind CSS (browser CDN runtime)
- **Payments:** Razorpay
- **Notifications:** Firebase Cloud Messaging, Nodemailer
- **Auth:** JWT (access + refresh tokens), OTP via SMS/email

## Architecture Style
Layered multi-tier: REST API backend, mobile frontend, static marketing website. Backend uses a service-controller-model pattern with async job queues for background work and real-time updates via WebSockets.

## Key Modules
- [`backend`](specs/modules/backend.md) — REST API server handling all business logic
- [`frontend`](specs/modules/frontend.md) — Cross-platform React Native mobile app (customer, shop, delivery roles)
- [`website`](specs/modules/website.md) — Static marketing/landing pages

## Constraints
- Backend serves three distinct user roles: customer, shop owner, delivery person, and admin
- Real-time order tracking is delivered over Socket.io
- Background jobs (notifications, payouts, queue draining) run via BullMQ on Redis
- Payment processing is exclusively through Razorpay
- All API routes are versioned under `/v1`
