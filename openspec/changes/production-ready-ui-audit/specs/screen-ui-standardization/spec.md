## ADDED Requirements

### Requirement: Auth Screen Visual Hierarchy
All screens in `app/auth/` SHALL follow a consistent visual structure: gradient header with logo, role-labeled input section, primary CTA button at bottom, and secondary/link actions below.

#### Scenario: Login screen renders
- **WHEN** the login screen is displayed
- **THEN** the gradient uses `roleGradients[role]`, the phone input uses `AppTextInput`, the submit button uses `Button` with `size="lg"`, and there are no inline style hex values

#### Scenario: OTP screen renders
- **WHEN** the OTP screen is displayed
- **THEN** digit inputs have consistent sizing from theme tokens, the resend timer uses `Colors.muted`, and the submit CTA uses the same `Button` component as login

### Requirement: Customer Screen Consistency
All screens in `app/(customer)/` and customer-prefixed screens SHALL use theme tokens, `ScreenContainer`, `Card`, and role-specific accent (`#1565C0` customer blue) for all interactive and branded elements.

#### Scenario: Customer home renders a shop card
- **WHEN** the customer home screen loads shop listings
- **THEN** `CustomerHomeShopCard` uses `Card` for the container, `Shadow.sm` for elevation, `Spacing.md` for internal padding, and shows a loading skeleton while data loads

#### Scenario: Checkout screen payment section
- **WHEN** the checkout screen is displayed
- **THEN** all section headers use `Typography.h4`, item rows use `Typography.body`, the pay button uses `Button size="lg"`, and the bill breakdown uses `Spacing.sm` between line items

### Requirement: Shop Owner Screen Consistency
All screens in `app/shop/` and `app/(shop)/` SHALL use the shop teal accent (`#006878`) for action buttons, section headers, and status badges, sourced from theme tokens.

#### Scenario: Shop order list renders
- **WHEN** a shop owner views their orders
- **THEN** status badges use `Badge` component with semantic colors (success/warning/error) from `Colors.light`, order cards use `Card`, and list items use `Spacing.sm` vertical gap

#### Scenario: Shop owner empty order state
- **WHEN** a shop owner has no orders
- **THEN** the `EmptyState` component is displayed with shop-appropriate messaging and a teal-accented CTA

### Requirement: Delivery Screen Consistency
All screens in `app/delivery/` SHALL use the delivery green accent (`#2e7d32`) for action states, active task indicators, and earnings displays, sourced from theme tokens.

#### Scenario: Delivery task card renders
- **WHEN** a delivery agent views their active task
- **THEN** `DeliveryTripCard` uses green accent for status, `Typography.bodyMedium` for the order title, and `Spacing.md` padding — no hardcoded values

#### Scenario: Earnings screen displays stats
- **WHEN** a delivery agent views their earnings
- **THEN** `StatCard` components are used for summary figures, with `Typography.h2` for amounts and `Colors.success` for positive values

### Requirement: Admin Screen Consistency
All screens in `app/admin/` SHALL use the admin red accent (`#ba1a1a`) for critical action buttons and status alerts, sourced from theme tokens. Data tables and lists SHALL use `Spacing.sm` row gaps and `Typography.label` for column headers.

#### Scenario: Admin orders list renders
- **WHEN** an admin views the orders list
- **THEN** each row uses consistent `Spacing.sm` vertical padding, status indicators use semantic badge colors, and the list uses `FlashList` or `FlatList` with `getItemLayout` for performance

#### Scenario: Admin error log detail renders
- **WHEN** an admin views an error log entry
- **THEN** the error message uses `Typography.body`, the stack trace uses a monospace font, severity is indicated by a color badge from theme tokens, and there are no hardcoded colors

### Requirement: Help & Support Screen Consistency
All screens in `app/help/` SHALL present a calm, neutral visual style: `Colors.background` surface, no role accent, `Typography.h4` section titles, and `Card` for FAQ/ticket items.

#### Scenario: Help index screen renders
- **WHEN** a user opens the help center
- **THEN** topic cards use `Card` component, icons use `Colors.primary`, and text uses `Typography.body` — consistent with all other help screens

### Requirement: No Per-Screen Redundant StyleSheet Objects
Each screen SHALL NOT define StyleSheet entries that duplicate logic already covered by shared components (`ScreenContainer`, `Card`, `Button`, `PageHeader`). Local styles SHALL only cover screen-specific layout not expressible via props.

#### Scenario: StyleSheet audit on a refactored screen
- **WHEN** a refactored screen's StyleSheet is inspected
- **THEN** it contains no `backgroundColor: '#hex'`, `borderRadius: <number>`, or `padding: <number>` entries that duplicate theme token values
