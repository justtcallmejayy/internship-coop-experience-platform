# Debugging Admin Authentication

## Issues Found

- The first bug was caused by using different brackets for the `describe` function.
- In the test case, `Admin` was incorrectly written in lowercase.
- The compiler treated `Admin` and `Administrator` as two different roles.

## Test Results

| Result              | Value                            |
| ------------------- | -------------------------------- |
| Expected status     | `403`                            |
| Received status     | `403`                            |
| Test expected       | `Administrator access required.` |
| Actual API response | `Admin access required.`         |
