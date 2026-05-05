## MODIFIED Requirements

### Requirement: Screen State Completeness
Every data-driven React Native screen SHALL render explicit loading, success, empty, error, offline, retry, and crash-containment states appropriate to the user role and flow. Loading states SHALL use the `Skeleton` component; empty states SHALL use `EmptyState`; error states SHALL use a standardized error card with retry — all sourced from `components/ui/`.

#### Scenario: Screen is loading data
- **WHEN** a screen is waiting for initial API data
- **THEN** it displays the `Skeleton` component (not a spinner) matching the expected content layout, using `Colors.light.border` and `Colors.light.inputBg` for animation colors

#### Scenario: Screen has no records
- **WHEN** an API returns an empty result set
- **THEN** the screen displays the `EmptyState` component from `components/ui/EmptyState.tsx` with a role-appropriate message, icon, and optional call-to-action button using the role accent color

#### Scenario: Screen request fails
- **WHEN** an API or network request fails
- **THEN** the screen displays a user-friendly error message using `Colors.error` and a retry button using `Button variant="outline"`; no raw error objects or stack traces are shown to the user

### Requirement: Async Action Feedback
Every async button action SHALL prevent duplicate submission and expose clear pending, success, validation error, API error, and network failure feedback via UI states and `AppToast`. The `Button` component's `isLoading` prop SHALL be used for all async actions.

#### Scenario: Button action is triggered
- **WHEN** the user triggers an async action (e.g., login, payment, profile update)
- **THEN** the `Button` enters `isLoading` state, the `onPress` handler is debounced/guarded against duplicate calls, and a success or error `AppToast` is shown upon completion

#### Scenario: Invalid input is submitted
- **WHEN** a form contains invalid values
- **THEN** inline validation messages appear using `FormErrorMessage` from `components/form/` and no API request is sent

### Requirement: User-Friendly Visual Consistency
The mobile UI SHALL reuse design tokens and existing components to provide attractive, responsive, role-aware screens without inconsistent spacing, unreadable text, or overlapping content. All screens SHALL pass a visual review on both 375px (small) and 428px (standard) viewport widths.

#### Scenario: Screen renders on small device
- **WHEN** a critical screen is viewed on a 375px viewport
- **THEN** buttons, labels, cards, lists, and error messages remain readable, do not overflow, and do not overlap

#### Scenario: Screen renders on large device
- **WHEN** a critical screen is viewed on a 428px or wider viewport
- **THEN** layout expands gracefully using `flex: 1` and percentage widths; no content is clipped

#### Scenario: Role-specific flow is shown
- **WHEN** a customer, shop owner, delivery person, or admin opens their screen group
- **THEN** navigation header uses the role gradient, action buttons use the role accent color from `roleAccent`, and empty/error state messaging matches the role's workflow context
