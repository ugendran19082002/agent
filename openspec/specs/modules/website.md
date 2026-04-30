# Module: website

## Responsibility
Hosts all static assets for the website, including the Tailwind CSS runtime. Acts as the single presentation module — serves HTML to browsers and delegates styling to the bundled Tailwind runtime.

## Key Components
| Component | Path | Kind | Role |
|-----------|------|------|------|
| Tailwind runtime | `website/assets/js/tailwind.min.js` | JavaScript bundle | CSS utility engine; processes DOM class names and injects styles |

## Internal Structure
- `website/assets/js/` — JavaScript assets
  - `tailwind.min.js` — 947 symbols (442 functions, 505 methods); all are internal to the Tailwind engine

## Dependencies
- **External:** None at runtime; Tailwind runtime is fully self-contained
- **Build-time:** None inferred (CDN/runtime mode; no bundler configuration present)

## Notes
- No application JavaScript beyond the Tailwind runtime is present in the analysed structure
- HTML source files are not included in `structure.json`; they are assumed to exist alongside the JS asset
- Future application code added to this module should be placed under `website/assets/js/` (or a sibling directory) to follow existing conventions
