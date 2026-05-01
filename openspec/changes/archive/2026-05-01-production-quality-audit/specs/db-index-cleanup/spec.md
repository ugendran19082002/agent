## ADDED Requirements

### Requirement: Automated Duplicate Index Removal
The system SHALL provide a migration script that identifies and removes redundant non-unique indexes.

#### Scenario: Execution of Cleanup Script
- **WHEN** the cleanup script is run
- **THEN** it SHALL leave exactly one index per indexed column(s) and remove all other identical duplicates

### Requirement: Data Integrity Protection
The index cleanup SHALL NOT remove unique constraints or primary keys.

#### Scenario: Protected Index Check
- **WHEN** the script encounters a duplicate unique index
- **THEN** it SHALL ensure at least one unique constraint remains active for that column set
