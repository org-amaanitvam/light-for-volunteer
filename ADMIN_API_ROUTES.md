# Admin API Routes

Base path: `/admin`

All routes require authentication unless marked **Public**. Routes
marked **Admin** require the `admin` role.

## Health Check

  -----------------------------------------------------------------------
  Method            Route             Access            Description
  ----------------- ----------------- ----------------- -----------------
  GET               `/admin/ping`     Public            Checks whether
                                                        the admin module
                                                        is available.

  -----------------------------------------------------------------------

## Organisation Management

  ------------------------------------------------------------------------------------------------------
  Method            Route                                            Access            Description
  ----------------- ------------------------------------------------ ----------------- -----------------
  GET               `/admin/organisations/pending`                   Admin             Returns
                                                                                       organisations
                                                                                       awaiting
                                                                                       verification.

  GET               `/admin/organisations/:id/documents`             Admin             Returns a
                                                                                       time-limited
                                                                                       signed download
                                                                                       URL for the
                                                                                       organisation's
                                                                                       verification
                                                                                       document.

  PATCH             `/admin/organisations/:id/approve`               Admin             Approves an
                                                                                       organisation. No
                                                                                       request body is
                                                                                       required.

  PATCH             `/admin/organisations/:id/reject`                Admin             Rejects an
                                                                                       organisation with
                                                                                       a reason.

  PATCH             `/admin/organisations/:id/request-information`   Admin             Requests
                                                                                       additional
                                                                                       information from
                                                                                       an organisation
                                                                                       with a reason.
  ------------------------------------------------------------------------------------------------------

### Organisation route details

-   `:id` is the organisation UUID.
-   The reject and request-information endpoints accept a JSON body:

``` json
{
  "reason": "Please provide a valid organisation registration certificate."
}
```

-   The reason is validated as a string with a minimum length of 10 and
    a maximum length of 1000 characters (subject to the DTO being
    named/imported consistently as `ReviewOrganisationDto`).
-   The current `VerificationStatus` enum contains `pending`,
    `verified`, and `rejected`. A request for information therefore
    leaves the organisation in `pending` unless a separate status is
    added.

## Opportunity Management

  -------------------------------------------------------------------------------------------------
  Method            Route                               Access            Description
  ----------------- ----------------------------------- ----------------- -------------------------
  GET               `/admin/opportunities/pending`      Admin             Returns opportunities
                                                                          awaiting review.

  PATCH             `/admin/opportunities/:id/review`   Admin             Reviews an opportunity
                                                                          using
                                                                          `ReviewOpportunityDto`.
  -------------------------------------------------------------------------------------------------

## Report Management

  ----------------------------------------------------------------------------------------
  Method            Route                          Access            Description
  ----------------- ------------------------------ ----------------- ---------------------
  GET               `/admin/reports/pending`       Admin             Returns reports
                                                                     awaiting resolution.

  PATCH             `/admin/reports/:id/resolve`   Admin             Resolves a report
                                                                     using
                                                                     `ResolveReportDto`.
  ----------------------------------------------------------------------------------------

## Audit Logs

  ---------------------------------------------------------------------------
  Method            Route                 Access            Description
  ----------------- --------------------- ----------------- -----------------
  GET               `/admin/audit-logs`   Admin             Returns paginated
                                                            audit logs with
                                                            optional filters.

  ---------------------------------------------------------------------------

Supported query parameters in the controller:

  -----------------------------------------------------------------------
  Parameter                           Description
  ----------------------------------- -----------------------------------
  `page`                              Page number

  `limit`                             Number of records per page

  `action`                            Filter by audit action

  `entity_type`                       Filter by entity type (use this
                                      name in the controller/service to
                                      match the `AuditLog` entity)

  `admin_id`                          Filter by admin

  `from`                              Start date/time filter

  `to`                                End date/time filter
  -----------------------------------------------------------------------

Example:

``` text
GET /admin/audit-logs?page=1&limit=20&action=ORGANISATION_VERIFIED&entity_type=organisations
```

## Application Export

  --------------------------------------------------------------------------------------
  Method            Route                          Access            Description
  ----------------- ------------------------------ ----------------- -------------------
  GET               `/admin/applications/export`   Admin             Downloads
                                                                     application data as
                                                                     a CSV file. The
                                                                     controller sends it
                                                                     as an attachment
                                                                     named
                                                                     `applicants.csv`.

  --------------------------------------------------------------------------------------

## Notes

-   UUID route parameters are validated with NestJS `ParseUUIDPipe`.
-   Admin routes use the `@Roles('admin')` decorator.
-   The document endpoint must receive the full JWT payload
    (`@CurrentUser()`) because the storage service uses the user's role
    when authorising signed URL creation.
-   The CSV export endpoint uses `@CurrentUser('sub')` to identify the
    admin and record the export audit event.
-   The older `PATCH /admin/organisations/:id/verify` endpoint appeared
    in the shared controller code. It is omitted from the route list
    above because the separate approve, reject, and request-information
    routes are the intended review workflow. Remove or retain the old
    endpoint deliberately to avoid duplicate review paths.
-   These routes are documented from the controller code shared in the
    conversation. Confirm DTO field names and service behavior against
    the current source before treating this as a final API contract.
