## 1. Catalog data model & persistence

- [x] 1.1 Add Sequelize model(s) / migration(s) for curated places (`name`, `lat`, `lng`, `keywords` JSON/array, activation flags, optional `tenant`/`city` columns per design decision).
- [x] 1.2 Create DB indexes suited to lookup (composite on active flag + full-text or prefix index strategy documented in migration comments).
- [x] 1.3 Seed/import path: minimal admin CSV import script OR guarded SQL seed fixture for QA landmarks.

## 2. Catalog search service

- [x] 2.1 Implement case-insensitive name + keyword query with normalization (NFC lowercase trim) capped by row limit.
- [x] 2.2 Implement optional moderation queue entity + API sketch for confirmed user placements (defer UI if flagged out-of-scope).

## 3. Photon adapter & resilience

- [x] 3.1 Add HTTPS client wrapping Photon (`GET /api/` ) with configurable `PHOTON_BASE_URL`, timeouts, max redirect guard, typed response mapping to canonical DTO.
- [x] 3.2 Map bias `lat`/`lon` query params using request override → server default centroid → optional user GPS (if forwarded safely).
- [x] 3.3 Classify failures (timeout/DNS/4xx/5xx) → structured logs + degraded path without crashing request cycle.

## 4. Ranking, merge, dedupe engine

- [x] 4.1 Normalize candidates to `{ id?, source, name, lat, lng, raw?, scoreBreakdown }` structure shared across layers.
- [x] 4.2 Implement dedupe passes (normalized title equality + configurable haversine distance threshold).
- [x] 4.3 Implement deterministic scoring tiers (exact, keyword/substring, distance-to-bias, source bonus per design table) plus tie-breakers.
- [x] 4.4 Unit tests covering merge edge cases (catalog+photon duplicates, degraded-only catalog, entirely empty catalog).

## 5. REST API surface

- [x] 5.1 Register authenticated route (`GET /api/v1/search/places` or agreed path) enforcing role policy (reuse existing mobile auth patterns).
- [x] 5.2 Validate query params (`q`, `limit` bounds, coordinate ranges) → 422 on abuse per spec scenario.
- [x] 5.3 Attach rate limiting / throttle hook consistent with neighbouring public-ish endpoints.

## 6. Frontend integration & Mapbox UX

- [x] 6.1 Add typed API helper calling unified endpoint; map response into existing map picker / address autocomplete components behind feature flag.
- [x] 6.2 Ensure Mapbox map shows markers + camera focus on highlighted top result (`ExpoMap` / relevant screen).
- [x] 6.3 Provide OSM attribution string on UI when any result row `source===photon` (linkless text acceptable if styling constrained).

## 7. Observability & rollout

- [x] 7.1 Emit structured counters/logs: `catalog_count`, `photon_called`, `latency_ms`, `degraded_flag`.
- [x] 7.2 Document env vars (`LOCATION_UNIFIED_SEARCH_ENABLED`, Photon URL, biases, thresholds) for deployment runbooks.

## 8. Verification gates

- [x] 8.1 Contract test: mocked Photon determinism fixtures in Jest regression suite for ranking snapshot.
- [x] 8.2 Manual QA script: Chennai bias spot-check + rare query hybrid path + catalog-only degraded toggle.
