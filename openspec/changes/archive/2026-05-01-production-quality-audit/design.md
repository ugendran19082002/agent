## Context

The application is functionally complete but requires a "production-ready" audit and refinement phase. Current gaps include:
- Use of WebView for payments in production (slow, poor UX).
- Extreme database index duplication (15x on certain columns in `orders`).
- Large, unmaintainable frontend components (2.4k line checkout).
- Inconsistent backend validation and error handling.
- Missing or inconsistent UI feedback states (loading, error, empty).

## Goals / Non-Goals

**Goals:**
- Transition to native payment SDK for production reliability and speed.
- Optimize database performance by removing redundant indexes.
- Improve codebase maintainability through component decomposition and backend standardization.
- Elevate UX by ensuring every state (loading, error, empty, success) is visually handled.
- Ensure the app is "attractive" and "user-friendly" through consistent use of design system primitives (Skeletons, Toasts).

**Non-Goals:**
- Adding new business features (e.g., new payment methods beyond Razorpay).
- Full UI redesign (keep existing look, just polish interactions and states).
- Changing the underlying database engine.

## Decisions

### 1. Razorpay Implementation Strategy
- **Decision:** Use `react-native-razorpay` (Native SDK) for production, with a WebView fallback for `__DEV__` (Expo Go).
- **Rationale:** Native SDK provides a much smoother, trusted, and faster payment experience. WebView is kept for developer convenience in Expo Go environments where native modules might not be linked.
- **Alternatives:** 
  - *Pure WebView:* Rejected for production due to high failure rates and poor UX.
  - *Pure Native:* Rejected because it breaks development workflows in standard Expo Go.

### 2. Database Cleanup Approach
- **Decision:** Automated migration script to detect and drop duplicate indexes.
- **Rationale:** Manual cleanup is error-prone given the high number of duplicates (15x on some columns). A script ensures all tables are audited.
- **Alternatives:** 
  - *Manual SQL:* Too slow and likely to miss duplicates in less-obvious tables.

### 3. Backend Standardization
- **Decision:** Use `express-validator` middleware for all entry points and standardize response utilities.
- **Rationale:** Centralizes validation logic, reducing boilerplate in route handlers and ensuring consistent error shapes for the frontend.
- **Alternatives:** 
  - *Manual Joi/Zod in services:* Valid but `express-validator` integrates better with existing Express middleware patterns.

### 4. UI Polish and States
- **Decision:** Strict "State Completeness" rule for every data-driven screen: must have a Skeleton (loading), EmptyState (zero data), ErrorBoundary (crash), and Success/Error Toasts (actions).
- **Rationale:** Addresses the user's requirement for a "user-friendly" and "attractive" app experience by eliminating "blank screen" moments.

## Risks / Trade-offs

- **[Risk] Native SDK linking issues** → **Mitigation:** Comprehensive testing on physical Android/iOS devices; maintain WebView fallback behind `__DEV__`.
- **[Risk] Accidental deletion of unique indexes** → **Mitigation:** Migration script must specifically target redundant indexes where `(table, column)` is duplicated and keep the primary/unique constraint.
- **[Risk] Refactoring `checkout.tsx` causes regressions** → **Mitigation:** Create detailed spec scenarios for success/failure and verify each sub-component in isolation.
