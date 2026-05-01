## ADDED Requirements

### Requirement: Screen State Completeness
Every data-driven React Native screen SHALL render explicit loading, success, empty, error, offline, retry, and crash-containment states appropriate to the user role and flow.

#### Scenario: Screen is loading data
- **WHEN** a screen is waiting for initial API data
- **THEN** it displays a reusable `Skeleton` loader or loading indicator instead of a blank view.

#### Scenario: Screen has no records
- **WHEN** an API returns an empty result set
- **THEN** the screen displays the `EmptyState.tsx` component with a relevant message and call-to-action.

#### Scenario: Screen request fails
- **WHEN** an API or network request fails
- **THEN** the screen displays a user-friendly error state with retry behavior where retry is safe.

### Requirement: Async Action Feedback
Every async button action SHALL prevent duplicate submission and expose clear pending, success, validation error, API error, and network failure feedback via UI states and `AppToast`.

#### Scenario: Button action is triggered
- **WHEN** the user triggers an async action (e.g., login, payment, profile update)
- **THEN** the action element enters a submitting state, duplicate triggers are ignored, and a success or error toast is shown upon completion.

#### Scenario: Invalid input is submitted
- **WHEN** a form contains invalid values
- **THEN** inline validation messages are shown and no unsafe API request is sent.

### Requirement: User-Friendly Visual Consistency
The mobile UI SHALL reuse design tokens and existing components to provide attractive, responsive, role-aware screens without inconsistent spacing, unreadable text, or overlapping content.

#### Scenario: Screen renders on small device
- **WHEN** a critical screen is viewed on a small mobile viewport
- **THEN** buttons, labels, cards, lists, and error messages remain readable and do not overlap.

#### Scenario: Role-specific flow is shown
- **WHEN** a customer, shop owner, delivery person, or admin opens their screen group
- **THEN** navigation, actions, empty states, and wording match that role's expected workflow.
