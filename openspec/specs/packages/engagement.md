# Package: engagement

## Responsibility
Drives customer retention and satisfaction through loyalty points, referral rewards, ratings, discount coupons, and complaint management.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `LoyaltyService` | function (service) | Award, redeem, and expire loyalty points |
| `ReferralService` | function (service) | Track referrals and disburse referral rewards |
| `RatingService` | function (service) | Create and aggregate shop/delivery ratings |
| `CouponService` | function (service) | Validate and apply discount coupons at checkout |
| `ComplaintService` | function (service) | Submit and manage order/shop complaints |
| `LoyaltyPoint` model | struct | Per-user loyalty point balance and transaction records |
| `LoyaltyLevel` model | struct | Tier definitions (thresholds, multipliers) |
| `LoyaltySetting` model | struct | Global loyalty programme configuration |
| `Referral` model | struct | Referral link record between referrer and referee |
| `ReferralReward` model | struct | Reward disbursed upon successful referral conversion |
| `ReferralSetting` model | struct | Programme-level referral reward configuration |
| `RatingReview` model | struct | Customer rating and review for an order/shop |
| `UserShopStat` model | struct | Aggregated customer interaction stats per shop |
| `Coupon` model | struct | Discount coupon definition (type, amount, constraints) |
| `CouponUsage` model | struct | Per-user coupon redemption audit record |
| `Complaint` model | struct | Complaint record linked to an order or shop |
| `SupportTicket` model | struct | Customer support ticket |
| `SupportCategory` model | struct | Support ticket category taxonomy |
| `SupportSubcategory` model | struct | Support ticket subcategory |
| `Notification` model | struct | In-app notification record |
| `PushToken` model | struct | Device FCM token for push delivery |

## Dependencies
- **Backend:** `OrderService` (trigger events), Firebase Admin (push delivery), BullMQ (async reward processing)
- **Frontend:** `api/engagementApi.ts`, `api/complaintApi.ts`, `api/helpApi.ts`, `stores/appStore.ts`, `app/rewards.tsx`, `app/customer-reviews.tsx`

## Notes
- Loyalty points are awarded asynchronously via BullMQ after order completion
- Coupon validation runs synchronously at order placement time
- Support tickets and complaints are routed to the admin package for resolution
