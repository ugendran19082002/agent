## ADDED Requirements

### Requirement: Two independent COD control mechanisms
The system SHALL implement two independent COD control systems on the `users` table: `cod_failed_count` (abuse block) and `cod_trust_score` (behavioural trust). Either mechanism reaching its threshold SHALL independently block COD for that customer.

#### Scenario: Either mechanism independently blocks COD
- **WHEN** `cod_failed_count` reaches 3 OR `cod_trust_score` reaches 0
- **THEN** `cod_blocked` SHALL be set to `true`; the customer SHALL see "Cash on Delivery is not available for your account. Please use Online Payment." when selecting COD

#### Scenario: Both mechanisms are below threshold
- **WHEN** both `cod_failed_count` < 3 AND `cod_trust_score` > 0
- **THEN** COD SHALL remain available to the customer

### Requirement: cod_failed_count abuse block (threshold: 3)
`cod_failed_count` SHALL increment on two events: customer-initiated cancel-after-pickup and failed COD delivery (customer fault). Reaching 3 permanently and immediately blocks COD, regardless of trust score.

#### Scenario: Customer cancels after Picked — cod_failed_count increments
- **WHEN** a customer cancels a COD order after the Picked state
- **THEN** `cod_failed_count` SHALL increment by 1

#### Scenario: Failed COD delivery (customer fault) — cod_failed_count increments
- **WHEN** an order is closed as `failed_delivery` due to customer no-response on a COD order
- **THEN** `cod_failed_count` SHALL increment by 1

#### Scenario: cod_failed_count reaches 3 — COD permanently blocked
- **WHEN** `cod_failed_count` reaches 3
- **THEN** the system SHALL immediately set `cod_blocked = true`; this block is permanent regardless of trust score; the customer is notified via push: "Your COD access has been disabled due to repeated failures."

### Requirement: cod_trust_score behavioural trust system (start 5, max 10, block at 0)
`cod_trust_score` SHALL start at 5 for all new customers (configurable via System Settings). It decrements on behavioural failures and increments by +1 for every 5 successful COD deliveries. It is capped at the System Setting `cod_trust_score_max` (default 10). Reaching 0 blocks COD.

#### Scenario: New customer receives initial trust score
- **WHEN** a new customer account is created
- **THEN** `cod_trust_score` SHALL be set to the System Setting value `cod_trust_score_starting_value` (default 5) and `cod_blocked = false`

#### Scenario: Customer cancels after Picked — trust score decremented
- **WHEN** a customer cancels an order after Picked (COD or UPI)
- **THEN** `cod_trust_score` SHALL decrement by 1

#### Scenario: No-response first offence — no trust score change
- **WHEN** a customer fails to respond at delivery for the first time
- **THEN** a warning SHALL be shown to the customer; `cod_trust_score` SHALL NOT change

#### Scenario: No-response repeat offence — trust score decremented by 1
- **WHEN** a customer fails to respond at delivery for a repeat offence
- **THEN** `cod_trust_score` SHALL decrement by 1

#### Scenario: Severe or repeated no-response pattern — trust score decremented by 2
- **WHEN** Admin marks a no-response pattern as severe or repeatedly repeated
- **THEN** `cod_trust_score` SHALL decrement by 2 (Admin reviewable action)

#### Scenario: 5 successful COD deliveries — trust score recovers by +1
- **WHEN** a customer completes 5 successful COD deliveries (incrementing `successful_cod_deliveries`)
- **THEN** `cod_trust_score` SHALL increment by 1 (capped at `cod_trust_score_max`) and `successful_cod_deliveries` SHALL reset to 0

#### Scenario: Trust score reaches 0 — COD blocked
- **WHEN** `cod_trust_score` reaches 0
- **THEN** `cod_blocked` SHALL be set to `true`; the customer SHALL see the COD not available message

#### Scenario: No-response events do NOT affect cod_failed_count
- **WHEN** a customer no-response event occurs
- **THEN** `cod_failed_count` SHALL NOT change; only `cod_trust_score` is affected

### Requirement: COD blocked customers are notified and consistently shown correct UI
When a customer's COD is blocked, they SHALL see the COD payment option disabled and a clear explanation at checkout. A push notification SHALL be sent at the time of block.

#### Scenario: COD newly blocked — customer notified
- **WHEN** either COD mechanism triggers a block for the first time
- **THEN** the system SHALL send a push notification: "Your COD access has been disabled due to repeated failures."

#### Scenario: Already-blocked customer views checkout
- **WHEN** a customer with `cod_blocked = true` reaches the payment selection screen
- **THEN** the COD option SHALL be visually disabled and the message "Cash on Delivery is not available for your account. Please use Online Payment." SHALL be shown
