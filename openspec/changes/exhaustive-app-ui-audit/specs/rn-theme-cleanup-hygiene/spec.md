## ADDED Requirements

### Requirement: Central theme consumption
Application code SHALL import spacing, typography, color roles, radii, and shadows from `constants/theme.ts` (or the `styles` barrel re-export) rather than maintaining parallel numeric constants in feature folders.

#### Scenario: New feature adds a styled section
- **WHEN** a developer adds padding to a new section
- **THEN** they SHALL import `Spacing` from the theme module rather than introducing a new local `const PADDING = 16` duplicate.

### Requirement: Duplicate and unused style removal
The exhaustive pass SHALL consolidate duplicate StyleSheet blocks into shared helpers or primitives and delete unused style keys and files identified during audit.

#### Scenario: Duplicate card styles found
- **WHEN** two screens define identical card shadows and padding
- **THEN** those styles SHALL be merged into `getCommonStyles`, a primitive `Card`, or a shared module, and redundant copies removed.

### Requirement: List render performance hygiene
`renderItem` and other high-frequency render paths SHALL avoid allocating new style objects or arrays for static appearance; static styles SHALL live in `StyleSheet.create` or stable memoized objects.

#### Scenario: Long FlashList of items
- **WHEN** a list renders hundreds of rows
- **THEN** row components SHALL not construct inline `{ ... }` style objects for unchanging layout properties on every render.
