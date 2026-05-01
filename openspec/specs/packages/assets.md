# Package: assets

## Path
`website/assets/`

## Responsibility
Delivers static client-side assets to the browser for the marketing website.

## Components
| File | Language | Role |
|---|---|---|
| `js/tailwind.min.js` | JavaScript | Tailwind CSS browser runtime — parses utility classes and injects styles |

## Dependencies
- **Runtime:** None — self-contained bundle
- **Consumers:** HTML files in `website/` that load `tailwind.min.js` via `<script>` tag
