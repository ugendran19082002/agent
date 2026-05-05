## ADDED Requirements

### Requirement: Curated place rows are stored with searchable metadata

The system SHALL persist curated places with human-readable **name**, WGS‑84 **latitude** and **longitude**, optional **aliases/keywords**, optional **normalized search blob**, and timestamps. Keywords SHALL support synonym and common-misspelling phrases supplied by operators or validated imports.

#### Scenario: Store landmark with synonyms

- **WHEN** an operator creates a curated place named "Webhike Solutions" with keywords `["webhike","web hike"]` and valid coordinates inside the configured service geography
- **THEN** the system stores one row associating those keywords with the coordinates and exposes them to the search engine indexer

### Requirement: Efficient lookup for autocomplete-scale queries

The system SHALL match catalog rows using case-insensitive substring or full-text compatible patterns on **name + keywords**, returning candidate rows within bounded query cost (indexed columns or constrained scan). Matching SHALL tolerate Unicode normalization equivalent to NFC for stored and incoming text.

#### Scenario: Keyword match returns curated hit first-stage

- **WHEN** a search request uses query text `web hike` against the catalog index
- **THEN** matching rows that include alias `web hike` MUST be returned among catalog candidates unless administratively deactivated

### Requirement: Optional ingestion of confirmed user resolutions

The system SHALL support recording user-confirmed geographic resolutions as **candidate** curated entries or append-only telemetry for later promotion, gated by retention policy flags. Rows promoted to authoritative catalog MUST pass validation (unique key, sane coordinates, moderator approval if moderation is enabled).

#### Scenario: User-confirmed POI queued for moderation

- **WHEN** a client submits a structured "confirm placement" payload after the user selects a Photon result whose confidence is eligible for learning AND moderation mode is enabled
- **THEN** the system stores a moderation queue item referencing source, provisional name, coordinates, and request trace id without immediately trusting it as production catalog truth
