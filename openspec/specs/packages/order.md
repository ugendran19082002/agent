# Package: order

## Responsibility
Manages the full order lifecycle from cart submission to completion, including status transitions, items, slots, and charge logging.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `order.controller` | function | Place, fetch, update, and cancel orders |
| `slot.controller` | function | Fetch available delivery slots for a shop |
| `product.controller` | function | Product catalogue browsing and search |
| `InventoryService` | function (service) | Stock checking and reservation |
| `Order` model | struct | Core order record — status, totals, timestamps |
| `OrderItem` model | struct | Line items within an order |
| `OrderStatusLog` model | struct | Immutable audit log of order status transitions |
| `OrderChargeLog` model | struct | Charge adjustments applied to an order |
| `ScheduleTemplate` model | struct | Reusable delivery schedule template |
| `ScheduleException` model | struct | One-off overrides to a shop schedule |
| `Product` model | struct | Product definition — name, price, category |
| `ProductSetting` model | struct | Per-product configuration (max qty, availability) |
| `Inventory` model | struct | Current stock level per product |
| `InventoryLog` model | struct | Stock movement audit trail |

## Dependencies
- **Backend:** `ShopService` (schedule/slot availability), `DeliveryService` (assignment), `PaymentService` (charge capture)
- **Frontend:** `api/orderApi.ts`, `stores/orderStore.ts`, `stores/cartStore.ts`, `app/(tabs)/orders.tsx`

## Notes
- Orders progress through a defined set of statuses tracked in `OrderStatusLog`
- `ScheduleException` and `ShopHoliday` (shop package) together determine slot availability
