## ADDED Requirements

### Requirement: Consistent Loading States
Every data-fetching screen SHALL display a `Skeleton` loader while data is being retrieved.

#### Scenario: Screen Initial Load
- **WHEN** a user navigates to a screen that fetches data from an API
- **THEN** the screen SHALL display a skeleton representation of the expected content until the data arrives

### Requirement: Empty State Handling
Every list or data-driven view SHALL display an `EmptyState` component when zero results are returned.

#### Scenario: Empty Data Set
- **WHEN** an API returns an empty list for a screen
- **THEN** the screen SHALL display the `EmptyState.tsx` component with a relevant message and call-to-action

### Requirement: Action Feedback Toasts
Every async user action (e.g., updating profile, placing order) SHALL display success or error toasts.

#### Scenario: Profile Update Success
- **WHEN** a user successfully updates their profile
- **THEN** the system SHALL display a success toast via `AppToast`
