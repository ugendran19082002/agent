## ADDED Requirements

### Requirement: Reject resolution screen with Switch Shop and Refund as distinct options
When a shop rejects or auto-rejects an order, the customer SHALL be presented with two separate, distinct options on a reject resolution screen: Switch Shop and Refund. These options SHALL never be combined.

#### Scenario: Customer presented with Switch Shop or Refund after rejection
- **WHEN** a shop owner rejects an order or the auto-reject timeout fires
- **THEN** the system SHALL navigate the customer to the reject resolution screen displaying both Switch Shop and Refund as separate choices

#### Scenario: Switch Shop result shown in-app only
- **WHEN** the reject resolution screen is shown
- **THEN** the system SHALL NOT send a push notification; the result is shown in-app on the reject resolution screen only

### Requirement: Auto-suggest nearest available shop with same items
The Switch Shop option SHALL auto-suggest the nearest available shop that carries all the ordered items, with cheapest total as a tiebreaker. The customer may also browse alternative shops from a filtered list.

#### Scenario: Auto-suggestion presented to customer
- **WHEN** a customer taps Switch Shop on the reject resolution screen
- **THEN** the system SHALL display an auto-suggestion of the nearest available shop (cheapest as tiebreaker) that has all the ordered items in stock

#### Scenario: Customer browses alternative shops
- **WHEN** a customer declines the auto-suggestion
- **THEN** the system SHALL present a filtered list of other available shops carrying the ordered items, sorted by proximity

#### Scenario: Customer declines switch
- **WHEN** a customer declines all switch options
- **THEN** the system SHALL fall back to the Refund option and process a full refund for the original order

### Requirement: Price difference handling on shop switch
If the alternative shop's total is higher than the original order, the customer MUST explicitly approve the difference before the switch proceeds. If lower, the refund (UPI) or payment adjustment (COD) SHALL be automatic.

#### Scenario: Alternative shop price is higher — explicit approval required
- **WHEN** the alternative shop's total for the same items is higher than the original order total
- **THEN** the system SHALL show the price difference and require explicit customer approval before switching; if the customer declines, they are returned to the refund option

#### Scenario: Alternative shop price is lower — UPI automatic refund
- **WHEN** the alternative shop's total is lower than the original UPI/online order total
- **THEN** the system SHALL automatically process a refund of the price difference; the customer does not need to take any action

#### Scenario: Alternative shop price is lower — COD no adjustment needed
- **WHEN** the alternative shop's total is lower than the original COD order total
- **THEN** the customer simply pays the new lower amount at delivery; no refund action is needed

### Requirement: Shop-rejected refunds are full and do not affect customer tiers
When a customer receives a refund due to shop rejection or auto-rejection (not customer-initiated), the refund SHALL be 100% and SHALL NOT affect the customer's UPI cancellation tier or COD counters.

#### Scenario: Shop-rejected online order — full refund, no tier impact
- **WHEN** a shop rejects an online order and the customer chooses Refund on the resolution screen
- **THEN** the system SHALL process a 100% refund to the original payment method; `cancellation_count_30d` and `cod_failed_count` SHALL NOT change
