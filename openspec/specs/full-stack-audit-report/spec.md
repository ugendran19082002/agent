## ADDED Requirements

### Requirement: Complete Audit Register
The system audit SHALL produce a structured register covering all major frontend, backend, database, payment, configuration, and deployment files without omitting role-specific app areas.

#### Scenario: Major files are inventoried
- **WHEN** the audit is performed
- **THEN** the report lists reviewed file groups for `frontend/app/**`, `frontend/api/**`, `frontend/components/**`, `frontend/stores/**`, `frontend/providers/**`, `backend/src/routes/**`, `backend/src/controllers/**`, `backend/src/services/**`, `backend/src/model/**`, `backend/src/config/**`, `backend/src/middleware/**`, `backend/src/validations/**`, payment files, database scripts, and production config files

#### Scenario: Finding has actionable details
- **WHEN** the audit identifies an issue
- **THEN** the finding includes severity, affected files, problem description, exact fix, best-practice rationale, user impact, and verification method

### Requirement: Reusability And Structure Assessment
The audit SHALL identify duplicate logic, overly large files, inconsistent patterns, and opportunities to reuse existing architecture before proposing new abstractions.

#### Scenario: Duplicate frontend logic is found
- **WHEN** two or more screens duplicate API call, validation, loading, empty, or toast logic
- **THEN** the audit recommends a shared hook, API helper, UI primitive, or store pattern using the existing frontend architecture

#### Scenario: Duplicate backend logic is found
- **WHEN** controllers or services duplicate validation, authorization, pagination, response, or transaction handling
- **THEN** the audit recommends a shared middleware, validator, service helper, or utility using the existing backend architecture

### Requirement: Success And Failure Scenario Matrix
The audit SHALL document success and failure scenarios for critical auth, order, delivery, payment, shop, admin, support, and profile flows.

#### Scenario: Critical flow is reviewed
- **WHEN** the audit reviews a critical flow
- **THEN** the report includes expected success behavior, API failure behavior, network failure behavior, invalid input behavior, retry behavior, and user-facing message behavior

#### Scenario: Scenario coverage gap is found
- **WHEN** a flow does not handle a required failure state
- **THEN** the audit marks the gap with an exact UI or backend fix and a verification step
