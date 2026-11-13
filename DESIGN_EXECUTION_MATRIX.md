# Design Execution Matrix — Page-by-Page Workstream Mapping

**Project:** Light For Volunteer (`d:\Amaanitvam Volunteer\light-for-volunteer`)  
**Design Direction:** The Transparent Ledger — Crisp, Architectural, Civic Azure on White  
**Palette:** Strict White × Blue  
**Date:** November 11, 2026  
**Route Inventory Reconciliation:**  
- **Source Routes:** **24 application routes** across 6 verified page families.  
- **Build Targets:** **27 Next.js production targets** (24 source pages + `/_not-found` + PPR client/server chunks).

---

## 1. Skill Status Classification & Phase Differentiation

- **Installed:** Skill files and `SKILL.md` exist locally under `$env:USERPROFILE\.gemini\config\skills\<name>\`.
- **Discovered:** Antigravity runtime engine discovers and registers the skill in active session prompt `<skills>`.
- **Available:** The skill is bound and invokable in the current project workspace without sandbox restrictions.
- **Phase 1 / Batch 1 Applied:** Direct contribution to foundation tokens (`globals.css`, `ui/`), Navbar, Footer, and Homepage (`/`).
- **Batch 2 Loaded:** Core `SKILL.md` and specific domain supporting references read into active context for `/opportunities` and `/opportunities/[id]`.
- **Batch 2 Applied:** Concrete design, layout, microcopy, accessibility, or QA decision applied to Batch 2.

---

## 2. Product Area 1: Public Experience (4 Source Routes)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Phase 1 / Batch 1 Applied | Batch 2 Applied | Page Purpose & Specific Architectural Composition | QA Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| `/` | **Homepage** | **WS1:** `design-taste-frontend`, `impeccable`, `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-colors`, `better-typography`, `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility`<br>**WS6:** `unslop`, `hallmark`, `design-review` | Yes | Yes | Yes | **Yes** | — | Two-column hero with Live Ledger Dossier preview, real API cards grid, three pillars, dual participation pathways, Midnight Navy civic action banner. | **Verified (Batch 1)** |
| `/about` | **About** | **WS1:** `design-taste-frontend`, `impeccable`<br>**WS3:** `better-typography`, `better-colors`<br>**WS4:** `better-writing`<br>**WS6:** `unslop`, `hallmark`, `design-review` | Yes | Yes | Yes | Partial (Globals) | Queued | Amaanitvam Foundation transparency charter, civic impact mission, verified non-profit governance, authentic photographic grid. | *Queued* |
| `/contact` | **Contact & Support** | **WS1:** `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | Partial (Globals) | Queued | Structured support dossier, verified contact cards (email, phone, New Delhi headquarters), accessible inquiry form with keyboard feedback. | *Queued* |
| `/blog` | **Civic Insights & Blog** | **WS1:** `design-taste-frontend`<br>**WS2:** `better-layout`<br>**WS3:** `better-typography`, `better-colors`<br>**WS4:** `better-writing`<br>**WS6:** `unslop` | Yes | Yes | Yes | Partial (Globals) | Queued | Editorial transparency articles, field notes from grassroots volunteer drives, structured reading cards with tabular dates. | *Queued* |

---

## 3. Product Area 2: Opportunity Discovery (2 Source Routes — Batch 2 Focus)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Batch 2 Loaded References | Batch 2 Applied Contribution | Specific Architectural Composition | QA Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- | :---: |
| `/opportunities` | **Opportunities Catalogue** | **WS1:** `design-taste-frontend`, `impeccable`, `better-interface`<br>**WS2:** `better-layout`, `apple-design`<br>**WS3:** `better-colors`, `better-typography`, `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility`, `fluid-interface-design`<br>**WS6:** `unslop`, `hallmark`, `design-review` | Yes | Yes | Yes | `shoot.mjs`<br>`grouping-and-alignment.md`<br>`contrast.md`<br>`spacing-and-sizing.md`<br>`surfaces.md`<br>`patterns.md`<br>`checklist.md` | **Yes:** Dual view modes (**Cards Grid** vs **Ledger Table**); sticky multi-faceted filter sidebar; mobile slide-over drawer; client-side pagination (8/page); real-time multi-term search. | Two-column desktop layout with sticky sidebar; responsive table encapsulation preventing horizontal blowout; zero AI slop; authentic civic tone. | **Fully Verified & Screen-Captured (Batch 2)** |
| `/opportunities/[id]` | **Opportunity Detail Dossier** | **WS1:** `design-taste-frontend`, `impeccable`, `better-interface`<br>**WS2:** `better-layout`, `apple-design`<br>**WS3:** `better-colors`, `better-typography`, `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility`<br>**WS6:** `unslop`, `hallmark`, `design-review` | Yes | Yes | Yes | `forms.md`<br>`focus-and-keyboard.md`<br>`hit-areas.md`<br>`surfaces.md`<br>`patterns.md`<br>`checklist.md` | **Yes:** Civic dossier header with verified NGO badge; 6-metric specification matrix; required skills chips; 5-state Participation Console with 10-char pitch validation and receipt review. | Inset grouped card containers; high-legibility tabular metadata; accessible `<details>` statement drawer; zero fabricated stats. | **Fully Verified & Screen-Captured (Batch 2)** |

---

## 4. Product Area 3: Authentication & Onboarding (5 Source Routes)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Status | Page Purpose & Specific Architectural Composition |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/login` | **Member Portal Login** | **WS1:** `impeccable`, `better-interface`<br>**WS3:** `better-ui`, `better-colors`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility`<br>**WS6:** `unslop` | Yes | Yes | Yes | **Completed & Verified (Batch 3)** | Two-column architectural card; Navy `#0C4A6E` role overview dossier; pure white auth form; role-aware redirect; 3-option Google OAuth role selector pills; show/hide password toggle. |
| `/auth/callback` | **OAuth Callback Processing** | **WS1:** `better-interface`<br>**WS3:** `better-ui`<br>**WS5:** `fluid-interface-design` | Yes | Yes | Yes | **Completed & Verified (Batch 3)** | Cryptographic token exchange ledger card; 3-step live status ledger; animated Azure spinner; accessible error alert with remediation actions; token exchange cleanup. |
| `/signup/volunteer` | **Volunteer Onboarding** | **WS1:** `impeccable`<br>**WS2:** `better-layout`<br>**WS3:** `better-colors`, `better-typography`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 3)** | Volunteer Impact Passport layout; Navy dossier with 3 service highlights (Credits, Certificates, Mentorship); `minLength={8}` password validation; 44px touch targets; optional phone & city. |
| `/signup/organisation`| **Organisation Registration**| **WS1:** `design-taste-frontend`, `impeccable`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 3)** | Institutional Partner Charter layout; NGO Darpan/80G verification notice; dual-call API orchestration (`signup` then `createMyOrganisation`); `minLength={8}` password enforcement; authorized contact fields. |
| `/signup/mentor` | **Mentor Registration** | **WS1:** `impeccable`<br>**WS3:** `better-colors`, `better-typography`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 3)** | Civic Advisory Council dossier; domain advisory highlights (1-on-1 Guidance, Autonomous Cadence, Endorsement); strict validation; transparent onboarding redirection to `/mentorship/profile`. |

---

## 5. Product Area 4: Volunteer Workspace (8 Source Routes)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Status | Page Purpose & Specific Architectural Composition |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/volunteer` | **Volunteer Hub** | **WS1:** `better-interface`<br>**WS2:** `better-layout` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Preserved canonical server redirect to `/volunteer/dashboard`. |
| `/volunteer/dashboard`| **Impact Dashboard** | **WS1:** `design-taste-frontend`, `impeccable`<br>**WS2:** `better-layout`, `apple-design`<br>**WS3:** `better-colors`, `better-typography`<br>**WS4:** `better-writing`<br>**WS6:** `unslop`, `design-review` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Architectural Civic Ledger header banner (Deep Azure/Navy); verified civic contributor badge; 4-stat metric cards (tabular-nums); profile completion bar with actionable checklist; recent drives feed; quick actions. |
| `/volunteer/applications`|**Applications Ledger**| **WS1:** `impeccable`, `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`, `better-colors`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Chronological application ledger; 4 metric summary counters; 5 filter tab pills with count badges; instant search input with clear trigger; redesigned `ApplicationCard` with next-step guidance and pitch accordion. |
| `/volunteer/badges` | **Badges & Honours** | **WS1:** `design-taste-frontend`<br>**WS3:** `better-ui`, `better-colors`<br>**WS4:** `better-writing`<br>**WS6:** `unslop` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Civic Standing card with 4 tiers (Newcomer, Helper, Champion, Legend) with SVG seals; tier progress bar; 3 filter tabs (All, Unlocked, In Progress); monochromatic badge shelf; point transactions ledger. |
| `/volunteer/certificates`|**Verified Certificates**| **WS1:** `design-taste-frontend`, `hallmark`<br>**WS3:** `better-typography`, `better-ui`<br>**WS4:** `better-writing` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Accredited digital certificate dossier cards; verified completion seals; completed date, hours, certificate ID (`LFV-...`); instant PDF download trigger (`api.downloadCertificatePdf`) with loading indicator. |
| `/volunteer/leaderboard`|**Civic Leaderboard** | **WS1:** `impeccable`, `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-typography`, `better-colors`<br>**WS6:** `unslop` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Dignified podium layout for Top 3 (Civic Champion, Runner Up, 3rd Place) with laurels/crowns; searchable ranking table with tabular numbers; active user highlight row with "You" badge; 30s live auto-refresh. |
| `/volunteer/profile` | **Volunteer Profile** | **WS1:** `impeccable`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Two-state profile dossier (View mode vs Edit mode); completeness progress score; architectural header with avatar and star rating; contact metadata grid with Lucide icons; skills tag editor; private R2 resume & portfolio upload. |
| `/volunteer/reviews` | **Organisation Reviews**| **WS1:** `better-interface`<br>**WS3:** `better-typography`, `better-colors`<br>**WS4:** `better-writing` | Yes | Yes | Yes | **Completed & Verified (Batch 4)** | Two-column feedback console; interactive 1-5 star review form with eligible completed drives validation (minimum 10 characters); review guidelines; submitted testimonials list with organisation ratings and blockquotes. |

---

## 6. Product Area 5: Organisation Workspace (3 Source Routes)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Status | Page Purpose & Specific Architectural Composition |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/organisation/dashboard`|**NGO Drive Dashboard**| **WS1:** `design-taste-frontend`, `impeccable`<br>**WS2:** `better-layout`<br>**WS3:** `better-colors`, `better-typography`<br>**WS4:** `better-writing`<br>**WS6:** `unslop`, `design-review` | Yes | Yes | Yes | **Completed & Verified (Batch 5)** | Architectural Civic Ledger header banner; 4 operational metrics; multi-step drive creation/edit modal; multi-faceted status filtering; expanded applicant drawer with state machine actions, verified hours modal, and volunteer review console. |
| `/organisation/admin` | **Governance & Admin** | **WS1:** `impeccable`, `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 5)** | True Dual-Role architecture: Platform Administration console for Trust Admins (`user.role === 'admin'`) with NGO verification desk, opportunity reviews, report resolutions, and civic audit trail; authoritative Governance Advisory Notice for NGO leads (`user.role === 'organisation'`). |
| `/organisation/profile`|**Organisation Dossier**| **WS1:** `impeccable`<br>**WS3:** `better-ui`, `better-colors`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | **Completed & Verified (Batch 5)** | Architectural identity header with Deep Azure banner; verified status badge with legal detail locking; resubmission trigger for rejected profiles; 3 overview metrics; legal registry details; private R2 PDF document upload with encrypted presigned URLs. |

---

## 7. Product Area 6: Mentorship Experience (2 Source Routes)

| Route | Page Name | Primary Workstreams & Assigned Skills | Installed | Discovered | Available | Status | Page Purpose & Specific Architectural Composition |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/mentorship` | **Mentors Directory** | **WS1:** `design-taste-frontend`, `impeccable`<br>**WS2:** `better-layout`<br>**WS3:** `better-colors`, `better-typography`, `better-ui`<br>**WS4:** `better-writing`<br>**WS6:** `unslop`, `hallmark` | Yes | Yes | Yes | *Queued* | Curated directory of civic and social sector mentors, domain filters, experience cards, session request triggers. |
| `/mentorship/profile` | **Mentor Profile & Booking**| **WS1:** `better-interface`<br>**WS2:** `better-layout`<br>**WS3:** `better-ui`<br>**WS4:** `better-writing`<br>**WS5:** `better-accessibility` | Yes | Yes | Yes | *Queued* | Detailed mentor background, areas of guidance, verified experience, structured session booking request form. |

---

## Total Source Inventory Summary
- **Public Experience:** 4
- **Opportunity Discovery:** 2
- **Authentication & Onboarding:** 5
- **Volunteer Workspace:** 8
- **Organisation Workspace:** 3
- **Mentorship Experience:** 2
- **Total Application Source Routes:** **24**
- **Next.js Static Generation Targets:** **27** (24 source routes + `/_not-found` + PPR server wrappers)
