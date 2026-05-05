## ADDED Requirements

### Requirement: File-Level Audit Report
An audit report SHALL be produced at `frontend/audit_report.md` (frontend) and `backend/audit_report.md` (backend) listing every non-test, non-config file with: file name, stated purpose, whether it is imported/used, and a recommended action (KEEP / REFACTOR / DELETE).

#### Scenario: Unused component identified
- **WHEN** the audit scan finds a component file with zero imports in `app/` and `components/`
- **THEN** the report lists it as DELETE with the reason "no import references found"

#### Scenario: Duplicate utility found
- **WHEN** two files implement the same utility function (e.g., date formatting)
- **THEN** the report lists one as DELETE and the other as KEEP, with a note identifying which callers to update

### Requirement: Dead Code Removal
After audit report sign-off, all files and symbols marked DELETE SHALL be removed from the codebase. Files marked REFACTOR SHALL have their issues addressed.

#### Scenario: Unused import removed
- **WHEN** a file has an import statement for a symbol that is never used in that file
- **THEN** the import is removed

#### Scenario: Dead React Native component removed
- **WHEN** a component file is confirmed to have no callers
- **THEN** the file is deleted and no other file references it after deletion

### Requirement: Backend Route Audit
Every route handler in `src/routes/v1/` SHALL be verified to have: a corresponding controller action, at least one validation rule, consistent error response format `{ success: false, message: string, errors?: [...] }`, and auth middleware applied where required.

#### Scenario: Route missing auth middleware
- **WHEN** the audit identifies a route that requires authentication but has no `verifyToken` (or equivalent) middleware
- **THEN** it is flagged as REFACTOR with the remediation: add auth middleware

#### Scenario: Route with no validation
- **WHEN** a POST/PUT route accepts a request body but has no `express-validator` checks
- **THEN** it is flagged as REFACTOR with the remediation: add validation schema

#### Scenario: Orphaned route file
- **WHEN** a route file is not mounted in `src/routes/index.routes.js` or any other router
- **THEN** it is flagged as DELETE

### Requirement: Dependency Audit
Both `frontend/package.json` and `backend/package.json` SHALL be audited using `depcheck` or equivalent. Every package reported as unused SHALL be evaluated and, if confirmed unused, removed.

#### Scenario: Frontend unused dependency
- **WHEN** `depcheck` reports a frontend package as unused
- **THEN** the audit lists it with the action REMOVE unless it is a peer dependency, type package, or Expo plugin that depcheck cannot detect

#### Scenario: Duplicate functionality packages
- **WHEN** both `moment` and `dayjs` are installed for date formatting
- **THEN** one is designated canonical and the other is listed for removal with migration notes for its call sites

#### Scenario: Security-relevant outdated package
- **WHEN** a package has a known CVE or is more than 2 major versions behind
- **THEN** it is flagged in the audit with severity and upgrade path

### Requirement: Architecture Folder Structure Compliance
The frontend SHALL organize files into the following top-level folders only: `app/`, `components/`, `hooks/`, `stores/`, `api/`, `utils/`, `constants/`, `types/`, `lib/`, `styles/`, `assets/`, `providers/`, `config/`. Any file outside these folders SHALL be justified or moved.

#### Scenario: Orphaned script at root
- **WHEN** a `.ts` or `.tsx` file exists at the `frontend/` root with no clear category
- **THEN** it is either moved to the appropriate folder or listed for deletion in the audit report

#### Scenario: Backend folder compliance
- **WHEN** the backend is audited
- **THEN** all `.js` files reside within `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/`, `src/validations/`, `src/model/`, `src/utils/`, `src/config/`, `src/queue/`, `src/cron/`, or `src/constants/`; any file outside this structure is flagged

### Requirement: Code Quality Baseline
After the cleanup pass, the codebase SHALL have ESLint configured (frontend) and no console.log statements in production code paths (both frontend and backend). Backend SHALL use the Winston logger exclusively for all log output.

#### Scenario: ESLint passes on frontend
- **WHEN** `eslint .` is run on the frontend
- **THEN** it exits with zero errors (warnings are acceptable)

#### Scenario: No console.log in backend src
- **WHEN** `grep -r "console.log" src/` is run in the backend
- **THEN** no results are found in non-test files (all logging uses `logger.info/warn/error`)
