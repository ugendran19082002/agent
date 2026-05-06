## ADDED Requirements

### Requirement: Spacing scale alignment
All new or refactored layout code SHALL use spacing values from the shared design tokens whose numeric scale is **4, 8, 12, 16, 20, 24, 32** (and named keys in `Spacing` that map only to those steps or documented multiples such as section padding).

#### Scenario: Developer adds vertical gap between rows
- **WHEN** a developer inserts margin or padding between stacked UI elements
- **THEN** the value SHALL resolve to a `Spacing` token or an approved combination of tokens, not an arbitrary integer outside the scale.

### Requirement: Removal of ad hoc spacing literals
During the exhaustive pass, existing `padding`, `margin`, and `gap` literals in StyleSheet and inline objects SHALL be replaced with `Spacing` references except for documented exceptions (e.g. platform hairlines) noted inline per design.

#### Scenario: Legacy screen uses padding 15
- **WHEN** such a screen is refactored for this change
- **THEN** the padding SHALL be adjusted to the nearest token-approved value or the spacing scale SHALL be extended in `theme.ts` with project-wide justification, not left as 15 in the screen file.

### Requirement: Vertical rhythm between sections
Screens SHALL use consistent section separation (e.g. inter-section margins using the same token family) within a role or flow so vertical rhythm does not vary randomly between adjacent screens.

#### Scenario: User navigates between two primary screens in the same tab
- **WHEN** both screens display list-led content with section headers
- **THEN** the vertical spacing from screen edge to first section and between sections SHALL match the token contract for that app area.
