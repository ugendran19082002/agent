# Package: delivery

## Responsibility
Manages delivery personnel, order assignments, real-time location tracking, and charge request adjudication.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `DeliveryController` | function | Accept/reject assignments, update delivery status |
| `ChargeRequestService` | function (service) | Process extra charge requests raised by delivery staff |
| `DeliveryService` | function (service) | Assignment matching, fleet availability, distance calculations |
| `DeliveryPerson` model | struct | Delivery person profile and availability state |
| `DeliveryAssignment` model | struct | Link between an order and the assigned delivery person |
| `ChargeRequest` model | struct | Request for an additional charge on an active delivery |
| `LocationLog` model | struct | Time-series GPS positions for active deliveries |

## Dependencies
- **Backend:** `OrderService` (status updates), `PaymentService` (charge capture), Socket.io (location broadcast)
- **Frontend:** `api/deliveryApi.ts`, `api/chargeRequestApi.ts`, `stores/deliveryStore.ts`, `stores/fleetStore.ts`, `app/delivery/` screens

## Notes
- Real-time location updates from the delivery app are broadcast to subscribed customers via Socket.io
- Charge requests require admin or shop-owner approval before the additional amount is captured
- `DistanceController` (system package) provides distance/ETA calculations used in assignment logic
