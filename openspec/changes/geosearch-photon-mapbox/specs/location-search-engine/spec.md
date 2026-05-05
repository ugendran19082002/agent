## ADDED Requirements

### Requirement: Unified search endpoint orchestrates catalog then Photon

The system SHALL expose an authenticated HTTP search endpoint accepting `q`, optional **`limit`**, optional **bias latitude/longitude**, and optional **`minCatalogBeforePhoton`** semantics via server configuration defaults. Execution SHALL retrieve catalog matches first and call the Photon-compatible HTTP JSON API only when fewer than **`K`** catalog results are returned (**`K`** configured, default aligned with product guideline of three unless overridden by deployment).

#### Scenario: Photon supplements thin catalog hits

- **WHEN** a client queries `q=RareShopNameXYZ` resulting in fewer than **`K`** catalog matches
- **THEN** the system performs a Photon request including bias parameters derived from caller bias or deployment default centroid and merges Photon features into the unified candidate pool before ranking

### Requirement: Deterministic merge, dedupe, and ranking pipeline

The system SHALL normalize candidate places to a canonical DTO, remove duplicates using name similarity after Unicode normalization plus coordinate clustering within a configurable distance threshold, and assign a **composite integer score**. Scoring MUST add non-negative boosts for catalog origin, exact token equality on primary name or keyword, substring coverage, Photon-only partial matches, and proximity to bias point; exact tie-break MUST use deterministic secondary keys (creation time descending, lexical id).

#### Scenario: Duplicate OSM/catalog entries collapse

- **WHEN** the merged pool contains two candidates whose normalized titles match and geographic distance is ≤ configured meters
- **THEN** exactly one survives post-dedupe and scoring reflects merged provenance prioritizing authoritative catalog-backed fields where present

### Requirement: Photon integration hardening

The Photon client MUST enforce connect/read timeouts, a maximum concurrency cap per instance, exponential backoff-compatible single retry classification, structured logging of outbound failures with correlation identifiers, and a safe degraded catalog-only completion path flagged in response metadata instead of opaque 500 responses when Photon is unreachable.

#### Scenario: Photon timeout yields degraded structured response

- **WHEN** Photon exceeds configured read timeout
- **THEN** the endpoint returns catalog-only results plus `meta.degraded=true` and HTTP 200 if at least catalog matches exist otherwise returns empty success with degraded flag consistent with documented contract

### Requirement: Operational guardrails

The endpoint SHALL integrate with existing Express rate-limiting or equivalent throttle for anonymous abuse surfaces, sanitize and cap `limit` bounds, refuse queries longer than configurable character limits, reject invalid coordinates ranges, and emit metrics counters for `{catalog_hit,photon_called,latency_ms,failure_class}` hooks compatible with backend logging pipelines.

#### Scenario: Oversized abusive query rejected

- **WHEN** a client sends query text exceeding configured maximum characters
- **THEN** the system responds with validation error envelope and DOES NOT call Photon
