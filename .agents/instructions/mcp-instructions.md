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

---

# JcodeMunch MCP

Compresses large codebases into a navigable summary to save context.

## Code Exploration Policy
Always use jCodemunch-MCP tools — never fall back to Read, Grep, Glob, or Bash for code exploration.
- Before reading a file: use get_file_outline or get_file_content
- Before searching: use search_symbols or search_text
- Before exploring structure: use get_file_tree or get_repo_outline
- Call resolve_repo with the current directory first; if not indexed, call index_folder.

---

# Laravel Boost MCP

Exposes your local Laravel application's internals — routes, models,
config, migrations — so the agent generates accurate code without guessing.

## When to use
- Before creating or editing any models, controllers, migrations, or routes
- When checking registered routes, middleware, or app config

## How to use
- Inspect model structure before writing Eloquent queries
- List routes before adding or modifying route definitions
- Read existing migrations before writing new ones

Never scaffold Laravel code without first inspecting the app structure.

---

