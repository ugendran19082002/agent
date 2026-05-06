## ADDED Requirements

### Requirement: State surfaces use design system
Loading indicators, skeletons, empty states, error banners, and offline messaging SHALL use the same spacing scale, typography roles, semantic colors, and shared primitives (e.g. card, list container, `EmptyState`) as primary success content for that screen.

#### Scenario: Loading replaces content area
- **WHEN** a data-driven screen is in a loading state
- **THEN** the loading UI SHALL use theme spacing for insets, typography roles for any labels, and shared loader components aligned with the screen’s content width.

#### Scenario: Empty list is displayed
- **WHEN** a list endpoint returns no items
- **THEN** the empty state SHALL use the shared empty-state component and theme tokens for illustration spacing, title/body text, and primary call-to-action placement.

#### Scenario: Recoverable error with retry
- **WHEN** a screen shows an error with a retry action
- **THEN** error text and actions SHALL use semantic error colors, consistent button primitives, and spacing aligned with the surrounding screen layout.
