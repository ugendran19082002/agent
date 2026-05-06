## ADDED Requirements

### Requirement: Central theme module
The mobile application SHALL expose a single documented module (or re-export barrel) that exports design tokens for spacing, typography roles, semantic colors, border radii, and elevation/shadow presets used by screens and shared components.

#### Scenario: Developer styles a new screen
- **WHEN** a developer adds padding, margin, font size, border radius, or shadow to a screen or component
- **THEN** they SHALL reference named tokens from the central theme rather than raw numeric literals, except where a literal is required by the platform and documented with an inline comment.

### Requirement: Spacing scale
The system SHALL define a spacing scale with fixed steps (for example multiples of 4) and named keys (e.g. `xs`, `sm`, `md`, `lg`, `xl`) used for padding, margin, gaps, and icon-text spacing.

#### Scenario: Vertical spacing between stacked elements
- **WHEN** two or more UI blocks are stacked vertically in a flow
- **THEN** the gap or margin between them SHALL use values from the spacing scale, preserving equal rhythm across the screen.

#### Scenario: Screen edge padding
- **WHEN** content is inset from the screen horizontal edges
- **THEN** left and right padding SHALL use spacing scale tokens consistently for that screen group (customer, shop, admin, etc.), not ad hoc numbers per screen.

### Requirement: Typography roles
The system SHALL map font size, weight, line height, and optional letter spacing through named typography roles (for example `display`, `title`, `body`, `caption`, `label`) consumed by text components or wrappers.

#### Scenario: Body copy readability
- **WHEN** long-form or secondary descriptive text is shown
- **THEN** it SHALL use the `body` (or equivalent) role so line height and size stay consistent across devices.

### Requirement: Semantic colors and elevation
Color usage for backgrounds, text, borders, and accents SHALL use semantic tokens (e.g. `primary`, `onPrimary`, `surface`, `error`) and shadow/elevation presets SHALL be named and reused for cards and modals.

#### Scenario: Error text is shown
- **WHEN** inline validation or API error text is rendered
- **THEN** the color SHALL use the semantic error/on-error tokens from the theme, not one-off hex values in the screen file.
