## ADDED Requirements

### Requirement: Flex-first responsive layouts
Screens and reusable layouts SHALL use flexbox and relative width patterns (`flex`, `width: '100%'`, `maxWidth` where appropriate) so primary content adapts from narrow phones through tablets without horizontal clipping.

#### Scenario: Small phone width
- **WHEN** the app runs at a width at or below the documented “small phone” breakpoint
- **THEN** horizontally scrollable panes SHALL not be required for primary content except maps or deliberately wide widgets, and text SHALL wrap within readable bounds.

#### Scenario: Tablet width
- **WHEN** the window width meets or exceeds the tablet breakpoint
- **THEN** content SHALL either scale with wider gutters or adopt a constrained max content width per design, without edge-to-edge overcrowding unless intentionally full-bleed.

### Requirement: Overflow prevention
No audited screen SHALL ship with known overlapping interactive elements or content clipped by fixed-height containers except where a bounded widget is intentional (e.g. thumbnail with fixed aspect ratio).

#### Scenario: Long content on a form screen
- **WHEN** keyboard or small viewport reduces visible area
- **THEN** the screen SHALL scroll or resize via `KeyboardAvoidingView` / `ScrollView` patterns so primary actions remain reachable.

### Requirement: Fixed dimensions minimized
Fixed `width` and `height` on responsive containers SHALL be eliminated or reduced to shared constants / primitives (icons, minimum touch rows) during the exhaustive refactor.

#### Scenario: List row height
- **WHEN** multiple screens render similar list rows
- **THEN** row minimum heights SHALL come from the same token or primitive styles, not independent literals per screen.
