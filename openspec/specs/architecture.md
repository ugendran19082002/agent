# Architecture

## Style
Static frontend — no server-side logic, no build pipeline, no backend layer inferred.

## Layers
| Layer | Description |
|-------|-------------|
| Presentation | HTML pages with Tailwind utility classes |
| Style Engine | Tailwind CSS runtime (`tailwind.min.js`) — parses classes and emits CSS |

## Component Interaction
```
Browser loads HTML
  └─> Tailwind runtime (tailwind.min.js) initialises
        └─> Scans DOM for utility class names
              └─> Generates and injects <style> rules into the document
```

## Data Flow (high-level)
- **Input:** HTML class attributes containing Tailwind utility tokens
- **Processing:** Tailwind runtime resolves tokens → CSS rule strings (handled internally by its 947 symbols)
- **Output:** Injected `<style>` block(s) in the document head; styled page rendered by the browser

## Notes
- The runtime is minified and self-contained; its internal symbols (functions/methods) are implementation details and do not represent application-level components
- No inter-module communication or shared state between application modules is present — the project has a single module
