## ADDED Requirements

### Requirement: Loyalty points earning events
The system SHALL award loyalty points to customers based on defined earning events. Points are credited asynchronously after the triggering event completes.

#### Scenario: Points earned for spend
- **WHEN** a customer's order is completed and the order total (excluding deposit) is ₹100 or more
- **THEN** the system SHALL credit 10 loyalty points for every ₹100 spent (tier multiplier applied)

#### Scenario: Points earned per water can
- **WHEN** a customer's water product order is delivered
- **THEN** the system SHALL credit 2 loyalty points per water can unit in the order (tier multiplier applied)

#### Scenario: First completed order bonus
- **WHEN** a customer's very first order is delivered successfully
- **THEN** the system SHALL credit 50 bonus loyalty points

#### Scenario: Feedback submission earns points
- **WHEN** a customer submits a star rating for a delivered order
- **THEN** the system SHALL credit 10 loyalty points

#### Scenario: Referral — referred friend completes first order
- **WHEN** a customer referred by a referral code completes their first order
- **THEN** the system SHALL credit 100 loyalty points to the referrer and 50 points to the referred friend simultaneously; both SHALL receive push notifications

#### Scenario: Festival/campaign 2x multiplier active
- **WHEN** a festival or campaign multiplier is active on the platform
- **THEN** all earning events SHALL award double the base points

### Requirement: Loyalty points redemption capped at 20% of order value
Customers SHALL redeem loyalty points at checkout at a rate of 100 points = ₹10, with a cap of 20% of the order bill value.

#### Scenario: Customer redeems points within cap
- **WHEN** a customer enables the loyalty points toggle at checkout and their redeemable amount is within 20% of the order total
- **THEN** the system SHALL apply the discount (100 pts = ₹10)

#### Scenario: Customer's redeemable points exceed 20% cap
- **WHEN** a customer's available points would convert to more than 20% of the order value
- **THEN** the system SHALL cap the redemption at 20% of the order value and log LOY0002

### Requirement: 6-month fixed loyalty points expiry
Loyalty points expire 6 months from the date they were earned. Points are expired on a per-event basis (each earning event has its own expiry).

#### Scenario: Points expire after 6 months
- **WHEN** a loyalty point event reaches 6 months from its `earned_at` date
- **THEN** the system SHALL expire those points and reduce the customer's balance

#### Scenario: Redeemed points are not expired twice
- **WHEN** loyalty points have been redeemed against an order
- **THEN** those points SHALL NOT also be expired; expiry applies only to unredeemed points

### Requirement: 4-tier loyalty badge system with order count criteria
The system SHALL assign loyalty tiers based on the customer's completed order count. Tiers determine the points earning multiplier.

#### Scenario: New customer starts as Bronze
- **WHEN** a new customer account is created
- **THEN** their loyalty tier SHALL be Bronze (1× multiplier)

#### Scenario: Tier upgrade to Silver at 10 completed orders
- **WHEN** a customer completes their 10th order
- **THEN** their tier SHALL automatically upgrade to Silver (1.2× multiplier)

#### Scenario: Tier upgrade to Gold at 25 completed orders
- **WHEN** a customer completes their 25th order
- **THEN** their tier SHALL automatically upgrade to Gold (1.5× multiplier)

#### Scenario: Tier upgrade to Platinum at 50 completed orders
- **WHEN** a customer completes their 50th order
- **THEN** their tier SHALL automatically upgrade to Platinum (2× multiplier)

### Requirement: Points handling on cancellation and refund
Points earned or used on a cancelled or refunded order SHALL be reversed.

#### Scenario: Order cancelled — points usage reversed
- **WHEN** an order is cancelled that had loyalty points redeemed against it
- **THEN** the system SHALL return the redeemed points to the customer's balance

#### Scenario: Order cancelled — points not granted
- **WHEN** an order is cancelled before completion
- **THEN** any points that would have been earned SHALL NOT be credited

#### Scenario: Order refunded — earned points deducted
- **WHEN** an order that already credited points is refunded
- **THEN** the system SHALL deduct the earned points from the customer's balance

### Requirement: Unique referral code per customer
Every customer SHALL have a unique referral code visible on their profile. The referral code can be shared and applied once per new account.

#### Scenario: Referral code generated on customer registration
- **WHEN** a new customer account is created
- **THEN** the system SHALL generate and store a unique `referral_code` for the customer

#### Scenario: Referral code applied by new user
- **WHEN** a new user enters a referral code during or after registration
- **THEN** the system SHALL validate the code, link the referral, and await the new user's first completed order to disburse rewards

#### Scenario: Invalid referral code entered
- **WHEN** a user enters a referral code that does not exist in the system
- **THEN** the system SHALL log REF0002 and display an error

#### Scenario: Self-referral blocked
- **WHEN** a user attempts to enter their own referral code
- **THEN** the system SHALL log REF0003 and block the self-referral

#### Scenario: Referral code already used — cannot be changed
- **WHEN** a user has already submitted a referral code
- **THEN** the system SHALL not allow the referral code to be changed or re-submitted

#### Scenario: Points credited only after first order is fully completed
- **WHEN** the referred friend places an order but it is not yet delivered
- **THEN** no referral points SHALL be credited; points are credited only after full delivery confirmation of the friend's first order
