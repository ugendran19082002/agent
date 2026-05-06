## ADDED Requirements

### Requirement: Screen-level audit coverage
Every route-level screen in the mobile app SHALL be reviewed and updated so that layout, spacing, typography, and colors comply with the central theme tokens and shared primitives documented in this change.

#### Scenario: Screen uses theme spacing
- **WHEN** a route-level screen is audited for conformance
- **THEN** padding, margin, and gaps SHALL be expressed with theme spacing tokens except for documented exceptions.

#### Scenario: Screen removes duplicate styles
- **WHEN** a screen contains repeated style fragments identical to another screen or primitive
- **THEN** those fragments SHALL be consolidated into a shared primitive, shared `StyleSheet`, or theme-derived helper.

### Requirement: Inline style reduction
Screens SHALL avoid inline style objects for static layout and appearance; static styles SHALL live in `StyleSheet.create` or memoized module-level objects, with inline objects reserved for truly dynamic values.

#### Scenario: List screen with many rows
- **WHEN** a screen renders a long list of items
- **THEN** row styles SHALL not allocate new style objects on every render without memoization.

### Requirement: Documentation of audit findings
The change SHALL produce a written audit summary listing issues by screen (or feature area) before refactor and noting resolution (token applied, primitive adopted, layout fix), suitable for reviewers and QA.

#### Scenario: Reviewer validates completeness
- **WHEN** a reviewer checks the delivered audit document
- **THEN** each major screen group (e.g. auth, customer, shop, delivery, admin) SHALL be represented with findings and status.

### Requirement: Regression checks on target devices
Conformance work SHALL be validated on at least one small phone size, one large phone size, and one tablet or wide emulator/simulator configuration to confirm responsive behavior.

#### Scenario: QA validates tablet layout
- **WHEN** QA opens representative screens on a tablet-class device
- **THEN** no critical content SHALL be clipped, overlapped, or misaligned relative to the design tokens.
