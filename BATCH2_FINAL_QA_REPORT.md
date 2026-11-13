# BATCH 2 FINAL QA & TARGETED AUDIT REPORT
## Opportunities Catalogue (`/opportunities`) & Opportunity Detail Dossier (`/opportunities/[id]`)

**Project:** Light for Volunteer  
**Visual Direction:** The Transparent Ledger — Crisp, Architectural, Civic Azure on White  
**Palette:** Strict White × Blue  
**Environment:** Google Antigravity IDE (Windows)  
**Date:** November 11, 2026  

---

## 1. Issues Discovered

During the targeted QA audit, five concrete issues were investigated and verified:

1. **Statement-of-Interest Validation Provenance:**
   - *Investigation:* Backend DTO (`backend/api/src/dtos/application/create-application.dto.ts`) validates `pitchText` with `@IsString()` and `@IsNotEmpty()`. The backend does **not** enforce a 10-character minimum length.
   - *Discovery:* Inspection of the original, pre-redesign frontend (`apps/web/src/app/opportunities/[id]/page.tsx` line 85) revealed that the original author explicitly specified `<textarea id="application-pitch" required minLength={10} maxLength={5000} ... />`.
   - *Finding:* The 10-character minimum is an established client-side UX requirement from the original application codebase to prevent blank or single-character accidental submissions; it is not enforced by the backend database or DTO.
2. **Participation Console State Precedence & API Failure Handling:**
   - *Discovery:* When `api.getMyApplications()` failed due to a network glitch or server outage, the console previously fell through to State D (Eligible Volunteer Form) rather than indicating that prior application status was unverified.
3. **Contrast Misconception on Hairline Dividers:**
   - *Discovery:* Borders using `#BAE6FD` against white have a contrast ratio of $1.33:1$. While suitable as subtle decorative surface dividers, they cannot serve as WCAG 2.1 AA 1.4.11 compliant indicators for essential interactive boundaries or focus states.
4. **Render-Phase Pagination State Adjustment:**
   - *Discovery:* Adjusting `currentPage` state conditionally during render via `prevFilterKey` introduced unnecessary React render cycles and potential state instability when filters changed.
5. **Route Inventory Count Discrepancy:**
   - *Discovery:* Static build target counts (27 targets) were previously conflated with source route counts (24 actual `page.tsx` files).

---

## 2. Corrections Made

1. **Replaced Render-Phase Pagination with Pure Derived State:**
   - Refactored `apps/web/src/app/opportunities/page.tsx` to derive `safePage = Math.min(Math.max(1, currentPage), totalPages)`. Clamping happens instantaneously during evaluation with zero cascading renders, eliminating `prevFilterKey` state and render-phase `setState` calls.
2. **Hardened Participation Console Error Handling:**
   - In `apps/web/src/app/opportunities/[id]/page.tsx`, added `appCheckError` state and `handleRetryCheck`. If querying `api.getMyApplications()` fails, the console presents an "Application Status Unverified" notice with a "Retry Status Check" action, preventing accidental duplicate submissions.
3. **Formalized State Precedence in Console State Machine:**
   - Locked in the priority sequence:
     1. Checking status (Skeleton pulse)
     2. Unverified status error (Retry notice)
     3. Already Applied Receipt (State C) — **Persists even after opportunity closes or reaches capacity**
     4. Opportunity Closed / Capacity Full (State E)
     5. Unauthenticated Visitor (State A)
     6. Authenticated Non-Volunteer (State B)
     7. Eligible Volunteer Application Form (State D)
4. **Corrected Contrast Classifications & Indicators:**
   - Confirmed that `#0369A1` ($5.93:1$) is the designated focus-visible and active indicator meeting WCAG AA ($\ge 3:1$ for non-text components). Confirmed `#BAE6FD` ($1.33:1$) is strictly a non-essential hairline decorative separator.
5. **Synchronized Documentation to 24 Source Routes:**
   - Updated `DESIGN_SKILL_REGISTRY.md`, `DESIGN_SKILL_WORK_ALLOCATION.md`, and `DESIGN_EXECUTION_MATRIX.md` to reflect the 24 verified source routes across 6 page families.

---

## 3. Tests Executed & Actual Results

| Test Category | Target / Condition | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Console State A** | Unauthenticated visitor navigating to `/opportunities/[id]` | Shows login and signup calls to action with `?next=` return URL | Rendered "Volunteer Account Required" with `/login` and `/signup/volunteer` actions | **PASSED** |
| **Console State B** | Authenticated as Organisation or Mentor | Disallows application submission, explains role restriction | Rendered "Role Notice: Signed in as [role]" without form controls | **PASSED** |
| **Console State C** | Volunteer with existing application on file | Displays application receipt with ID, date, status, and submitted pitch | Rendered `#app-8492`, status pill, and collapsible statement drawer | **PASSED** |
| **Console State D** | Eligible volunteer, first-time application | Displays textarea with character counter and submit button | Rendered controlled textarea with live count and validation feedback | **PASSED** |
| **Validation Feedback**| Input length $< 10$ characters on submit attempt | Prevents submission, displays inline error with icon | Displayed "Please enter at least 10 characters (X/10)" with `AlertCircle` | **PASSED** |
| **Console State E** | Closed opportunity, volunteer already applied | State C receipt takes precedence over State E closure | Receipt remains fully visible and trackable | **PASSED** |
| **Console State E** | Closed opportunity, visitor has not applied | Shows "Applications Unavailable" warning | Rendered "Applications Unavailable: Opportunity closed" with browse link | **PASSED** |
| **API Check Failure**| Failure loading user applications | Displays retry notice, prevents blank form display | Rendered "Application Status Unverified" with retry button | **PASSED** |
| **Catalogue Search** | Search input + Category filter + Location mode | Multi-term intersection filtering | Filtered cards and table to matching subset | **PASSED** |
| **Filter Reset** | Active filters clicked "Reset" | Clears all filters, resets safePage to 1 | Restored all opportunities and reset filter inputs | **PASSED** |
| **Dual View Mode** | Toggle between Cards Grid and Ledger Table | Switches composition without page reload or state loss | Seamless switch between card cards and structured table | **PASSED** |
| **Responsive Drawer**| Viewport $< 1024\text{px}$ clicking "Filters" | Slide-over filter drawer opens | Accessible mobile drawer with backdrop and close button | **PASSED** |
| **Pagination Clamping**| Filtering from 20 results (page 3) to 4 results | safePage automatically clamps to 1 | Instantly showed 4 items on page 1 of 1 without errors | **PASSED** |

---

## 4. Remaining Known Limitations

1. **Local Offline PostgreSQL Service:**
   - Because local Docker Desktop and PostgreSQL are not running on the development host, live API calls to `http://localhost:3001/api/opportunities` fail with `Failed to fetch`. The application gracefully catches this and renders the styled White × Blue error boundary with a "Retry Connection" action.
2. **Real Database Application Persistence:**
   - Application creation (`api.createApplication`) was tested and verified using client-side interception adhering strictly to the `ApplicationItem` contract. Full end-to-end database writes require starting the PostgreSQL container (`npm run db:up`).

---

## 5. Visual Evidence Artifacts & Screenshot Locations

All screenshots correspond to the current final code and are persisted in the artifacts directory. A complete ZIP archive has also been created:

- **Complete ZIP Archive:** `C:\Users\Anish\.gemini\antigravity\brain\4dca46ec-4e55-4cea-bc1f-9948c09a8ebd\batch2_visual_qa_evidence.zip` (4.64 MB)

### Individual Image Artifacts:
- **Catalogue Before (1440×900):** [batch2-catalogue-before-1440x900.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-before-1440x900.png)
- **Dossier Before (1440×900):** [batch2-dossier-before-1440x900.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-before-1440x900.png)
- **Catalogue Desktop (1440×900):** [batch2-catalogue-after-1440x900.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-after-1440x900.png)
- **Catalogue Laptop (1280×800):** [batch2-catalogue-1280x800.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-1280x800.png)
- **Catalogue Tablet (768×1024):** [batch2-catalogue-768x1024.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-768x1024.png)
- **Catalogue Mobile (390×844):** [batch2-catalogue-390x844.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-390x844.png)
- **Catalogue Narrow Mobile (320×800):** [batch2-catalogue-320x800.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-catalogue-320x800.png)
- **Dossier Desktop (1440×900):** [batch2-dossier-after-1440x900.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-after-1440x900.png)
- **Dossier Laptop (1280×800):** [batch2-dossier-1280x800.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-1280x800.png)
- **Dossier Tablet (768×1024):** [batch2-dossier-768x1024.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-768x1024.png)
- **Dossier Mobile (390×844):** [batch2-dossier-390x844.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-390x844.png)
- **Dossier Narrow Mobile (320×800):** [batch2-dossier-320x800.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/batch2-dossier-320x800.png)
- **State A: Unauthenticated Visitor:** [18-console-state-a-unauthenticated.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/18-console-state-a-unauthenticated.png)
- **State B: Authenticated Non-Volunteer:** [19-console-state-b-non-volunteer.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/19-console-state-b-non-volunteer.png)
- **State C: Already Applied Receipt:** [22-console-state-c-already-applied.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/22-console-state-c-already-applied.png)
- **State D: Eligible Volunteer Form:** [20-console-state-d-eligible-volunteer.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/20-console-state-d-eligible-volunteer.png)
- **State D: 10-Char Pitch Validation Feedback:** [21-console-state-d-validation.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/21-console-state-d-validation.png)
- **State C: Mobile Receipt (390×844):** [23-console-state-c-mobile-390.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/23-console-state-c-mobile-390.png)
- **State D: Mobile Volunteer Form (390×844):** [24-console-state-d-mobile-390.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/24-console-state-d-mobile-390.png)
- **State E: Closed / Capacity Full:** [17-opportunity-detail-capacity-reached.png](file:///C:/Users/Anish/.gemini/antigravity/brain/4dca46ec-4e55-4cea-bc1f-9948c09a8ebd/17-opportunity-detail-capacity-reached.png)

---

## 6. Updated Skill Application Evidence

| Workstream | Skills | Concrete Evidence in Final Code |
| :--- | :--- | :--- |
| **WS1: Governance** | `design-taste-frontend`, `impeccable`, `better-interface` | Dual view mode (**Cards Grid** vs. **Ledger Table**); zero decorative gradients/blobs; strict White × Blue token discipline (`globals.css`); ranked information hierarchy. |
| **WS2: Architecture** | `better-layout`, `apple-design` | Two-column sticky sidebar; mobile slide-over drawer; table horizontal overflow containment; inset grouped card containers. |
| **WS3: Visual System**| `better-colors`, `better-typography`, `better-ui` | Tabular numbers (`.tabular-nums`) for dates, open seats, IDs; 16px minimum on mobile form controls; 1px hairline borders (`#bae6fd`); concentric radii (`rounded-2xl` $\rightarrow$ `rounded-xl`). |
| **WS4: Content** | `better-writing` | Authentic civic microcopy ("Civic Drives", "Participation Console", "Statement of Interest", "Application on File"). Zero fabricated statistics. |
| **WS5: Accessibility**| `better-accessibility`, `fluid-interface-design` | WCAG AA contrast ($5.93:1$ to $14.66:1$); `:focus-visible` ring `#0369a1` (2px offset); inline validation error alert linked with `aria-describedby`; $\ge 44\text{px}$ touch targets. |
| **WS6: Anti-Slop QA** | `unslop`, `hallmark`, `design-review` | Eradicated AI slop tells; enforced The Floor rules (declared tokens, `overflow-x: clip`, zero `transition: all`); multi-viewport visual review across 5 breakpoints. |

---

## 7. Final Git Change Inventory

### Modified Application Source Files (Batch 2):
- `apps/web/src/app/opportunities/page.tsx`
- `apps/web/src/app/opportunities/[id]/page.tsx`

### Synchronized Design Documentation:
- `DESIGN_SKILL_REGISTRY.md`
- `DESIGN_SKILL_WORK_ALLOCATION.md`
- `DESIGN_EXECUTION_MATRIX.md`
- `BATCH2_FINAL_QA_REPORT.md`

### Backend Integrity:
- `git diff --name-only backend/`: **Empty (0 files touched)**
- No controllers, entities, DTOs, migrations, or services were altered.

---

## 8. Engineering Verification Results

- **TypeScript Typecheck:** `npm run typecheck` $\rightarrow$ **0 errors** (code `0`).
- **Web Workspace Typecheck:** `npx tsc --noEmit --project apps/web/tsconfig.json` $\rightarrow$ **0 errors** (code `0`).
- **Frontend ESLint:** `npm run lint --workspace=web` $\rightarrow$ **0 errors, 11 warnings** (all 11 warnings are pre-existing in untouched files).
- **Next.js Production Build:** `npm run build --workspace=web` $\rightarrow$ **0 errors** (code `0`). All 27 static and partial prerender targets compiled cleanly.

---

## 9. Final Batch 2 Sign-Off Recommendation

Phase 2, Batch 2 is verified, tested, and complete. Both the Opportunities Catalogue and Opportunity Detail Dossier satisfy all anti-slop, architectural, accessibility, and functional criteria without modifying backend contracts.

**Recommendation:** Formally sign off Phase 2, Batch 2 and proceed to Batch 3.
