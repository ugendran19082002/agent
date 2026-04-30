## Why

The frontend TypeScript codebase has accumulating type errors (visible in `tsc_output.txt`) that are silently bypassed during development because there is no `noEmit` type-check step in the build pipeline. Running `npx tsc --noEmit` as a formal step surfaces these errors so they can be fixed, preventing type-unsafety from silently shipping.

## What Changes

- Add a `typecheck` script to `frontend/package.json` that runs `npx tsc --noEmit`
- Fix all existing TypeScript errors surfaced by `tsc --noEmit` (mismatched property names, async `useEffect` callbacks, wrong type assignments)
- Ensure the type-check passes cleanly with zero errors

## Capabilities

### New Capabilities
- `frontend-typecheck`: Adds a `typecheck` npm script that runs `tsc --noEmit` to validate TypeScript types across the entire frontend without emitting build artifacts

### Modified Capabilities
- None

## Impact

- `frontend/package.json`: new `typecheck` script
- `frontend/tsconfig.json`: no changes required (strict mode already on)
- Multiple `.tsx` files with type errors (documented in `frontend/tsc_output.txt`): property name mismatches (`textSecondary` → `secondary`, `service_type_id` → `service_type`), async `useEffect` cleanup, `Timeout` type mismatch
- No API or dependency changes required
