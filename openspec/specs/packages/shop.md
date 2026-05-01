# Package: shop

## Responsibility
Manages shop profiles, operational configuration, staff, promotions, and onboarding for shop owners.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `shop.controller` | function | CRUD for shop profiles; search and listing for customers |
| `ShopBankController` | function | Bank account management and change request handling |
| `ShopHolidayController` | function | Holiday closures for shops |
| `ScheduleSlotController` | function | Delivery slot and schedule management |
| `PromotionController` | function | Shop-level promotional banners and offers |
| `onboarding.controller` | function | Step-by-step shop onboarding flow |
| `StaffService` | function (service) | Shop staff CRUD and permission management |
| `Shop` model | struct | Core shop entity — name, location, type, status |
| `ShopSetting` model | struct | Operational configuration (radius, min order, etc.) |
| `ShopSchedule` model | struct | Weekly opening hours |
| `ShopSlot` model | struct | Time-slotted delivery windows |
| `ShopHoliday` model | struct | Date-based closure overrides |
| `ShopStaff` model | struct | Staff member linked to a shop |
| `ShopBankAccount` model | struct | Bank account for payout disbursement |
| `ShopBankChangeRequest` model | struct | Audit record for bank account change requests |
| `ShopOnboardingProgress` model | struct | Tracks onboarding completion per shop |
| `ShopOnboardingStep` model | struct | Individual onboarding step definition |
| `Document` model | struct | Uploaded verification documents for a shop |

## Dependencies
- **Backend:** `InventoryService`, `DeliveryService`, `PayoutService`
- **Frontend:** `api/shopApi.ts`, `stores/shopStore.ts`, `app/shop/` screens

## Notes
- Shop types and business categories are managed by the admin package
- Pricing rules (`ShopPricingRule`) define delivery fee tiers per shop
