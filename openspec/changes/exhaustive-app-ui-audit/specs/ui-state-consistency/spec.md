## ADDED Requirements

### Requirement: State surfaces included in exhaustive audit
Loading, empty, error, offline, and maintenance presentations SHALL be listed and reviewed in the same audit register as primary success UI, with defects categorized under spacing, typography, colors, and primitives consistency.

#### Scenario: Screen shows loading then empty
- **WHEN** the register marks a data-driven screen as audited
- **THEN** entries SHALL exist for the loading and empty presentations (or a justified shared pattern) showing token compliance.

#### Scenario: Error surface with retry
- **WHEN** a screen displays a recoverable error state
- **THEN** the audit notes SHALL confirm retry actions use the same button primitives and semantic colors as the rest of the flow.
