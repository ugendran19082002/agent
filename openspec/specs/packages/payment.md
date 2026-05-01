# Package: payment

## Responsibility
Integrates with Razorpay for payment capture and refunds, and manages shop earnings, payout requests, and disbursement logs.

## Classes / Components
| Component | Kind | Role |
|---|---|---|
| `payout.controller` | function | Shop payout request creation and status queries |
| `ShopPayoutService` | function (service) | Payout calculation, approval, and disbursement |
| `Payment` model | struct | Payment record linked to an order — provider ref, amount, status |
| `PaymentAttempt` model | struct | Individual Razorpay payment attempt (supports retries) |
| `Refund` model | struct | Refund record linked to a payment |
| `ShopWallet` model | struct | Running earnings balance for a shop |
| `PayoutLog` model | struct | Disbursement event audit trail |
| `WebhookEvent` model | struct | Inbound Razorpay webhook payloads for idempotent processing |
| `Bank` model | struct | Bank account details used for payout transfers |

## Dependencies
- **Backend:** Razorpay SDK, `OrderService` (amount resolution), `ShopBankAccount` (payout destination)
- **Frontend:** `api/payoutApi.ts`, `react-native-razorpay`, `app/shop/(tabs)/earnings.tsx`, `app/customer-payment-history.tsx`

## Notes
- Webhook events are stored before processing to ensure idempotency on replay
- `ShopWallet` balance is updated atomically with each completed order and payout event
- Payout disbursements are initiated manually by shop owners and approved by admin
