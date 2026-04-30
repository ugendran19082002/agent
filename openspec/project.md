# Project

## Purpose
Static website project. Delivers web pages styled exclusively through Tailwind CSS utility classes processed at runtime in the browser.

## Tech Stack
- **Language:** JavaScript
- **Styling framework:** Tailwind CSS (browser CDN runtime — `tailwind.min.js`)
- **Deployment model:** Static (no server-side rendering or build step inferred)

## Architecture Style
Static frontend — single-layer presentation with no inferred backend.

## Key Modules
- [`website`](specs/modules/website.md) — the website frontend, containing static assets

## Constraints
- No backend, API layer, or database is present in the analysed structure
- Tailwind CSS runs entirely in the browser via the CDN runtime; no PostCSS/build pipeline is visible
- All styling decisions are expressed through HTML class attributes rather than authored CSS
