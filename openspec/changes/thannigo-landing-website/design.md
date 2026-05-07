## Context

ThanniGo is a multi-role local commerce and delivery platform with a fully-built mobile app (React Native/Expo), Node.js backend, and MySQL + Redis data layer. The `website/` directory currently holds only a basic placeholder. The goal is to replace it with a single-file static marketing site that accurately reflects the platform's real, confirmed features and roles — suitable for public launch, investor review, and partner recruitment.

No build pipeline, framework, or Node.js tooling is needed; the output is a deployable static directory (`index.html`, `style.css`, `script.js`) that works from any CDN, GitHub Pages, or simple web server.

## Goals / Non-Goals

**Goals:**
- Produce a fully self-contained static landing site under `website/`
- Source all feature claims exclusively from confirmed backend services, models, and frontend screens
- Implement role-separated feature sections (Customer, Shop Owner, Delivery Partner, Admin)
- Apply glassmorphism + gradient design system with scroll-triggered animations
- Ensure full mobile/tablet/desktop responsiveness using CSS Grid and Flexbox
- Include SEO meta tags and OpenGraph tags
- Keep all internal architecture, API structure, and operational logic hidden — marketing language only

**Non-Goals:**
- No server-side rendering or build step required
- No integration with the live API or app
- No user authentication or dynamic content
- No CMS or content management layer
- No screenshots beyond what already exists in `website/assets/` or `website/images/`

## Decisions

**D1: Pure HTML/CSS/JS — no framework**
Rationale: A landing page has no state management needs. Shipping zero dependencies means instant load, zero build failures, and straightforward CDN deployment. React/Next.js would add unnecessary complexity and bundle weight for a static brochure page.

Alternatives considered: Next.js (overkill), Astro (adds build step with no clear benefit here).

**D2: Single `index.html` entry point with external `style.css` and `script.js`**
Rationale: Keeps the HTML readable, allows browser caching of CSS/JS separately, and matches the existing `website/` directory structure the user expects. Inlining everything into one file would make future edits painful.

**D3: CSS Custom Properties for the design system**
Rationale: A single `--color-primary`, `--gradient-hero`, `--font-heading` etc. token set makes global rebranding a one-file change. Avoids utility-class sprawl for a page this size.

**D4: Intersection Observer API for scroll animations**
Rationale: No external library dependency; native browser API with broad support. Replaces scroll event listeners which degrade performance on mobile.

**D5: Content security — marketing language only**
Rationale: The landing page must not expose route structures, event names, database schema, or operational logic. All feature descriptions are written at the benefit/capability level, not the implementation level.

## Risks / Trade-offs

- [Risk: Browser compatibility for CSS glassmorphism] → Mitigation: Use `backdrop-filter` with a solid fallback background color; gracefully degrades on older browsers.
- [Risk: Asset paths for screenshots] → Mitigation: Check `website/assets/` and `website/images/` at write time; use CSS gradient placeholder cards if no real screenshots are present.
- [Risk: Content staleness] → Mitigation: Feature list is derived from model and service file names at a point in time; a re-run of this change can refresh content when features are added.
- [Risk: SEO meta tags referencing real contact info] → Mitigation: Use discoverable project-level contact info only (e.g., domain placeholder); do not expose personal phone numbers or email addresses in OpenGraph tags.
