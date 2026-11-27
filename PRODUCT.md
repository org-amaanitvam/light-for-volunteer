# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Volunteers & Interns**: Students, young professionals, and skilled contributors seeking legitimate, impactful volunteer opportunities or internships to contribute their skills (tech, design, teaching, fieldwork), track validated service hours, and earn recognized credentials.
- **Social Impact Organisations / NGOs**: Grassroots non-profits and registered charitable trusts seeking dependable, skilled volunteer support; posting listings, managing applications, verifying attendance, and issuing verified certificates.
- **Secondary Roles**:
  - **Mentors**: Experienced professionals offering guidance to volunteers and grassroots initiatives.
  - **Admins & Moderators**: Foundation team members vetting organisations, reviewing reported listings, and managing the audit log.

## Product Purpose

Light For Volunteer connects social impact organisations with volunteers and interns through a verified, transparent marketplace. It exists to solve two complementary problems: grassroots non-profits struggling to find dependable, skilled talent, and well-intentioned individuals hesitating due to lack of transparency, trust, or structure. Success means high-fidelity placements, verified completed hours, mutual trust, and verifiable impact recognized across civil society and academia.

## Positioning

Verified trust and accountability at every step: unlike uncurated noticeboards or unverified social listings, Light For Volunteer enforces organisation vetting, structured application and completion lifecycles, two-way mutual reviews, auditable volunteer hours, and tamper-evident digital completion certificates.

## Operating Context

- **Work Environments**: Mobile web and desktop browser usage by volunteers on the go or at home, and desktop administrative workflows by NGO coordinators managing applicant profiles and listings.
- **Key Workflows**:
  - Discovery & Search (faceted filtering by cause, skills required, city/location type, points reward).
  - Application & Selection Lifecycle (`Draft` -> `Pending Review` -> `Live` -> `Applied` -> `Shortlisted` -> `Selected` -> `Completed`).
  - Hour Logging & Certificate Issuance (verified hours logged by organisations triggering digital PDF certificates).
  - Real-time coordination (Socket.IO in-app messaging and status notifications).
  - Mutual post-completion reviews and community leaderboard.

## Capabilities and Constraints

- **Architecture**: Monorepo with Next.js 16 (React 19, Tailwind CSS v4, Lucide icons) frontend web app (`apps/web`) backed by NestJS API (`backend/api`) with TypeORM, PostgreSQL, and Cloudflare R2 / S3 storage for documents.
- **Security & Trust Model**: Role-Based Access Control (Volunteers, Organisations, Mentors, Admins), JWT auth with refresh tokens, Google OAuth, and document verification pipeline.
- **Explicitly Undecided / Open Facts**: External payment/stipend disbursement rails (if any for paid internships); third-party NGO registry automated verification APIs.

## Brand Commitments

- **Initiative Name**: Light For Volunteer (LFV)
- **Parent Organization**: Amaanitvam Foundation
- **Tone & Voice**: Purposeful, warm, trustworthy, transparent, empowering, and civic-minded. Avoid bureaucratic coldness and hollow marketing hype.
- **Core Visual Commitments**: Sky/cyan and slate foundation currently used in `apps/web` (sky-600, cyan-600, clean white cards, subtle border definition, crisp typography).

## Evidence on Hand

- Fully structured backend entities and API implementations in `light-for-volunteer/backend`.
- Next.js web application with routes for `/`, `/about`, `/opportunities`, `/volunteer`, `/organisation`, `/mentorship`, `/blog`, `/contact`, `/login`, and `/signup`.
- Verified feature set documented in `light-for-volunteer/docs/implementation-status.md` and `aryan-opportunities-implementation.md`.
- No fabricated testimonials or false partner statistics to be used.

## Product Principles

1. **Earned Trust First**: Every organization and listing is held to high standards of legitimacy; transparent reviews and verified hours protect both volunteers and beneficiaries.
2. **Action Over Ambiguity**: Opportunities clearly state required skills, commitment hours, location model (remote/hybrid/in-person), and tangible outcomes.
3. **Respect for Time**: Seamless workflows for busy NGO coordinators and volunteer applicants—minimal friction from discovery to application to certificate.
4. **Recognition That Counts**: Volunteering is honored through legitimate, verifiable service credits, skill milestones, and shareable certificates.

## Accessibility & Inclusion

- Multi-device responsive web accessible on standard consumer smartphones and entry-level laptops.
- WCAG AA contrast compliance across interactive text and UI indicators.
- Clear semantic landmarks, form labels, and keyboard navigability across application cards and dialogs.
