## ADDED Requirements

### Requirement: Admin dashboard with 9 stat cards
The Admin Dashboard SHALL display 9 summary cards, each tapping through to the relevant management list or report.

#### Scenario: Admin views dashboard
- **WHEN** an admin logs in and views the dashboard
- **THEN** the system SHALL display cards for: Pending Applications (count), Pending Re-submissions (count), Approved Shops (total), Active Coupons (count), Open Complaints (count), Refund Abuse Users (count, 30-day window), COD Blocked Users (count), Failed Deliveries (today/this week), Shop Rejection % (this week)

#### Scenario: Admin taps a dashboard card
- **WHEN** an admin taps any stat card
- **THEN** the system SHALL navigate to the corresponding management screen or report

### Requirement: Shop list with filters and tabular view
The Admin SHALL be able to filter and browse all shop applications by status, business category, date range, and search by shop name or owner phone.

#### Scenario: Admin filters by status
- **WHEN** an admin selects a status filter (All / Pending / Under Review / Pending Re-submission / Approved)
- **THEN** the shop list SHALL update to show only shops matching the selected status

#### Scenario: Admin searches by shop name or phone
- **WHEN** an admin types in the search field
- **THEN** the list SHALL filter in real time to match shops by name or owner phone number

### Requirement: Step-wise shop approval with mandatory rejection remarks
Admin SHALL review each of the 4 onboarding steps independently in a tabbed layout. Every step must be explicitly approved or rejected. Rejection requires a written remark (min 10 chars). Approved steps cannot be re-edited by the shop owner.

#### Scenario: Admin approves all 4 steps
- **WHEN** the admin approves all 4 steps for a shop
- **THEN** the system SHALL set shop status to Approved and notify the shop owner via push + Brevo email

#### Scenario: Admin rejects a step without a remark
- **WHEN** the admin attempts to submit a rejection without providing a remark
- **THEN** the system SHALL log ADMIN0001 and display "Rejection reason is required (min 10 chars)."

#### Scenario: Admin rejects a step with a valid remark
- **WHEN** the admin submits a rejection with a remark of at least 10 characters
- **THEN** the system SHALL unlock only that step for the shop owner to re-submit; all approved steps remain locked

#### Scenario: Admin approves an already-approved step
- **WHEN** the admin attempts to approve a step that is already approved
- **THEN** the system SHALL log ADMIN0002 and silently ignore the duplicate action

#### Scenario: Network error during approve/reject submit
- **WHEN** the network request for the approve/reject action fails
- **THEN** the system SHALL log ADMIN0003, show an error toast, and not record the action; the admin must retry

#### Scenario: Shop approval push/email notification fails
- **WHEN** the system fails to send the approval push or email to the shop owner
- **THEN** the system SHALL log ADMIN0007 and alert the admin of the notification failure

### Requirement: System Settings management (17 configurable values)
Admin SHALL be able to view and edit all platform-wide system settings from a dedicated screen.

#### Scenario: Admin updates a system setting
- **WHEN** an admin submits a new value for any system setting
- **THEN** the system SHALL persist the value to the `system_settings` table and use the new value for all subsequent operations

#### Scenario: System settings are applied platform-wide
- **WHEN** any setting such as `deposit_20l`, `deposit_10l`, `cod_block_threshold`, `order_accept_timeout`, `pending_can_warning_threshold`, or `pending_can_block_threshold` is updated by Admin
- **THEN** all subsequent business logic operations SHALL read the updated value without requiring a server restart

### Requirement: Platform coupon management
Admin SHALL create platform coupons (flat ₹ or percentage) targeting all customers, selected customers, or individual customers. Platform absorbs the discount; the shop receives the full original order amount.

#### Scenario: Admin creates a valid platform coupon
- **WHEN** the admin submits a coupon with a unique alphanumeric code (4–20 chars), a future expiry date, and a valid discount type and value
- **THEN** the system SHALL persist the coupon with `issuer_type = admin` and make it available for customer use

#### Scenario: Duplicate coupon code submitted
- **WHEN** admin submits a coupon code that already exists in the system
- **THEN** the system SHALL log CPN0005 and display a code-conflict error

#### Scenario: Coupon creation fails due to DB error
- **WHEN** the database write fails during coupon creation
- **THEN** the system SHALL log ADMIN0006 and display "Coupon save to DB failed. Please try again."

### Requirement: Complaint queue and resolution
Admin SHALL view all open complaints, mark them In Review, and resolve them with a resolution note. All roles (Customer, Shop Owner, Delivery Person) can raise complaints, but Admin is the sole resolver.

#### Scenario: Admin views open complaints
- **WHEN** an admin views the complaint queue
- **THEN** the system SHALL display all complaints with status Open, with the complainant role, category, and submission date

#### Scenario: Admin marks complaint In Review
- **WHEN** an admin opens a complaint
- **THEN** the complaint status SHALL change to In Review (COMP0003 logged)

#### Scenario: Admin resolves a complaint
- **WHEN** an admin submits a resolution note and marks the complaint as Resolved
- **THEN** the system SHALL log COMP0004, update the complaint status to Resolved, and notify the complainant via push + Brevo email

#### Scenario: Resolution notification fails
- **WHEN** the push or email notification fails after complaint resolution
- **THEN** the system SHALL log COMP0005 and record the failure without reversing the resolution
