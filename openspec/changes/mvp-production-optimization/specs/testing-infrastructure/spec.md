## ADDED Requirements

### Requirement: Backend Unit Test Layer
The backend SHALL have a Jest-based unit test suite under `backend/src/tests/unit/`. Service functions SHALL be tested in isolation using Jest mocks for Sequelize models, external HTTP clients (Razorpay, Brevo, MSG91), and the `CacheService`. Each service file with business logic SHALL have a corresponding test file. Coverage target: 70% line coverage on service files.

#### Scenario: Service function is tested in isolation
- **WHEN** `npm run test:unit` is executed from `backend/`
- **THEN** Jest runs all files matching `backend/src/tests/unit/**/*.test.js`, mocks are applied, and no real database or network connections are made

#### Scenario: Coverage threshold is enforced
- **WHEN** `npm run test:unit -- --coverage` is executed
- **THEN** Jest fails the run if line coverage on `backend/src/services/**` drops below 70%

#### Scenario: Critical service functions have tests
- **WHEN** the unit suite is complete
- **THEN** `OrderPlacementService`, `OrderCancellationService`, `RefundRulesService`, `CanService`, `LoyaltyService`, and `SystemSettingsService` each have at least one test file with passing test cases

### Requirement: Backend Integration Test Layer
The backend SHALL have a Supertest-based integration test suite under `backend/src/tests/integration/`. Integration tests SHALL spin up the Express app against a dedicated test database (configured via `TEST_DB_*` env vars) and exercise full request/response cycles including middleware, validation, and database writes. Mocks are used only for external payment and notification providers.

#### Scenario: Integration test hits real Express middleware
- **WHEN** `npm run test:integration` is executed
- **THEN** Jest runs all files matching `backend/src/tests/integration/**/*.test.js` and each test sends an HTTP request via Supertest to the real Express app with a real MySQL test database

#### Scenario: Payment provider is mocked in integration tests
- **WHEN** an integration test exercises the order placement or refund flow
- **THEN** Razorpay and Brevo API calls are intercepted by Jest mocks so no real transactions occur

#### Scenario: Critical API paths are covered
- **WHEN** the integration suite is complete
- **THEN** there are integration tests for: `POST /api/v1/auth/login`, `POST /api/v1/orders`, `PUT /api/v1/orders/:id/cancel`, `PUT /api/v1/delivery/:id/delivered`, and `GET /api/v1/admin/shops`

### Requirement: Backend E2E Critical Flow Tests
The backend SHALL include end-to-end flow tests under `backend/src/tests/e2e/` that exercise the 5 most critical business flows from HTTP request through to database state. These flows are: customer registration → login → order placement, shop owner accept → delivery assignment, delivery delivered with proof photo, COD failed delivery → `cod_failed_count` increment, and UPI cancellation → tiered refund initiation.

#### Scenario: Order placement E2E test
- **WHEN** the order placement E2E test runs
- **THEN** a test customer is registered, logs in, places an order, and the test asserts the resulting `orders` row in the test database has status `placed` and the correct price breakdown

#### Scenario: COD control E2E test
- **WHEN** the COD failure E2E test runs
- **THEN** a delivery failure event is triggered and the test asserts `users.cod_failed_count` is incremented and `users.cod_blocked` is set to `true` when the threshold is crossed

### Requirement: Frontend Unit Test Layer
The frontend SHALL have a Jest + `@testing-library/react-native` unit test suite under `frontend/__tests__/unit/`. Pure utility functions (`frontend/utils/`), Zustand store actions, and standalone components SHALL be tested in isolation. Coverage target: 60% line coverage on `frontend/utils/` and `frontend/stores/`.

#### Scenario: Utility function is tested
- **WHEN** `npm run test:unit` is executed from `frontend/`
- **THEN** Jest runs all files matching `frontend/__tests__/unit/**/*.test.{ts,tsx}` and no Expo native modules are invoked

#### Scenario: Store action is tested
- **WHEN** a Zustand store action test runs
- **THEN** the action modifies the store state as expected and any derived selectors return the correct values

### Requirement: Frontend Component Integration Test Layer
The frontend SHALL have integration tests under `frontend/__tests__/integration/` using `@testing-library/react-native` that render full screens with mocked API responses and assert on user-visible elements and interactions. Critical screens to cover: `checkout.tsx`, `order-tracking.tsx`, `login.tsx`, and `shop/products.tsx`.

#### Scenario: Checkout screen renders correctly
- **WHEN** `checkout.tsx` is rendered in the integration test with a mocked cart and shop
- **THEN** the test asserts that the price breakdown, Place Order button, and coupon input are visible

#### Scenario: Form validation fires on bad input
- **WHEN** the login screen integration test submits an invalid PIN
- **THEN** the error state is rendered without making a real API call

#### Scenario: API error state is rendered
- **WHEN** the order tracking screen's API mock returns a 500 error
- **THEN** the test asserts the error state component is visible and a retry button is present

### Requirement: Frontend E2E Test Layer (Detox)
The frontend SHALL have Detox E2E tests under `e2e/` at the repo root covering the 3 most critical user journeys: customer login → browse shop → place order → track order, delivery person login → pick up → mark delivered, and shop owner login → accept order → assign delivery person.

#### Scenario: Customer order journey passes Detox
- **WHEN** the Detox E2E suite runs against a debug build on the iOS simulator or Android emulator
- **THEN** the customer login → add to cart → checkout → order placed → tracking screen visible flow completes without assertion failures

#### Scenario: Delivery person mark-delivered journey passes Detox
- **WHEN** the Detox delivery E2E test runs
- **THEN** the delivery person logs in, taps the pending order, captures a proof photo via Detox mock camera, taps Mark as Delivered, and the order tracking screen shows `delivered` status

### Requirement: Test Tooling Configuration
Both `backend/package.json` and `frontend/package.json` SHALL include the following npm scripts: `test:unit`, `test:integration` (backend only), `test:e2e` (points to Detox for frontend, Jest e2e suite for backend), and `test` (runs unit + integration). Jest configuration SHALL be in `jest.config.js` in each package root. The backend Jest config SHALL use `--testEnvironment node`; the frontend Jest config SHALL use the `jest-expo` preset.

#### Scenario: Backend test scripts are available
- **WHEN** `npm run test` is executed from `backend/`
- **THEN** Jest runs both unit and integration suites and outputs a combined coverage report

#### Scenario: Frontend test scripts are available
- **WHEN** `npm run test` is executed from `frontend/`
- **THEN** Jest runs unit and integration suites using the `jest-expo` preset with all Expo and React Native native modules mocked

#### Scenario: Detox E2E is invocable
- **WHEN** `npm run test:e2e` is executed from `e2e/`
- **THEN** Detox builds the app (if needed) and runs the E2E scenarios against the configured simulator/emulator
