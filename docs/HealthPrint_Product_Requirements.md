# HealthPrint Product Requirements

**Product Requirements Document (PRD)**\
**Datavue HealthPrint \| Version 0.1 \| August 2026**

## 1. Document Purpose

This document defines the product requirements for Datavue HealthPrint,
a healthcare document composition, generation, review, batch-processing,
and delivery platform. It separates capabilities already demonstrated in
the rebuilt MVP from planned and future capabilities.

## 2. Product Vision

HealthPrint is intended to provide health plans and healthcare
organizations with an end-to-end workflow for composing member-facing
regulated documents, applying member and plan data, reviewing generated
output, producing PDFs at scale, and ultimately coordinating print and
mail fulfillment with traceability.

## 3. Problem Statement

-   Healthcare member communications can require large volumes of plan-
    and member-specific documents.
-   Manual document assembly creates opportunities for incorrect values,
    inconsistent language, missed changes, and rework.
-   Compliance and operations teams need repeatable templates,
    controlled content, validation, review, and auditability.
-   Document generation and print/mail fulfillment are often separate
    workflows, reducing end-to-end visibility.
-   Teams need a controlled way to use AI assistance without bypassing
    review or compliance controls.

## 4. Target Users

  -----------------------------------------------------------------------
  User / Persona                      Primary Need
  ----------------------------------- -----------------------------------
  Compliance / Regulatory             Accurate, controlled, reviewable
                                      member communications and evidence
                                      of what was produced.

  Member Communications               Efficient composition, template
                                      reuse, preview, and batch
                                      generation.

  Operations                          Reliable high-volume generation,
                                      job monitoring, exception handling,
                                      and delivery status.

  Plan Administrator                  Manage templates, plan
                                      configuration, users, permissions,
                                      and operational settings.

  Reviewer / Approver                 Compare, review, approve, or reject
                                      documents and changes before
                                      release.
  -----------------------------------------------------------------------

## 5. Product Scope and Status

  -----------------------------------------------------------------------
  Capability              Status                  Description
  ----------------------- ----------------------- -----------------------
  Single document         Current MVP             Generate a PDF from
  generation                                      member, plan,
                                                  coverage-year, and
                                                  change data.

  HTML/Jinja document     Current MVP             Merge structured data
  templates                                       into reusable HTML/CSS
                                                  templates.

  PDF rendering           Current MVP             Render composed HTML
                                                  into PDF using
                                                  WeasyPrint.

  Browser PDF preview     Current MVP             Preview the generated
                                                  PDF from the web
                                                  application.

  Dockerized              Current MVP             Run Next.js and FastAPI
  frontend/backend                                services through Docker
                                                  Compose.

  Structured change       Planned                 Replace raw JSON entry
  editor                                          with an
                                                  end-user-friendly
                                                  change editor.

  SmartCompose AI         Planned                 Assist users in
                                                  drafting member-facing
                                                  change language.

  CSV batch generation    Planned                 Generate documents for
                                                  multiple members from
                                                  batch input.

  Template management     Planned                 Create, version,
                                                  activate, retire, and
                                                  assign templates.

  Job/history dashboard   Planned                 Track generation jobs,
                                                  outputs, failures,
                                                  timestamps, and status.

  Print/mail integration  Planned                 Submit approved
                                                  documents to a
                                                  print/mail provider and
                                                  track status.

  Enterprise              Future/TBD              Authentication,
  authentication/RBAC                             authorization, and
                                                  role-based access.

  Persistent              Future/TBD              Persist configurations,
  database/object storage                         jobs, documents,
                                                  metadata, and audit
                                                  events.
  -----------------------------------------------------------------------

## 6. Functional Requirements

### 6.1 Single Document Generation

-   The system shall allow a user to enter member name, member ID, plan
    name, effective/start date, coverage year, contact number, website,
    and template.
-   The system shall accept one or more plan/document changes.
-   The system shall validate required input before document generation.
-   The system shall generate a PDF using the selected template and
    submitted data.
-   The system shall return a usable document URL and filename.
-   The UI shall display the generated PDF in an embedded preview.
-   Generation errors shall be displayed to the user without exposing
    secrets or internal stack traces.

### 6.2 Change Management

-   The user shall be able to add, edit, reorder, and remove individual
    changes.
-   A change shall support at minimum: page/section, original
    information, corrected information, and member impact.
-   The UI shall serialize the change collection into the backend
    request format.
-   The system shall reject malformed change data rather than silently
    omitting it.
-   Future validation may enforce document-specific rules and required
    fields.

### 6.3 Template Management

-   Templates shall support plan/member variables and repeatable change
    sections.
-   Templates shall support print-oriented HTML/CSS styling.
-   Planned template management shall support document type, plan,
    coverage year, version, status, effective dates, and branding.
-   Only approved/active template versions should be available for
    production generation.
-   Template changes should be versioned and auditable.

### 6.4 SmartCompose AI

-   SmartCompose shall accept a user description of a benefit, coverage,
    or document change.
-   AI output shall be presented as a suggestion and shall require user
    review before insertion or publication.
-   The system should support controlled prompts and configurable
    writing guidance.
-   AI-generated content shall not be treated as automatically compliant
    or approved.
-   Future controls should include prompt/output logging policies,
    redaction rules, model configuration, and approval workflow.

### 6.5 Batch Generation

-   The system shall allow upload of a supported batch file such as CSV.
-   The batch process shall validate file structure and required columns
    before generation.
-   Each row/member shall have an independently traceable generation
    result.
-   The system shall distinguish successful, failed, and skipped
    records.
-   Users shall be able to obtain a batch summary and access generated
    output.
-   Large jobs should ultimately execute asynchronously rather than
    blocking a web request.

### 6.6 Document History and Jobs

-   The platform should maintain a history of document generation
    activity.
-   History should include document type, template/version, plan,
    coverage year, creation time, user, status, and output reference.
-   Batch jobs should expose counts for total, processing, completed,
    and failed records.
-   Users should be able to inspect errors and retry eligible failures.
-   Retention requirements shall be configurable according to customer
    and compliance requirements.

### 6.7 Print and Mail

-   Approved documents should be eligible for submission to a configured
    print/mail provider.
-   The system should transmit the document and required mailing
    metadata through a provider API.
-   Provider credentials shall be stored as secrets and never exposed to
    the browser.
-   HealthPrint should retain the provider job/mail-piece identifier.
-   The platform should display available lifecycle statuses such as
    submitted, processing, printed, mailed, delivered, or returned.
-   Provider selection remains TBD and requires security, privacy,
    contractual, and healthcare compliance review.

### 6.8 Administration

-   Administrators should be able to manage plans, templates, document
    types, configuration, and integrations.
-   Future enterprise deployments should support user and role
    management.
-   Administrative changes should be auditable.
-   Production secrets and integration credentials shall not be editable
    or visible to unauthorized users.

## 7. Non-Functional Requirements

  -----------------------------------------------------------------------
  Area                                Requirement
  ----------------------------------- -----------------------------------
  Security                            Use HTTPS in deployed environments;
                                      keep secrets server-side; apply
                                      least privilege; validate and
                                      sanitize inputs.

  Privacy / PHI                       Architecture and operations must be
                                      reviewed for the specific PHI
                                      handled. Minimize data collection
                                      and exposure.

  HIPAA                               HealthPrint must not be marketed as
                                      HIPAA compliant solely because of
                                      technology choices; required
                                      administrative, technical,
                                      contractual, and operational
                                      controls must be established.

  Auditability                        Production workflows should record
                                      meaningful generation, template,
                                      approval, delivery, and
                                      administrative events.

  Performance                         Interactive single-document
                                      generation should provide timely
                                      feedback; batch work should be
                                      designed for asynchronous
                                      processing.

  Scalability                         Backend services and batch workers
                                      should be independently scalable as
                                      volume increases.

  Reliability                         Failures should be recoverable and
                                      should not silently produce
                                      incomplete documents.

  Accessibility                       The web UI should target
                                      WCAG-aligned accessible
                                      interaction; generated document
                                      accessibility requirements should
                                      be defined per document/customer.

  Maintainability                     Frontend, API, composition,
                                      templates, integrations, and
                                      infrastructure should remain
                                      modular.

  Observability                       Production deployment should
                                      include structured logging,
                                      metrics, alerting, and
                                      correlation/job identifiers.
  -----------------------------------------------------------------------

## 8. Roles and Permissions --- Proposed

  -----------------------------------------------------------------------
  Role                                Example Permissions
  ----------------------------------- -----------------------------------
  Administrator                       Configuration, templates,
                                      integrations, users/roles, all job
                                      visibility.

  Composer                            Create/edit document inputs and AI
                                      suggestions; generate previews.

  Reviewer/Approver                   Review documents and approve/reject
                                      controlled outputs.

  Operations                          Run/monitor batches, manage
                                      eligible retries, submit approved
                                      output to fulfillment.

  Read Only / Auditor                 View approved documents, job
                                      history, statuses, and audit
                                      information.
  -----------------------------------------------------------------------

## 9. Validation and Error Handling

-   Required fields must be validated at both UI and API layers.
-   Invalid JSON/structured change input must return a clear 4xx
    validation error.
-   Missing templates or undefined template variables must fail visibly
    rather than generating misleading blank content.
-   Batch validation errors should identify the affected row/record when
    possible.
-   External integration failures should be recorded with a
    retryable/non-retryable classification where feasible.
-   Sensitive values, API keys, and unnecessary PHI must not appear in
    user-facing errors or ordinary logs.

## 10. MVP Acceptance Criteria

1.  A user can open the HealthPrint web application.
2.  A user can enter member and plan information and at least one
    structured change.
3.  The frontend can submit the data to the FastAPI backend.
4.  The backend can render a selected Jinja2 HTML template.
5.  WeasyPrint can produce a valid PDF containing the supplied data.
6.  The backend can expose the generated PDF to the local application.
7.  The frontend can preview the resulting PDF.
8.  The frontend and backend can run together using Docker Compose.
9.  Invalid change data produces a clear validation error.

## 11. Phased Roadmap

  -----------------------------------------------------------------------
  Phase                               Scope
  ----------------------------------- -----------------------------------
  Phase 1 --- Rebuilt Core            Single document generation,
                                      templates, PDF rendering, preview,
                                      Dockerized application.

  Phase 2 --- Usability               Application navigation, structured
                                      change editor, improved validation
                                      and UX.

  Phase 3 --- Intelligence            SmartCompose AI with review
                                      controls and configurable prompts.

  Phase 4 --- Scale                   CSV batch generation, persistent
                                      jobs/history, asynchronous
                                      processing.

  Phase 5 --- Enterprise Content      Template/version management, plan
                                      configuration, approval workflow,
                                      RBAC.

  Phase 6 --- Fulfillment             Print/mail integration, status
                                      tracking, reconciliation,
                                      operational dashboards.

  Phase 7 --- Production Hardening    Cloud deployment, database/object
                                      storage, observability, security
                                      controls, backup/DR, formal
                                      compliance readiness.
  -----------------------------------------------------------------------

## 12. Open Decisions

-   Production cloud/provider and deployment model.
-   Relational database technology.
-   Object/document storage technology.
-   Authentication and identity provider.
-   Background job/queue technology.
-   Print and mail provider.
-   Customer tenancy model.
-   Formal approval workflow and electronic sign-off requirements.
-   Retention, archival, and deletion requirements.
-   Exact CMS/Medicare/Medicaid document types and rule sets to support
    first.
-   Production AI model, data-handling configuration, and governance
    controls.

## 13. Out of Scope for the Current Rebuilt MVP

The current rebuilt MVP does not yet provide production authentication,
persistent enterprise storage, formal compliance certification, approval
workflow, production batch processing, print/mail fulfillment, or
guaranteed regulatory validation. These are planned capabilities or open
architectural decisions.
