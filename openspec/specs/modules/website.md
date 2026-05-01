# Module: website

## Responsibility
Static marketing site for the platform. Delivers branded landing pages to web browsers with no server-side rendering or build pipeline.

## Key Components
| Component | Path | Kind | Role |
|---|---|---|---|
| Landing page | `website/index.html` | HTML | Primary entry point served to visitors |
| Tailwind runtime | `website/assets/js/tailwind.min.js` | JavaScript bundle | CSS utility engine; processes DOM class names and injects styles at runtime |

## Dependencies
- **External:** None at runtime — the Tailwind CDN runtime is self-contained
- **Build-time:** None (no bundler or PostCSS pipeline)

## Notes
- All styling is expressed through Tailwind utility classes in HTML attributes
- The Tailwind runtime runs entirely in the browser; no build step is required
- No application JavaScript beyond the Tailwind runtime is present
