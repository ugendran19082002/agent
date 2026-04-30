# System Overview

## Description
A static website that uses the Tailwind CSS browser runtime to apply utility-first styles. The runtime scans the DOM for Tailwind class names and injects the corresponding CSS dynamically.

## Modules
| Module | Path | Role |
|--------|------|------|
| website | `website/` | All frontend assets; single logical unit |

## Entry Points
- `website/assets/js/tailwind.min.js` — Tailwind CSS runtime; auto-executes on browser load, processes utility classes in the DOM

## External Systems
- None inferable from the analysed structure. The Tailwind runtime is self-contained and requires no external API calls at runtime.

## Key Characteristics
- 947 internal symbols (442 functions, 505 methods) in the Tailwind runtime — these are implementation details of the CSS engine, not application logic
- No application-level JavaScript modules, frameworks, or components are present in the analysed structure
