## ADDED Requirements

### Requirement: Request Validation Middleware
The backend SHALL validate all incoming requests for Order, Payment, and Delivery routes using `express-validator`.

#### Scenario: Invalid Request Payload
- **WHEN** a request is sent with missing mandatory fields or invalid types
- **THEN** the backend SHALL return a `400 Bad Request` with a structured list of validation errors

### Requirement: Standardized Error Responses
Every service function and route handler SHALL use the `sendError` utility with codes from `statusCodes.js`.

#### Scenario: Internal Error Handling
- **WHEN** an unexpected error occurs in a service
- **THEN** the system SHALL return a standard JSON response with an appropriate status code and message
