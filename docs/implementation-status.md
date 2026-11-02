# Light For Volunteer implementation status

This status reflects the current repository implementation. Local builds and API e2e tests were run on 2 November 2026; production accounts and provider configuration are not part of those checks.

## Implemented in the repository

- **Foundation and API docs:** TypeORM entities/migrations cover users, volunteer profiles, organisations, opportunities, applications, reviews, messages, badges, notifications and admin audit logs. Swagger is available from the API.
- **Authentication:** Signup/login, password hashing, JWT access/refresh, role guards, Google OAuth start/callback and one-time code exchange are implemented for volunteers, organisations, mentors and admins.
- **Profiles and verification:** Volunteer and organisation CRUD, volunteer skills/portfolio/resume, organisation verification documents, admin status handling and profile rating aggregates are connected to APIs.
- **Opportunities and applications:** Organisation listing lifecycle and admin review, public search/filtering, volunteer applications, organisation status updates, completion hours and notifications are connected.
- **Reviews:** Both participants can review the other after an application is completed; duplicate reviews are prevented and average ratings are aggregated.
- **Moderation:** Organisation/listing queues, reports and resolution endpoints, and an admin audit log are available.
- **Gamification:** Points/badges, volunteer leaderboard, completion certificates and certificate PDF download are API-backed.
- **Messaging and notifications:** Messages persist in the database, Socket.IO carries live messages, and notifications are stored/read through the API with deadline reminders.
- **Mentorship:** Mentor profiles can be published and edited; volunteers can browse the mentor directory and open a conversation.
- **Web experience:** Home, auth, opportunity discovery/details, volunteer and organisation dashboards, admin console, mentorship, about/contact/blog/resources, chat and notification UI are present and use the API for user data.
- **Storage/security:** R2 signed upload/download, ownership checks, input validation, rate limiting, security headers and origin-based CORS are implemented.
- **CI:** GitHub Actions runs lint, typecheck, builds and API e2e tests against a dedicated PostgreSQL service/database.

## Provider setup still required before production use

- Deploy the web and API services and provide each service's production environment variables.
- Configure a managed PostgreSQL database and run migrations as a one-time/release step. Do not enable TypeORM schema sync in production.
- Set production JWT secrets, frontend/API origins, database credentials, and R2 credentials in the hosting provider's secret store.
- Add the deployed frontend origin to the R2 bucket's CORS policy (at least `PUT`, `GET`, and the required `Content-Type` header) and verify uploads from HTTPS.
- Configure Google OAuth credentials and the exact deployed callback URL if Google sign-in will be offered.
- Seed the first admin securely, then remove seed-only credentials from the running service.
- Verify live signup/login, upload, opportunity approval/application/completion/reviews, chat and notifications on the deployed origins.

## Verification performed locally

- `npm run build`: passed for web, API and shared types.
- `npm run typecheck --workspace @lfv/api` and web TypeScript check: passed.
- API e2e: 4 suites, 63 tests passed using the isolated `light_for_volunteer_test` database.
- Lint: no errors; existing warnings remain for unused imports, `any` usage, and image/link/hook recommendations.
- Local HTTP smoke checks: web returned 200; API health returned `status: ok` and `database: connected`; public opportunities returned 200/data; protected `/api/auth/me` returned 401 without a token.

Browser uploads and production integrations still depend on the provider setup above; passing local code checks does not confirm those external settings.
