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

// This week I completed the core authentication foundation for the project, including planned endpoints, password utilities, auth middleware, and test coverage. I also organized the required server files and documented the phase 3 goals clearly. Next week I will continue by writing the authentication routes and connecting everything together.
