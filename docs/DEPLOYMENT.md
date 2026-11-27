# Production deployment checklist

The web and API are separate Node services in this monorepo. Deploy the repository root so npm workspaces and the lockfile are available. Use Node.js 24.9 or newer.

## Required production services

- A managed PostgreSQL database reachable from the API service.
- Neon works through `DATABASE_URL`; the API prefers it over the separate database fields.
- A public web origin and a public API origin with HTTPS.
- Cloudflare R2 credentials scoped to the `light-for-volunteer` bucket.
- Redis is optional; when `REDIS_URL` is empty the API uses its PostgreSQL refresh-session fallback.

## Environment variables

Set these in the hosting provider’s secret/environment settings, not in source control:

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `WEB_ORIGIN` | Exact HTTPS frontend origin, with no path |
| `NEXT_PUBLIC_API_URL` | HTTPS API origin ending in `/api`; set before building the web app |
| `PORT` | The port assigned by the host, or `3001` |
| `DATABASE_URL` | Optional full PostgreSQL connection string (e.g. Neon; takes precedence over the separate fields) |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Managed PostgreSQL connection values when `DATABASE_URL` is not set |
| `DATABASE_SYNC` | `false` |
| `DATABASE_MIGRATIONS_RUN` | `false`; run migrations as a release step |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Separate random secrets, each at least 32 characters |
| `REDIS_URL` | Managed Redis URL (`rediss://` where required), or blank |
| `STORAGE_PROVIDER` | `r2` |
| `R2_ACCOUNT_ID`, `R2_ENDPOINT`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Cloudflare R2 account, endpoint, bucket, and bucket-scoped credentials |
| `R2_REGION` | `auto` |

If Google sign-in is enabled, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` to `https://<api-host>/api/auth/google/callback`, and register that callback with Google. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` only for the one-time admin seed step; do not leave the admin password in the running service environment after seeding.

## Build and start commands

For Neon, create a project and copy its pooled connection string from the Connect panel. Store it as the API service's `DATABASE_URL` environment variable. Keep the `sslmode=require` query parameter in the URL; Neon requires TLS for database connections. Do not add the database URL to the web service.

From the repository root, configure the web service with:

```text
Build: npm ci && npm run build --workspace web
Start: npm run start --workspace web
```

Configure the API service with:

```text
Build: npm ci && npm run build --workspace @lfv/types && npm run build --workspace @lfv/api
Start: npm run start:prod --workspace @lfv/api
Health check: /api/health
```

For paid Render web services, use this pre-deploy command for database changes:

```text
npm run db:migrate
```

For Render Free, pre-deploy commands aren't available. Use this API Start Command for the first deploy so the schema is ready before the API starts:

```text
npm run db:migrate && npm run start:prod --workspace @lfv/api
```

The migration runner records completed migrations, so subsequent starts don't re-apply them. Keep `DATABASE_SYNC=false` and `DATABASE_MIGRATIONS_RUN=false` in production. For a paid service, run the migration as a pre-deploy command once per deploy instead.

To seed the first admin on Free, temporarily set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`, and use this Start Command for one deploy:

```text
npm run db:migrate && npm run seed:admin --workspace @lfv/api && npm run start:prod --workspace @lfv/api
```

After Render reports the API is live, remove the admin credentials from its environment and restore the normal Start Command above. Never commit these credentials.

Take a database backup before production migrations. Do not enable TypeORM schema synchronization in production.

## Before opening the site

1. Add the frontend origin to the API’s `WEB_ORIGIN` and set the frontend’s `NEXT_PUBLIC_API_URL` to the deployed API URL. Rebuild the web service after changing that public variable.
2. Confirm `GET /api/health` returns `status: ok` and `database: connected`.
3. Confirm `GET /api/opportunities` returns HTTP 200, and `GET /api/auth/me` returns HTTP 401 without a token.
4. Create an admin account with the seed command, then sign in and verify a real organisation account and volunteer account through signup/login.
5. Test an opportunity through draft, admin approval, public listing, application submission, and organisation status update. Use test records first.
6. Confirm R2 upload and download flows from the deployed domain. Set the bucket’s CORS allow-origin to the exact frontend origin if browser uploads/downloads require it.

The web production build and API production build are the deployment gates. The API tests that require external credentials or a production database should be run in the relevant deployment environment.

## Render staging and production deploys

`.github/workflows/ci.yml` runs for pull requests and pushes to `staging` and `main`. After CI succeeds on a push, `.github/workflows/render-deploy.yml` sends Render deploy-hook requests for the matching environment. Configure the Render services to deploy the corresponding branch and add these GitHub Actions secrets:

| Secret | Render service |
| --- | --- |
| `RENDER_API_DEPLOY_HOOK_STAGING` | Staging API |
| `RENDER_WEB_DEPLOY_HOOK_STAGING` | Staging web |
| `RENDER_API_DEPLOY_HOOK_PRODUCTION` | Production API |
| `RENDER_WEB_DEPLOY_HOOK_PRODUCTION` | Production web |

Create GitHub `staging` and `production` environments and add the matching secrets to each environment. Set required reviewers on `production` if a human approval should gate production deploys. Configure the API service's release command as `npm run db:migrate`; the workflow does not expose database credentials or run migrations from GitHub Actions.
