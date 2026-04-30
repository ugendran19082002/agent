## Context

The Expo/React Native frontend (`frontend/`) uses TypeScript with `strict: true` but has no dedicated type-check script. Developers currently rely on editor integration for type feedback. A captured `tsc_output.txt` shows live errors including: property name mismatches on color scheme types, async functions passed to `useEffect`, and a `Timeout` vs `number` mismatch from Node/browser type ambiguity.

## Goals / Non-Goals

**Goals:**
- Add `typecheck` script to `package.json` so `npm run typecheck` runs `tsc --noEmit`
- Fix all errors currently reported by `tsc --noEmit` to reach a clean baseline
- Keep the fix surgical — no refactoring, no new abstractions

**Non-Goals:**
- Setting up CI integration (out of scope for this change)
- Enabling `noUnusedLocals`/`noUnusedParameters` (explicitly deferred per existing tsconfig comment)
- Fixing type errors in `node_modules`

## Decisions

**Decision 1: Use `tsc --noEmit` directly, not a wrapper tool**
- Rationale: The project uses Expo's `tsconfig.base` which configures `tsc` correctly; no additional tooling needed.
- Alternative considered: `expo lint` — covers ESLint only, not TypeScript type errors.

**Decision 2: Fix errors at call sites, not by widening types**
- The errors are genuine mismatches (wrong property names, async in sync callbacks). Fixes go at the usage sites, not by loosening type definitions.
- `textSecondary` → `secondary` on `ColorSchemeColors` (rename at call sites in `charge-request.tsx`)
- `service_type_id` → `service_type` on `ShopProfileRaw` (rename at call site in `product-settings.tsx`)
- Async `useEffect`: wrap the async call in an IIFE or extract to a named function called synchronously inside the effect
- `Timeout` type: use `ReturnType<typeof setTimeout>` instead of `number` for the timer variable in `mapboxApi.ts`

**Decision 3: No changes to `tsconfig.json`**
- Existing config is correct. The errors are code bugs, not config issues.

## Risks / Trade-offs

- [Risk] Fixing property names may reveal runtime bugs that were silently working due to `undefined` fallbacks → Review each fix to confirm the correct property name against the type definition source
- [Risk] More errors may surface once the obvious ones are fixed (cascading) → Run `tsc --noEmit` iteratively after each fix batch

## Migration Plan

1. Add `"typecheck": "tsc --noEmit"` to `frontend/package.json` scripts
2. Run `npm run typecheck` from `frontend/` to reproduce all current errors
3. Fix errors file by file in this order: `mapboxApi.ts`, `charge-request.tsx`, `product-settings.tsx`, `onboarding/shop/index.tsx`
4. Re-run `npm run typecheck` and confirm zero errors
