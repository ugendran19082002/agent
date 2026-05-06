## Why

The React Native app spans many screens and shared components, but styling is inconsistent: mixed inline values, duplicated tokens, and uneven spacing and typography hurt readability, accessibility, and maintainability. A single production-grade design system and a disciplined audit will make the UI predictable on all phone and tablet sizes and align components with modern mobile UX expectations.

## What Changes

- **Global UI audit**: Inventory all screens and reusable components; document inconsistencies (spacing, type, layout, hardcoded dimensions, duplicate/unused styles).
- **Unified design tokens**: Introduce or consolidate a theme module for spacing scale, typography scale, colors, border radii, and elevation/shadows; replace ad hoc numeric literals with named tokens.
- **Responsive layout**: Standardize flex-based layouts, safe areas, and scalable sizing so UI holds up from small phones through tablets; minimize fixed width/height except where required.
- **Component primitives**: Align buttons, inputs, cards, list rows, and chrome with the same radii, padding, and touch targets; extract repeated patterns into shared components where it reduces duplication.
- **Refactor for consistency**: Move inline styles to `StyleSheet` or theme-derived styles where practical to reduce re-renders and keep structure readable.
- **Quality bar**: Document before/after conventions and best practices (minimal, high-contrast, consumer-app clarity in the Uber/Swiggy sense—clear hierarchy, no clutter).

## Capabilities

### New Capabilities

- `rn-design-tokens`: Single source of truth for spacing, typography, color palette, radii, and shadows; rules for naming and consumption across the app.
- `responsive-layout`: Breakpoints or scaling strategy, flex patterns, and safe use of `Dimensions` / percentage widths so layouts adapt across device classes.
- `ui-primitives-standardization`: Contracts and refactors for shared UI building blocks (buttons, inputs, cards, headers, list items) for consistent padding, borders, and states.
- `screen-ui-conformance`: Per-screen audit and refactor requirements so every screen uses tokens and shared patterns; tracks removal of hardcoded layout and one-off styles.

### Modified Capabilities

- `ui-state-consistency`: Extend requirements so loading, empty, and error presentations use the same spacing, typography, and component patterns as the rest of the design system on role-specific screens.

## Impact

- **Code**: React Native UI code—`app/` screens, `components/`, shared `constants/` or `styles/` theme files, hooks used for responsiveness, and tests or snapshots tied to UI.
- **Dependencies**: Possible additions for responsive helpers or animation only if the repo does not already cover them; prefer existing stack.
- **No breaking API changes** to backend or public contracts; this change is primarily client UI structure and styling.
- **Overlap note**: An in-repo change `production-ready-ui-audit` exists with overlapping goals; this change focuses the contract on **mobile UI and design system** delivery (tokens, layout, components, screens) without expanding scope to backend audits unless later merged deliberately.
