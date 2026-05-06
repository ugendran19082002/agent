## ADDED Requirements

### Requirement: Complete UI file enumeration
The implementation SHALL maintain a documented list of **all** UI-related source files in the mobile project (`frontend/app/`, `frontend/components/`, `frontend/styles/`, theme constants, and layout-related hooks as defined in the change design) such that no file is omitted without an explicit **exempt** classification and reason.

#### Scenario: Auditor verifies coverage
- **WHEN** the audit register is reviewed for completeness
- **THEN** every non-exempt file path from the enumeration SHALL appear exactly once with a recorded review status.

### Requirement: File-wise issue register
For each reviewed file, the audit SHALL record identified defects using at least these categories where applicable: spacing, typography, color tokens, layout/responsiveness, safe area/scroll, duplication, unused styles, and list performance (inline styles).

#### Scenario: Issue is discovered in a component
- **WHEN** a reviewer finds a non-token spacing literal or overflow bug in a listed file
- **THEN** the register SHALL include that file with at least one categorized issue before the change is considered complete for that slice.

### Requirement: Screen-wise top-to-bottom review
For each route-level screen, the audit SHALL document the header region, primary body content, scrollable or list regions, primary actions, and footer/sticky areas with notes on spacing and alignment sufficient for another developer to reproduce fixes.

#### Scenario: Tab or stack screen is audited
- **WHEN** a route under `frontend/app/` is marked audited
- **THEN** the screen-wise notes SHALL identify the main vertical sections and any known imbalance between them.

### Requirement: End-to-end audit sign-off
The change SHALL NOT be closed until the audit register shows **fixed** or **exempt** for every enumerated file, or an explicit follow-up change ID is recorded for outstanding items.

#### Scenario: Project lead closes the effort
- **WHEN** stakeholders declare the exhaustive audit complete
- **THEN** the register SHALL contain no file in perpetual “not reviewed” state without a mitigation plan.
