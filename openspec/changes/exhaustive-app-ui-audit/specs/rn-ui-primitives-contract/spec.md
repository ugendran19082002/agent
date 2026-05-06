## ADDED Requirements

### Requirement: Primitive visual parity
Shared UI primitives for buttons, text inputs, cards, and standard list rows SHALL share the same height rules, border radii, horizontal padding rules, and typography roles exported from the theme, except where a single component variant is intentionally different and documented.

#### Scenario: Two screens render a primary action
- **WHEN** both use the shared `Button` primitive with the same `size`
- **THEN** visual height, corner radius, and label typography SHALL match within the theme tolerance (no one-off pixel tweaks at screen level).

### Requirement: Input and validation presentation
Text inputs SHALL use the shared input component or styles derived from it; error and hint text SHALL use semantic `colors.error` / muted text from `useAppTheme()` and spacing tokens for vertical separation.

#### Scenario: Validation error on field
- **WHEN** a field is invalid
- **THEN** error messaging SHALL follow the shared input pattern for border, background tint, and error text styling.

### Requirement: Card and list row chrome
Cards and list rows SHALL use shared elevation/shadow and border tokens; dividers SHALL use theme divider color and thickness presets.

#### Scenario: List of orders
- **WHEN** multiple order rows appear in sequence
- **THEN** separators and card padding SHALL not introduce alternating ad hoc spacing between rows.
