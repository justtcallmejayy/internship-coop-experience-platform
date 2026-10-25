# Major Database Requirements

The application is ready to continue local development, but before a real deployment, I need to:

- Create a hosted PostgreSQL database.
- Replace the placeholder production connection with environment-variable configuration.
- Run the migrations against the hosted database.
- Seed the industries and technologies.
- Create a production admin account.
- Test registration, login, profile, experience creation, submission, and browsing against the hosted database.

I will not deploy my app using a poor database choice such as SQLite. The database might be lost during restarts or redeployments, may not manage backups, and could conflict with the deployment architecture.

## Production Requirements

1. **Production PostgreSQL credentials are hard-coded placeholders.**

   I will need a `DATABASE_URL` from Supabase.

2. **Session storage is currently not production-ready.**

   Use a persistent session store, such as PostgreSQL-backed sessions.

3. **Cookie settings must change for production.**

   Check whether both the client and server use the same `SameSite` setting.

4. **CORS must use the deployed frontend URL.**

   This must point to a real frontend domain rather than `localhost`.

5. **Reference data must be seeded.**

   Run the seed defined in `001_reference_data.js` so the industry and technology dropdowns work.

## Current implementation status

- SQLite remains the local development and automated test database.
- Staging and production now use a PostgreSQL `DATABASE_URL`.
- Production sessions use PostgreSQL-backed session storage.
- Production requires `DATABASE_URL` and a non-default `SESSION_SECRET`.
- Production cookies use HTTPS-only secure cookies.
- `server/.env.example` documents the required deployment variables.
- Supabase production database connection verified on October 25.
- Production migrations were already up to date.
- Reference seed completed: 8 industries and 11 technologies.
- Production app smoke test passed: `/health` returned 200 and unauthenticated `/auth/me` returned 401.

## Deployment order

1. Create the Supabase PostgreSQL project.
2. Add `DATABASE_URL`, `SESSION_SECRET`, `CLIENT_ORIGIN`, and `NODE_ENV=production` to the API host.
3. Run `npm run migrate:latest` and `npm run seed` from `server`.
4. Deploy the API and confirm `/health`.
5. Set the frontend `VITE_API_BASE_URL` to the deployed API URL.
6. Deploy the frontend.
7. Smoke-test registration, login, profile, experience creation, submission, browsing, and logout.
