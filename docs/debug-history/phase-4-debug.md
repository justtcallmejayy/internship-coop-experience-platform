# Phase 4 Debug History

The test run initially failed because Express could not load `profileRoutes` correctly.

## Test Result

The test passed:

```text
npm test

> server@1.0.0 test
> NODE_ENV=test jest --runInBand

PASS  src/routes/auth.routes.test.js
PASS  src/routes/profile.routes.test.js
PASS  src/app.test.js
PASS  src/services/password.service.test.js
PASS  src/db/db.test.js

Test Suites: 5 passed, 5 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        1.75 s
Ran all test suites.
```
