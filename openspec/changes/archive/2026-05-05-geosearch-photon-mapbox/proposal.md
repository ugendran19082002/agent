## Why

The product needs reliable place and address discovery without relying on Google as the primary upstream. Today geocoding is scattered (e.g., Mapbox + Nominatim on the client), which limits control over ranking, local landmark accuracy, and consistent behavior across tenants. Centralizing search behind a three-layer pipeline—curated local data first, Photon (OpenStreetMap) for breadth, Mapbox strictly for maps and UX—addresses accuracy, licensing flexibility, and a path to Swiggy-style relevance.

## What Changes

- Add a **unified backend search API** that queries a **local places/keywords catalog** first, merges **Photon/Komoot** results when coverage is insufficient, deduplicates, and **ranks** with explicit scoring rules (exact name, keywords, substring, geographic proximity bias).
- Introduce persistence for **curated places** (name, coordinates, synonyms/keywords, optional region/tenant binding) plus optional **recording of resolved user selections** to grow accuracy over time.
- Add **Photon HTTP client** with configurable base URL, timeouts, limits, `lat/lon` bias (e.g., Chennai/default service area), and rate/circuit safeguards.
- **Frontend**: route address/place search UX through the new API where appropriate (keep Mapbox for map rendering, camera, markers, highlighting); reduce or isolate direct Mapbox Geocoding for flows covered by unified search (**BREAKING** for callers that depended on client-only Mapbox search behavior—mitigate behind feature flag during rollout).

## Capabilities

### New Capabilities

- `places-catalog`: Curated POI/partner/landmark rows, keywords and synonym strategy, fuzzy matching boundaries, indexing, and lifecycle (admin seed/import vs. user-learned rows).
- `location-search-engine`: Backend unified search endpoint(s), Photon integration, merge/dedupe rules, ranking contract, bias parameters, observability, and abuse limits.

### Modified Capabilities

- _(none)_ — no existing OpenSpec capability formally defines unified location search; implementation will touch `frontend/api/mapboxApi.ts`, address flows, and new backend modules without changing a published spec name until this change lands.

## Impact

- **Backend**: New routes (e.g., under `/api/v1/...`), services, models/migrations for places catalog, env config (`PHOTON_BASE_URL`, default bias coordinates, feature flags), possible Redis cache for hot queries.
- **Frontend**: `mapboxApi.ts` / `addresses.tsx` (and any search-map flows) to call backend search; Mapbox remains for map display and selection affordances.
- **Dependencies**: Outbound HTTPS to `photon.komoot.io` (or self-hosted Photon); existing `@rnmapbox/maps` and Mapbox tokens unchanged for rendering.
- **Ops**: Rate limits, logging of external calls, fallback behavior when Photon is down (local-only or degraded list).
