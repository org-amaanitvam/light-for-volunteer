# Aryan — Opportunities & Search Index Sync Implementation Status

## Target Module & Scope
- **Assigned Tasks**: Opportunities module with CRUD, categories, status workflow (`Draft` → `Pending Review` → `Live` → `Closed`/`Rejected`), and search index sync.
- **Reference Spec**: Light For Volunteer Architecture & Tech Stack Plan (v1.0), Sections 7.2, 8.4, 9, 10, 14.

---

## Deliverables Summary

### 1. Categories Management & Discovery
- **Predefined standard social impact categories**:
  - Education & Literacy
  - Environment & Climate
  - Healthcare & Mental Health
  - Community Outreach
  - Animal Welfare
  - Women & Child Empowerment
  - Skill Development & Livelihood
  - Disaster Relief
  - Arts & Culture
  - Technology for Good
- **Endpoint**: `GET /api/opportunities/categories` (Public)
  - Returns standard and dynamic categories with real-time counts of `LIVE` opportunities.

---

### 2. Full Opportunities CRUD
- **Create Opportunity**: `POST /api/opportunities` (Guarded: `organisation`, `admin`)
  - Resolves / initializes the organisation record for the authenticated user.
  - Normalizes dual naming conventions (`skillsRequired` / `skills_required`, `locationType` / `location_type`, `pointsReward` / `points_reward`).
  - Sets initial status to `DRAFT` (or `PENDING_REVIEW` if requested).
  - Syncs search index if created as `LIVE` (admin).
  - Dispatches in-app notification when submitted for review.
- **Public & Filtered Listing**: `GET /api/opportunities` (Public)
  - RBAC visibility rules:
    - Public visitors and volunteers only see `LIVE` opportunities.
    - Organisation users can query their own listings across statuses.
    - Admins can query any status.
  - Rich faceted query parameters:
    - Keyword search (`search` or `q`) matching title, description, category, skills, city, organisation.
    - Filters: `category`, `type`, `locationType` / `location_type`, `city`, `skills`, `orgId` / `organisationId`.
    - Sorting: `newest` (created_at DESC), `deadline_soon` (deadline ASC), `points` (points_reward DESC).
    - Pagination: `page`, `limit` (with total, totalPages, hasNextPage, hasPreviousPage).
  - Dual field serialization: includes both camelCase and snake_case properties plus `org` name for seamless frontend compatibility (Sakshi, Navya, Sai).
- **Single Opportunity Detail**: `GET /api/opportunities/:id` (Public)
  - Public for `LIVE` listings; guarded for `DRAFT`, `PENDING_REVIEW`, `CLOSED`, `REJECTED` (accessible only by creator organisation or admin).
  - Enriches response with application count and organisation details.
- **Organisation Listings & Metrics**: `GET /api/opportunities/mine` & alias `/my` (Guarded: `organisation`)
  - Returns all opportunities posted by the current organisation with applicant breakdown stats (`total`, `applied`, `shortlisted`, `selected`, `completed`, `rejected`).
- **Update Listing**: `PATCH /api/opportunities/:id` (Guarded: Owner organisation or admin)
  - Verifies ownership and updates fields.
  - Automatically synchronizes search index.
- **Delete Listing**: `DELETE /api/opportunities/:id` (Guarded: Owner organisation or admin)
  - Safety check against deleting live opportunities with active applications.
  - Removes opportunity from database and search index.

---

### 3. Status Workflow Engine
- **Workflow State Machine**:
  $$\text{Draft} \longrightarrow \text{Pending Review} \overset{\text{Admin Review}}{\longrightarrow} \begin{cases} \text{Live} \longrightarrow \text{Closed} \longrightarrow \text{Reopen} \\ \text{Rejected} \longrightarrow \text{Resubmit} \end{cases}$$
- **Endpoints**:
  - `POST /api/opportunities/:id/submit` (alias: `/submit-review`):
    - Transitions `DRAFT` / `REJECTED` $\to$ `PENDING_REVIEW`.
    - Validates completeness of required fields and non-expired deadline.
    - Dispatches in-app notification to organisation.
  - `POST /api/opportunities/:id/close`:
    - Transitions `LIVE` / `PENDING_REVIEW` $\to$ `CLOSED`.
    - De-indexes from search index.
  - `POST /api/opportunities/:id/reopen`:
    - Transitions `CLOSED` $\to$ `PENDING_REVIEW` (or `DRAFT` if deadline passed).
  - `PATCH /api/opportunities/:id/status`:
    - Direct status update endpoint validating allowed state transitions.
  - Integrated with Sourav's moderation queue (`PATCH /api/admin/opportunities/:id/review`):
    - Approving sets status to `LIVE` $\to$ automatically indexed in search engine.
    - Rejecting sets status to `REJECTED` $\to$ automatically removed from search index.

---

### 4. Search Index Sync Module (`backend/api/src/modules/search`)
- **Fast Faceted Discovery**:
  - In-memory indexed search engine with tokenized full-text scoring:
    - Weighted relevance: Title ($15\times$), Skills ($5\times$), Category ($4\times$), Org ($3\times$), City ($2\times$), Description ($1\times$).
    - Facet aggregations calculated dynamically for `categories`, `types`, and `locationTypes`.
- **Search Index Syncing Hooks**:
  - `syncOpportunity(opp)`: Upserts `LIVE` listings into search store.
  - `removeOpportunity(id)`: Removes non-live/deleted listings from search store.
  - `reindexAll()`: Rebuilds search index on startup or on-demand from PostgreSQL `Opportunity` repository.
  - `OpportunitySubscriber`: TypeORM event subscriber automatically catching all entity mutations across any service and updating search index.
  - Pluggable external sync hooks for **Elasticsearch** (`ELASTICSEARCH_NODE`) and **Algolia** (`ALGOLIA_APP_ID`, `ALGOLIA_API_KEY`) when configured.
- **Search Endpoints**:
  - `GET /api/search/opportunities`: Public faceted search endpoint.
  - `GET /api/search/facets`: Aggregate counts across categories, types, and locations.
  - `POST /api/search/reindex`: Admin-only endpoint to trigger full reindex.

---

### 5. Shared Contracts & Frontend Client Integration
- **`@lfv/types`**:
  - `OpportunityType`: `'Internship' | 'Volunteering' | 'Challenge' | 'Fellowship' | 'Event'`
  - `LocationType`: `'On-site' | 'Remote' | 'Hybrid'`
  - `OpportunityStatus`: `'draft' | 'pending_review' | 'live' | 'closed' | 'rejected'`
  - TypeScript interfaces: `OpportunityData`, `CreateOpportunityPayload`, `UpdateOpportunityPayload`, `OpportunitySearchParams`.
- **`apps/web/src/lib/api.ts`**:
  - Added frontend helper methods: `getOpportunities()`, `getOpportunityById()`, `getOpportunityCategories()`, `getMyOpportunities()`, `createOpportunity()`, `updateOpportunity()`, `deleteOpportunity()`, `submitOpportunityForReview()`, `closeOpportunity()`, `reopenOpportunity()`, `searchOpportunities()`, `getSearchFacets()`.

---

### 6. Database Migration
- **`1760200000000-CreateOrganisationsAndOpportunities.ts`**:
  - Creates PostgreSQL enums: `opportunity_type_enum`, `location_type_enum`, `opportunity_status_enum`, `verification_status_enum`.
  - Creates `organisations` and `opportunities` tables with foreign keys and cascade delete rules.
  - Adds performance indexes on `status`, `category`, `type`, `location_type`, `deadline`, and `org_id`.

---

### 7. Automated Test Suite
- **`backend/api/test/opportunities.e2e-spec.ts`**:
  - Health pings for opportunities and search.
  - Categories discovery verification.
  - DRAFT creation by organisation and isolation from public visitors.
  - Submission for review (`DRAFT` $\to$ `PENDING_REVIEW`).
  - Admin approval (`PENDING_REVIEW` $\to$ `LIVE`).
  - Search index sync and faceted search verification.
  - Update, mine listings with metrics, closure, reopen, and deletion.
