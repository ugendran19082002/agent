# Package: admin

## Responsibility
Provides administrative controls for platform-wide configuration, user management, category taxonomy, analytics, and approval workflows.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `admin.controller` | function | User management, shop approval, platform controls |
| `analytics.controller` | function | Platform-wide metrics and reporting |
| `CategoryController` | function | Category and subcategory CRUD |
| `GrowthController` | function | Growth metrics and cohort queries |
| `AdminBankRequestController` | function | Review and approve shop bank change requests |
| `MasterDataController` | function | Read-only master data (service types, shop types) |
| `systemSetting.controller` | function | Runtime configuration key/value management |
| `ErrorLogController` | function | Platform error log queries |
| `Category` model | struct | Top-level product / shop category |
| `Subcategory` model | struct | Category child node |
| `BusinessCategory` model | struct | Shop business type classification |
| `ShopType` model | struct | Operational type of a shop |
| `ServiceType` model | struct | Delivery service tier definition |
| `SystemSetting` model | struct | Key/value platform configuration |
| `ErrorLog` model | struct | Application error audit record |

## Dependencies
- **Backend:** all domain services (read access for analytics), `systemSetting` (platform config flags)
- **Frontend:** `api/adminApi.ts`, `api/adminUsersApi.ts`, `api/systemApi.ts`

## Notes
- Category and subcategory taxonomies are referenced by the product and shop packages
- `SystemSetting` values control feature flags and platform-wide limits read at runtime
