## Context

ThanniGo already ships Mapbox natively (`@rnmapbox/maps`) and client-side helpers (`frontend/api/mapboxApi.ts`) that combine Mapbox Geocoding with Nominatim fallback. Discovery quality, ranking, and “local landmark” fidelity are inconsistent when everything depends on third-party autocomplete. OpenStreetMap data is strong for coverage; **Photon** (Komoot-hosted or self-hosted) exposes OSM-backed search tuned for autocomplete. **Mapbox** remains best-in-class for map rendering—not necessarily as the lone source of POI truth.

Constraints: maintain existing JWT/app security patterns on the backend; MySQL/SQL parity with current stack; observability compatible with existing logging; minimize extra mobile binary surface (no new native SDK requirement).

## Goals / Non-Goals

**Goals:**

- Backend **unified location search**: local curated catalog → optional Photon augmentation → deterministic merge/dedupe → scored ranking returning a stable JSON contract for mobile/web.
- **Geo bias**: default service-area bias (configurable centroid, e.g. Chennai) applied to Photon and usable in proximity scoring for catalog rows.
- **Accuracy growth**: capture user-confirmed resolutions (privacy-safe) into catalog or shadow table for moderation/import.
- **Resilience**: bounded latency, timeouts, circuit-break/light degradation (catalog-only).

**Non-Goals:**

- Replacing Map tile rendering or directions stack.
- Replacing SOS/emergency geo flows without separate review.
- Building a full Photon self-host playbook in prod (may document as optional appendix only).

## Decisions

| Decision | Rationale | Alternatives considered |
|----------|-----------|-------------------------|
| Backend-first orchestration | One ranking policy, auditing, caching, rate limits—not per-client divergence. | Client-only Photon (rejected: secret keys not needed but logic duplication, weak governance). |
| Photon over raw Nominatim for augmentation | Photon is autocomplete-oriented and lighter to integrate for “typeahead” bursts. | Nominatim only (acceptable fallback tier if Photon unreachable—document-only or secondary adapter). |
| MySQL relational catalog | Matches existing infra; GIS optional—start with `DECIMAL(lat,lng)` + fulltext on name/keywords JSON. | Mongo (rejected for ops divergence). PostGIS later if polygon filters needed. |
| Threshold trigger `local.length < K` (`K≈3`) | Matches product guidance; avoids over-calling Photon when catalog is dense. Fixed `K` env-configurable. | Always merge (costly); never merge (loses recall). |
| Ranking as explicit additive scores | Explainable QA and tuning vs. opaque ML. Tunable constants in config/feature flags. | Learn-to-rank (deferred complexity). |
| Dedupe keys | Normalize name (NFKC/lowercase strip), round coordinates (~5 decimals), temporal merge window. Adapters map Photon GeoJSON Features into common DTO before dedupe. | No dedupe (bad UX duplicates). |

**Response DTO sketch (conceptual):** `{ results: [{ id, source: 'catalog'|'photon', name, lat, lng, score, attribution }], meta: { degraded: boolean } }`

## Risks / Trade-offs

- **Photon public SPOF / fairness use** → Mitigation: timeout + retry-once + catalog-only degraded mode; configure self-hosted Photon URL for prod if policy requires.
- **Catalog poisoning via “save selection”** → Mitigation: require moderation queue or automated caps; store as `pending` until approved.
- **Latency stack-up (DB + Photon)** → Parallel only where safe (otherwise sequential per policy); caching short-TTL keyed by normalized query + bias grid.
- **Licensing/OSM attribution** → Mitigation: OSM license strings in UI for Photon-derived hits; documented in API contract.

## Migration Plan

1. Ship DB migrations + backend route behind **`LOCATION_UNIFIED_SEARCH_ENABLED`** default off.
2. Mobile: toggle one screen (addresses / search-map) to new API behind remote flag or env.
3. Measure error rate/latency; ramp flag.
4. Rollback: disable flag — clients revert to prior geocode path (`mapboxApi` standalone).

## Open Questions

- Exact tenancy model: platform-wide catalog vs `shop_id`/city partition columns?
- PII retention window for logged queries and saved selections (align with privacy policy)?
- Admin UI for curated rows vs CSV import-only for MVP?
