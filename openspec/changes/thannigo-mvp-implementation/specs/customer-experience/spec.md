## ADDED Requirements

### Requirement: Customer home screen with GPS-based shop listing
The Customer Home screen SHALL display nearby shops using the customer's GPS coordinates fetched via Mapbox on screen load. If GPS is denied, the customer SHALL be prompted to enter an address manually.

#### Scenario: Home screen loads with GPS available
- **WHEN** a customer opens the Home screen and GPS permission is granted
- **THEN** the system SHALL fetch coordinates via Mapbox and display shop cards sorted by proximity

#### Scenario: Home screen with GPS denied
- **WHEN** a customer opens the Home screen and GPS permission is denied
- **THEN** the system SHALL prompt the customer to enter a delivery address manually

#### Scenario: Active order banner shown
- **WHEN** a customer has an order in progress
- **THEN** the Home screen SHALL display a persistent Active Order Banner that navigates to the Order Tracking screen on tap

#### Scenario: Pending can warning banner shown at threshold
- **WHEN** a customer has `pending_cans >= 2` for any can size
- **THEN** the Home screen SHALL display a persistent warning banner: "You have [X] empty cans pending. Please return them to continue ordering."

#### Scenario: Pending can warning banner hidden
- **WHEN** all of the customer's `pending_cans` values are below 2
- **THEN** the pending can warning banner SHALL NOT be displayed

#### Scenario: Offers section displays active platform coupons
- **WHEN** a customer views the Home screen
- **THEN** the Offers section SHALL display currently active platform (Admin) coupons available to the customer

### Requirement: One-shop cart rule
A customer cart SHALL contain products from only one shop at a time. Adding a product from a different shop SHALL prompt the customer to clear their cart.

#### Scenario: Customer adds product from a second shop
- **WHEN** a customer with items from Shop A adds a product from Shop B
- **THEN** the system SHALL show a dialog: "Your cart has items from [Shop A]. Clear cart and switch to [Shop B]?"

#### Scenario: Customer confirms cart switch
- **WHEN** the customer confirms the cart clear dialog
- **THEN** the system SHALL log ORD0006, clear all items from Shop A, and add the new item from Shop B

#### Scenario: Customer cancels cart switch
- **WHEN** the customer declines the cart clear dialog
- **THEN** the cart SHALL remain unchanged with items from Shop A

### Requirement: Checkout with full price breakdown
The checkout screen SHALL display a complete, transparent price breakdown including all charges, deposits, credits, discounts, and the final total. No hidden charges are permitted.

#### Scenario: Checkout price breakdown for water product order
- **WHEN** a customer with `pending_cans > 0` and `customer_deposit_balance > 0` checks out a water product
- **THEN** the price breakdown SHALL include: Items Total, Pending Can Deposit (auto-added if unpaid deposit exists), Deposit Credit (auto-subtracted from `customer_deposit_balance`), Floor Charge, Delivery Charge, Discount, Final Total

#### Scenario: Minimum order value not met
- **WHEN** the cart total is below the shop's configured minimum order value
- **THEN** the system SHALL log ORD0007 and display "Minimum order value is ₹[X]." The Place Order button SHALL be disabled.

#### Scenario: COD order placement
- **WHEN** a customer selects COD and taps Place Order
- **THEN** the system SHALL create the order with status Pending; no in-app payment is collected; the customer pays at delivery

#### Scenario: Online payment via Razorpay
- **WHEN** a customer selects Online Payment and taps Place Order
- **THEN** the system SHALL open the Razorpay payment sheet; on payment success the order is created with status Pending; on payment failure the order is NOT created

#### Scenario: Payment success but order creation fails
- **WHEN** Razorpay confirms payment but the backend fails to create the order
- **THEN** the system SHALL log PAY0006 as CRITICAL, trigger an auto-refund immediately, notify the support team, and show the customer: "Payment received but order failed. Refund has been initiated."

#### Scenario: Coupon code applied
- **WHEN** a customer enters a valid coupon code and taps Apply
- **THEN** the discount SHALL be applied to the order total and the breakdown SHALL update

#### Scenario: Invalid coupon code entered
- **WHEN** a customer enters an invalid coupon code
- **THEN** the system SHALL log CPN0001 and display "Invalid coupon code."

#### Scenario: Loyalty points toggle — within cap
- **WHEN** a customer enables loyalty points redemption and their available points cover up to 20% of the order total
- **THEN** the equivalent rupee discount SHALL be applied (100 pts = ₹10, capped at 20% of bill)

#### Scenario: Loyalty points exceed 20% cap
- **WHEN** a customer's redeemable points would exceed 20% of the order value
- **THEN** the system SHALL log LOY0002 and display "You can redeem up to ₹[X] on this order."

### Requirement: Checkout block for excessive pending cans
When a customer's `pending_cans` reaches the block threshold (3), checkout SHALL be blocked.

#### Scenario: Checkout blocked at pending can block threshold
- **WHEN** a customer has `pending_cans >= 3` for any can size
- **THEN** the Place Order button SHALL be disabled and a message SHALL display: "Checkout blocked — [X] empty cans pending. Return cans or deposit will be charged."

#### Scenario: Customer with COD disabled attempts COD
- **WHEN** a customer with `cod_blocked = true` selects COD at checkout
- **THEN** the system SHALL log ORD0008 and display "COD not available. Please use Online Payment."

### Requirement: Order tracking via Mapbox
The order tracking screen SHALL display the live delivery person location on a Mapbox map once the order is in Picked or Out for Delivery status.

#### Scenario: Map shown when order is Picked
- **WHEN** a customer views the tracking screen for an order in Picked status
- **THEN** the screen SHALL display the delivery person's live GPS location on a Mapbox map, refreshing every 5 seconds

#### Scenario: Map shown with ETA when Arriving Soon
- **WHEN** the delivery person is within 500m of the delivery address
- **THEN** the tracking screen SHALL display "Arriving Soon" status with an ETA indicator

#### Scenario: Map not shown for non-transit statuses
- **WHEN** an order is in Order Placed, Accepted, Delivered, or Failed Delivery status
- **THEN** the tracking screen SHALL not display a map

### Requirement: Order history with smart reorder
The order history screen SHALL list all past orders and allow the customer to reorder from completed orders. The reorder SHALL check current item availability and notify the customer of any removed items.

#### Scenario: Reorder with all items available
- **WHEN** a customer taps Reorder on a completed order and all items are currently available
- **THEN** the system SHALL rebuild the cart with the same items from the original order

#### Scenario: Reorder with some items unavailable
- **WHEN** a customer taps Reorder on a completed order and some items are deactivated or the shop is closed
- **THEN** the system SHALL add available items to cart, remove unavailable items silently, and show a warning listing exactly which items were removed

#### Scenario: Reorder deposit logic applied fresh
- **WHEN** a customer triggers a reorder
- **THEN** the deposit line item in the rebuilt cart SHALL reflect the customer's current `pending_cans` and `customer_deposit_balance` — not the original order's deposit state

### Requirement: Post-delivery feedback
After an order reaches Delivered status, the system SHALL prompt the customer to leave optional feedback. Submitting feedback earns +10 loyalty points.

#### Scenario: Customer submits feedback
- **WHEN** a customer submits a star rating (1–5) with optional text (max 500 chars)
- **THEN** the system SHALL record the feedback and credit +10 loyalty points to the customer

#### Scenario: Customer skips feedback
- **WHEN** a customer taps Skip on the feedback prompt
- **THEN** the order SHALL be marked "Feedback Skipped"; no points are awarded

### Requirement: Loyalty points screen
The loyalty points screen SHALL display the customer's current balance, tier badge, progress to next tier, point expiry notice, and last 20 point events.

#### Scenario: Loyalty screen displays tier and progress
- **WHEN** a customer views the Loyalty Points screen
- **THEN** the system SHALL display their current tier (Bronze/Silver/Gold/Platinum), current points balance, and a progress bar showing orders needed to reach the next tier

#### Scenario: Points expiry notice shown
- **WHEN** a customer has points that will expire within their 6-month window
- **THEN** the Loyalty Points screen SHALL display a notice: "Points expire 6 months from earning date."

### Requirement: Customer profile and settings
The customer profile screen SHALL allow updating name, saved addresses (max 5), delivery preferences, notification preferences, dark mode toggle, PIN change, referral code view, and logout.

#### Scenario: Customer adds a saved address
- **WHEN** a customer adds a new delivery address
- **THEN** the system SHALL save it (up to the maximum of 5 addresses per customer)

#### Scenario: Customer exceeds max saved addresses
- **WHEN** a customer attempts to add a 6th saved address
- **THEN** the system SHALL prevent the addition and prompt the customer to delete an existing address first

### Requirement: Complaint submission by any role (customer, shop owner, delivery person)
Any non-admin role SHALL be able to raise a complaint via a complaint form. The form requires a category, description (min 20 chars), and optionally a photo attachment. On submission, Admin SHALL be notified via push and Brevo email.

#### Scenario: Customer raises a complaint
- **WHEN** a customer taps "Raise Complaint", selects a category, enters a description of at least 20 characters, optionally attaches a photo, and submits
- **THEN** the system SHALL log COMP0001, persist the complaint with status Open and `complainant_role = customer`, and send a push + Brevo email to Admin: "New complaint from [Customer Name]"

#### Scenario: Shop owner raises a complaint
- **WHEN** a shop owner taps "Raise Complaint" and submits a valid complaint form
- **THEN** the system SHALL log COMP0001, persist the complaint with `complainant_role = shop_owner`, and notify Admin

#### Scenario: Delivery person raises a complaint
- **WHEN** a delivery person taps "Raise Complaint" and submits a valid complaint form
- **THEN** the system SHALL log COMP0001, persist the complaint with `complainant_role = delivery_person`, and notify Admin

#### Scenario: Complaint description below minimum length
- **WHEN** a complainant submits a description shorter than 20 characters
- **THEN** the system SHALL block submission and display a validation message: "Description must be at least 20 characters."

#### Scenario: Admin notification fails
- **WHEN** the system fails to send the Admin notification after a complaint is persisted
- **THEN** the system SHALL log COMP0002 and retain the complaint as Open; the complainant submission SHALL NOT be reverted

#### Scenario: Complainant notified on resolution
- **WHEN** Admin resolves a complaint
- **THEN** the complainant SHALL receive a push notification and a Brevo email: "Your complaint has been resolved. View details."
