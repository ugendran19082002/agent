# Package: assets

## Path
`website/assets/`

## Responsibility
Delivers static client-side assets to the browser. Currently contains only the Tailwind CSS JavaScript runtime.

## Components
| File | Language | Symbols | Role |
|------|----------|---------|------|
| `js/tailwind.min.js` | JavaScript | 947 (442 functions, 505 methods) | Tailwind CSS browser runtime |

### tailwind.min.js — Internal Symbol Groups (inferred)
All symbols are minified and belong to the Tailwind CSS engine. Logical responsibilities inferred from symbol count and distribution:
- **Class parsing** — tokenises utility class strings from the DOM
- **Rule generation** — maps tokens to CSS property/value pairs
- **Style injection** — writes generated rules into the document
- **Configuration / variant resolution** — handles responsive prefixes, state variants, and theme values

## Dependencies
- **Runtime:** None — the package is self-contained
- **Consumers:** Any HTML file in the `website/` module that loads `tailwind.min.js` via a `<script>` tag
