# Module: frontend

## Responsibility
Cross-platform React Native mobile application serving three user roles: customer, shop owner, and delivery person. Manages UI screens, state, and all communication with the backend API and real-time WebSocket layer.

## Key Components
| Component | Path | Kind | Role |
|---|---|---|---|
| Root layout | `app/_layout.tsx` | function | App entry; mounts providers and session bootstrapping |
| RouteGuard | `providers/RouteGuard.tsx` | function | Redirects unauthenticated or wrong-role users |
| AppSessionProvider | `providers/AppSessionProvider.tsx` | function | Loads and persists session state |
| API client | `api/client.ts` | function | Axios instance with auth interceptors and base URL config |
| Zustand stores | `stores/*.ts` | function | Per-domain reactive state (cart, order, shop, delivery, fleet, firebase, security, app) |

## Screen Groups
| Group | Path | Audience |
|---|---|---|
| Auth | `app/auth/` | All roles — OTP login, role select, PIN |
| Customer tabs | `app/(tabs)/` | Customer — home, search, orders, profile |
| Customer screens | `app/*.tsx` | Customer — cart, map, addresses, rewards, reviews |
| Shop management | `app/shop/` | Shop owner — inventory, schedule, staff, analytics |
| Delivery | `app/delivery/` | Delivery person — active delivery, navigation, completion |

## Dependencies
- **Runtime:** Expo SDK, React Navigation, NativeWind, Zustand, React Hook Form + Zod, Axios, Socket.io-client, Mapbox, Firebase (notifications), Razorpay (payments)
- **Backend:** REST API at `backend/`, Socket.io for real-time updates
- **External:** Mapbox/Google Maps geocoding, Firebase FCM

## Notes
- Routing is file-based via `expo-router`; layout files define navigators
- `frontend/types/domain.ts` defines shared business entity types used across screens, stores, and API layers
- `frontend/lib/schemas/` contains Zod validation schemas for forms
- `frontend/styles/` exports design tokens (colors, typography, spacing)
