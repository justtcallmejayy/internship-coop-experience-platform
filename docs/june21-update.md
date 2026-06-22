# By the end of Phase 3 I will have

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Features / Utilities

- `validatePassword()`
- `hashPassword()`
- `comparePassword()`
- `requireAuth` middleware
- `requireAdmin` middleware
- Unit tests for password validation
- API tests for register/login/logout/me

## Required files
The following should be the project tree (relative to project folder):

```
server/
  src/
    middleware/
      auth.middleware.js
    routes/
      auth.routes.js
    services/
      password.service.js
      password.service.test.js
    routes/
      auth.routes.test.js
```