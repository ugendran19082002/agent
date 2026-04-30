## 1. Add Typecheck Script

- [x] 1.1 Add `"typecheck": "tsc --noEmit"` to the `scripts` section of `frontend/package.json`
- [x] 1.2 Run `npm run typecheck` from `frontend/` and capture the full error list

## 2. Fix Type Errors in mapboxApi.ts

- [x] 2.1 Locate the timer variable in `frontend/api/mapboxApi.ts` (line 62) typed as `number`
- [x] 2.2 Change its type to `ReturnType<typeof setTimeout>` to resolve TS2322

## 3. Fix Type Errors in charge-request.tsx

- [x] 3.1 Find all usages of `textSecondary` on `ColorSchemeColors` in `frontend/app/delivery/charge-request.tsx`
- [x] 3.2 Rename each `textSecondary` access to `secondary` (the correct property name)
- [x] 3.3 Verify no remaining TS2551 errors in this file

## 4. Fix Type Errors in product-settings.tsx

- [x] 4.1 Locate `service_type_id` usages in `frontend/app/shop/product-settings.tsx` (lines 105–106)
- [x] 4.2 Replace `service_type_id` with `service_type` to match `ShopProfileRaw` type
- [x] 4.3 Verify the computed property expression on line 106 resolves without TS2464

## 5. Fix Async useEffect in onboarding/shop/index.tsx

- [x] 5.1 Locate the async function passed directly to `useEffect` in `frontend/app/onboarding/shop/index.tsx` (line 89)
- [x] 5.2 Refactor to wrap the async call inside a synchronous callback (IIFE pattern or named inner function)
- [x] 5.3 Verify TS2345 is resolved

## 6. Verify Clean Baseline

- [x] 6.1 Run `npm run typecheck` from `frontend/` and confirm exit code 0 with zero error output
