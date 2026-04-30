## ADDED Requirements

### Requirement: Typecheck script in package.json
`frontend/package.json` SHALL include a `typecheck` script that executes `tsc --noEmit` to validate TypeScript types across the entire frontend codebase without producing build output.

#### Scenario: Developer runs typecheck
- **WHEN** a developer runs `npm run typecheck` from the `frontend/` directory
- **THEN** the command executes `tsc --noEmit` and exits with code 0 when no type errors exist

#### Scenario: Typecheck fails on type error
- **WHEN** a TypeScript type error is present in any `.ts` or `.tsx` file
- **THEN** `npm run typecheck` exits with a non-zero code and prints the error with file path and line number

### Requirement: Clean type-check baseline
The frontend codebase SHALL produce zero TypeScript errors when `tsc --noEmit` is executed against the existing `tsconfig.json`.

#### Scenario: No errors on clean run
- **WHEN** `npm run typecheck` is executed with no modified files
- **THEN** the command completes with exit code 0 and prints no error diagnostics

#### Scenario: Timeout type resolved
- **WHEN** `tsc --noEmit` processes `api/mapboxApi.ts`
- **THEN** no TS2322 error is raised for the timer variable (typed with `ReturnType<typeof setTimeout>`)

#### Scenario: ColorSchemeColors property resolved
- **WHEN** `tsc --noEmit` processes `app/delivery/charge-request.tsx`
- **THEN** no TS2551 errors are raised for color scheme property accesses

#### Scenario: ShopProfileRaw property resolved
- **WHEN** `tsc --noEmit` processes `app/shop/product-settings.tsx`
- **THEN** no TS2551 errors are raised for `service_type` property access

#### Scenario: useEffect async callback resolved
- **WHEN** `tsc --noEmit` processes `app/onboarding/shop/index.tsx`
- **THEN** no TS2345 error is raised for the async function passed to `useEffect`
