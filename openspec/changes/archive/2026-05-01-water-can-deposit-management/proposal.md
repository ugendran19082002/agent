## Why

The current system has no mechanism to handle can deposits for water delivery — customers can place orders without tracking whether they hold a can or need to pay a deposit, making it impossible to enforce fair pricing and can accountability. This feature is needed now to support the core water delivery business model where cans are reusable assets.

## What Changes

- Add deposit logic to the order pricing engine: if a customer has no empty can to return, a deposit is charged on top of the water price
- Introduce a `user_can_balance` tracking table: `cans_given - cans_returned = active cans held`
- Modify the order UI to conditionally show deposit line item (₹0 if customer has an empty can, full deposit amount if not)
- Add a delivery-side interface with an "Empty can collected / Not collected" toggle that delivery personnel use when fulfilling orders
- Override mechanism: if delivery person marks "not collected" after customer claimed to have an empty can, the system adds the deposit charge post-delivery
- Products with `is_water = true` (20L Can, 10L Can) are deposit-applicable; normal products are not

## Capabilities

### New Capabilities

- `can-deposit-pricing`: Automatic deposit charge calculation at order time based on the customer's current can balance — deposit added only when balance is zero
- `user-can-balance`: Per-user ledger tracking how many full cans have been given vs. empty cans returned, with balance exposed to frontend and backend
- `delivery-can-collection`: Delivery personnel UI flow to confirm or override empty-can collection status, triggering retrospective deposit charges when needed

### Modified Capabilities

- `checkout-refactor`: Order total calculation must factor in the deposit amount based on can balance; pricing breakdown must show Water Price and Deposit as separate line items

## Impact

- **Database**: New `user_can_balance` table; `orders` table may need deposit-related columns
- **Backend API**: New endpoints for can balance query, can collection confirmation, and delivery override
- **Frontend (Customer)**: Order page pricing breakdown update — deposit shown/hidden based on balance
- **Frontend (Delivery/Admin)**: New delivery confirmation screen with can collection checkbox
- **Products**: `is_water` flag on products determines deposit eligibility
