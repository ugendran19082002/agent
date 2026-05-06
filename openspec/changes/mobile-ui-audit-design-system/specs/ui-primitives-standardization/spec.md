## ADDED Requirements

### Requirement: Primitive component family
The application SHALL provide standardized primitives for primary actions, text inputs, cards/surface containers, and list row chrome, each using theme tokens for padding, radius, border color, and typography roles.

#### Scenario: Primary button appearance
- **WHEN** a primary action button is rendered
- **THEN** its height, corner radius, padding, label typography, and disabled/pressed styles SHALL match the shared primary button primitive or its theme-backed variant.

#### Scenario: Text field appearance
- **WHEN** a form text field is rendered
- **THEN** its height, internal padding, border radius, placeholder and label typography, and error border color SHALL use the shared input primitive and semantic tokens.

### Requirement: Minimum touch targets
Interactive elements (buttons, list rows with tap targets, steppers, chips) SHALL meet or exceed the platform-appropriate minimum touch target size (approximately 44x44 points) via component styles or hitSlop where documented.

#### Scenario: Compact list item remains tappable
- **WHEN** a list row shows secondary actions or controls
- **THEN** tappable areas SHALL meet the minimum target size or use an explicit `hitSlop` documented in the component.

### Requirement: State styling alignment
Primitives for buttons and inputs SHALL implement disabled, loading/pending, focused, error, and success visual treatments using semantic colors and spacing tokens only.

#### Scenario: Submit button during network call
- **WHEN** an async form submission is in progress
- **THEN** the button primitive SHALL show a pending state that matches design tokens and blocks duplicate submission.

### Requirement: Elevation and dividers
Cards, sheets, and inline dividers SHALL use shared shadow/elevation tokens and divider thickness/colors, not one-off shadows per screen.

#### Scenario: Card sits on surface background
- **WHEN** a card groups related content
- **THEN** elevation and border SHALL come from the card primitive or its theme-backed style object.
