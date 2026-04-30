# Context7 MCP

Fetches up-to-date, version-specific documentation from official sources.

## When to use
- Before writing code that uses any library, framework, or external API
- When unsure of the correct API signature, options, or version behaviour

## How to use
1. Call `resolve-library-id` with the library name
2. Call `get-library-docs` with that ID and a focused topic
3. Write the code only after reading the docs

Never rely on training data for library APIs. Always fetch first.
