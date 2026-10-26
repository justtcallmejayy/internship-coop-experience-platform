# Milestone 1 Testing Summary

## Automated Testing Tools Used

- Jest: test runner
- Supertest: API endpoint testing
- Knex migrations: test database setup
- SQLite test database: isolated test data

## Automated Test Command

```bash
cd server
npm test
```

## Current Automated Coverage

### Backend Foundation

- GET `/health` returns `ok: true`

### Database

- Migrations create expected ERD tables

### Authentication

- Register valid user
- Reject weak password
- Reject duplicate email
- Login valid user
- Reject invalid password
- Reject unauthenticated `/auth/me`
- Logout clears session

### Profile Management

- Reject unauthenticated profile access
- Return logged-in user profile
- Update allowed profile fields
- Reject email update
- Reject role update
- Reject invalid graduation year
- Reject invalid LinkedIn URL

### Student Experience Entry Workflow

- Reject unauthenticated create
- Create draft experience entry
- Validate required/invalid fields
- Return only logged-in user's entries
- View owned entry
- Update owned draft entry
- Reject edit while Pending
- Prevent deleting another user's entry
- Delete owned entry
- Submit entry for review
- Reject duplicate submission

### Admin Moderation

- Reject unauthenticated admin access
- Reject student users from admin routes
- Return pending queue for admin
- Return entry detail for admin
- Approve Pending entry
- Reject Pending entry
- Reject approval of non-Pending entry
- Reject invalid entry ID
- Return 404 for missing entry

### Browse Approved Entries

- Reject unauthenticated browse access
- Return only Approved entries
- Hide Draft/Pending/Rejected entries
- Search by company name
- Search by role title
- Filter by industry
- Filter by work term type
- Filter by work mode
- Sort by most recent submission date
- Return approved entry details only

## Manual Testing Used

Manual curl/Postman-style testing was used for quick verification and demonstration only. Automated Jest/Supertest tests are the main testing evidence.

## Browser End-to-End Testing

Playwright is configured in `client/playwright.config.js` and can be run with:

```bash
cd client
npm run test:e2e
```

The initial browser suite covers:

- Successful student registration
- Successful student login
- Session persistence after a browser refresh
- Inline invalid-login errors
- Redirecting logged-out users from protected pages
- Redirecting student users from the admin page to the access-denied page
- Creating an experience draft
- Submitting an experience for review
- Admin approval of a pending experience

These scenarios cover the proposal's UI-001 through UI-004 cases.

The next browser coverage should exercise editing and deleting entries,
browsing/search/filtering approved entries, and admin rejection.
