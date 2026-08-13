# HealthPrint Technical Architecture

**Technology Stack, Component Responsibilities, and Data Flow**\
**Datavue HealthPrint \| Version 0.1 \| August 2026**

## 1. Purpose

This document describes the technical architecture of Datavue
HealthPrint, including the technology used at each stage of the current
document-generation workflow and the planned architecture for AI, batch
processing, persistence, and print/mail fulfillment.

## 2. Architecture Principles

-   Separate user interface, API, composition, rendering, storage, and
    external integrations.
-   Keep credentials and privileged integrations on the backend.
-   Use structured data as the source for document composition rather
    than hard-coded member content.
-   Fail explicitly when required data or template variables are
    missing.
-   Containerize services so development behavior is reproducible.
-   Introduce persistent infrastructure and asynchronous processing only
    where required by scale and production needs.
-   Treat AI as an assisted-authoring capability with human review, not
    an autonomous compliance authority.

## 3. Current Rebuilt MVP Architecture

The current working rebuild consists of a Next.js frontend and a FastAPI
backend. The backend uses Jinja2 to merge member/plan/change data into
HTML templates and WeasyPrint to convert the rendered HTML/CSS into PDF.
FastAPI exposes the generated file and the frontend displays it in a
browser PDF preview.

``` text
User Browser
    |
    v
Next.js + React + TypeScript
    |  HTTP multipart/FormData
    v
FastAPI REST API
    |
    v
Validation / Composition Input
    |
    v
Jinja2 Template Engine
    |
    v
Rendered HTML + CSS
    |
    v
WeasyPrint
    |
    v
PDF in backend/output
    |
    v
FastAPI StaticFiles (/pdfs)
    |
    v
Browser iframe PDF Preview
```

## 4. Technology Stack by Layer

  --------------------------------------------------------------------------
  Layer             Technology         Current Role       Status
  ----------------- ------------------ ------------------ ------------------
  Web UI            Next.js            Application        Current
                                       framework and      
                                       browser UI.        

  UI language       React + TypeScript Interactive        Current
                                       components, state, 
                                       typed frontend     
                                       code.              

  Styling           Tailwind CSS       Utility-based      Current
                                       application        
                                       styling.           

  API               FastAPI            HTTP API, routing, Current
                                       form handling,     
                                       validation         
                                       integration,       
                                       static PDF         
                                       serving.           

  Backend language  Python 3.12        Composition, API,  Current
                                       document           
                                       processing, future 
                                       AI/integrations.   

  Validation        FastAPI / Pydantic Request validation Current/Evolving
                                       and typed models.  

  Template engine   Jinja2             Merge structured   Current
                                       data into reusable 
                                       HTML templates.    

  Document layout   HTML + CSS         Print-oriented     Current
                                       source             
                                       representation.    

  PDF renderer      WeasyPrint         Convert HTML/CSS   Current
                                       into PDF.          

  Local PDF storage `backend/output`   Temporary/local    Current MVP only
                    filesystem         generated PDF      
                                       storage.           

  PDF delivery      FastAPI            Expose generated   Current MVP only
                    StaticFiles        PDFs under         
                                       `/pdfs`.           

  Containers        Docker             Package            Current
                                       frontend/backend   
                                       runtimes.          

  Local             Docker Compose     Start and network  Current
  orchestration                        development        
                                       services.          

  Source control    Git                Version            Current
                                       application and    
                                       template source.   

  AI                OpenAI API         SmartCompose       Planned for
                                       assisted drafting. rebuilt app

  Database          TBD                Jobs, metadata,    Future
                                       configuration,     
                                       audit,             
                                       users/tenants.     

  Object storage    TBD                Durable generated  Future
                                       documents and      
                                       source artifacts.  

  Queue/workers     TBD                Asynchronous batch Future
                                       generation and     
                                       integration work.  

  Authentication    TBD                Enterprise         Future
                                       identity and RBAC. 

  Print/mail API    TBD                Physical           Future
                                       fulfillment and    
                                       mail tracking.     

  Observability     TBD                Centralized logs,  Future
                                       metrics, tracing,  
                                       alerts.            
  --------------------------------------------------------------------------

## 5. Frontend Architecture

The frontend is a Next.js application using React and TypeScript. The
rebuilt application uses the App Router. The current page collects
member/plan fields and change data, submits multipart FormData to the
backend, receives the generated PDF URL, and renders the PDF in an
iframe.

-   Development port: `3000`.
-   Browser-facing backend URL in local development:
    `http://localhost:8000`.
-   `NEXT_PUBLIC_API_URL` is intended to externalize the browser API
    base URL.
-   Frontend code must not contain OpenAI, print/mail, database, or
    other privileged API secrets.
-   Planned UI modules: Documents, Batch Jobs, Templates, Mailings,
    SmartCompose, Administration.

## 6. Backend/API Architecture

FastAPI provides the service boundary for document generation. The
current API includes a health endpoint and a `generate_pdf` endpoint.
CORS allows the local Next.js origin to call the backend. Generated PDFs
are exposed through a mounted StaticFiles path during MVP development.

  ------------------------------------------------------------------------
  Endpoint                Method                  Purpose
  ----------------------- ----------------------- ------------------------
  `/health`               GET                     Basic application health
                                                  check.

  `/generate_pdf`         POST                    Accept document data,
                                                  validate change JSON,
                                                  invoke
                                                  composition/rendering,
                                                  return PDF metadata.

  `/pdfs/{filename}`      GET                     Serve generated PDF from
                                                  local output directory
                                                  in the MVP.
  ------------------------------------------------------------------------

## 7. Document Composition Pipeline

1.  The user enters member, plan, coverage-year, template, and change
    information in Next.js.
2.  The frontend converts the form into FormData and sends
    `POST /generate_pdf`.
3.  FastAPI validates required form fields and parses `changes_json`.
4.  The PDF generator selects the requested Jinja2 template.
5.  Jinja2 merges structured data into HTML and CSS.
6.  `StrictUndefined` causes missing referenced template values to fail
    instead of silently rendering blank content.
7.  WeasyPrint renders the composed HTML/CSS into a PDF.
8.  The MVP stores the file in `backend/output`.
9.  FastAPI returns `pdf_path`, `pdf_url`, and `filename`.
10. The browser loads the returned `/pdfs` URL in an iframe for preview.

## 8. Template Technology

Templates are HTML files interpreted by Jinja2. They can contain scalar
variables such as `member_name`, `plan_name`, `member_id`, `year`, and
contact information, as well as loops for repeating changes. CSS
provides page size, margins, typography, tables, and print layout.

-   Current template directory: `app/templates/clients`.
-   Template selection is currently supplied by `template_name`.
-   The current example is `sample_anoc.html`.
-   Future template management should move metadata/version/status into
    persistent storage while retaining controlled template source.
-   Production template selection must prevent arbitrary filesystem
    access and should use an approved-template registry.

## 9. PDF Rendering

WeasyPrint converts rendered HTML/CSS to PDF. The backend container
includes the Linux libraries required for font/layout rendering. This
approach keeps the composition model web-like while producing
print-oriented PDF output.

-   Current page format is configured through CSS `@page` rules.
-   The generator sanitizes member-derived filenames.
-   `base_url` is supplied to WeasyPrint so local assets can be
    resolved.
-   Production should use durable object storage rather than
    container/local filesystem as the system of record.

## 10. Docker and Local Development

Docker packages the Python and Node runtimes, and Docker Compose
coordinates the frontend and backend services.

  Service    Container Runtime         Host Port   Container Port
  ---------- ----------------------- ----------- ----------------
  frontend   Node.js                        3000             3000
  backend    Python 3.12 / Uvicorn          8000             8000

-   The backend source is mounted into `/app` during local development.
-   The frontend source is mounted into `/app` and `node_modules` is
    maintained in a Docker volume.
-   The browser uses `localhost:8000`; Docker service names such as
    `backend` are only resolvable inside the Docker network.
-   A production build should use optimized Next.js and backend images
    rather than development servers and source mounts.

## 11. Planned SmartCompose Architecture

``` text
HealthPrint UI
    |
    v
FastAPI SmartCompose endpoint
    |
    +--> Prompt policy / controlled instructions
    |
    v
OpenAI API
    |
    v
Suggested member-facing language
    |
    v
User review/edit
    |
    v
Structured change data
    |
    v
Normal document generation pipeline
```

-   `OPENAI_API_KEY` must exist only in backend secret configuration.
-   AI suggestions should never bypass user review/approval.
-   Production design should define whether PHI may be sent to the
    selected AI service and under what contractual/configuration
    controls.
-   Prompt/version metadata may need to be recorded for reproducibility
    and auditability.

## 12. Planned Batch Architecture

``` text
CSV Upload
   |
   v
Validation / Normalization
   |
   v
Batch Job Record
   |
   v
Queue --------------------> Worker(s)
                              |
                              v
                       Composition Engine
                              |
                              v
                         PDF/Object Store
                              |
                              v
                        Job Result Status
```

The current application does not yet implement this queue/worker
architecture. It is recommended for production batch workloads so large
files do not tie up a web request and failures can be retried
independently.

## 13. Planned Print and Mail Architecture

``` text
Approved PDF + Mailing Metadata
              |
              v
      HealthPrint Backend
              |
              v
     Print/Mail Provider API
              |
        Provider Job ID
              |
              v
  Webhook / Status Polling
              |
              v
 HealthPrint Mailing Status
              |
              v
 Operations / Audit Dashboard
```

The provider is intentionally TBD. Selection should consider API
quality, healthcare/PHI handling, contractual requirements, address
verification, mail classes, tracking, webhooks, SLAs, pricing, and
operational support.

## 14. Production Data Architecture --- Proposed

  -----------------------------------------------------------------------
  Data Domain                         Likely Storage Need
  ----------------------------------- -----------------------------------
  Plans / customers / configuration   Relational database

  Templates and versions              Relational metadata plus controlled
                                      template/object storage

  Generation jobs and statuses        Relational database

  Generated PDFs                      Durable encrypted object storage

  Batch source files                  Controlled object storage with
                                      retention rules

  Audit events                        Append-oriented durable
                                      store/database

  Mailing provider identifiers/status Relational database

  Secrets                             Cloud/enterprise secrets manager,
                                      not database plaintext or source
                                      control
  -----------------------------------------------------------------------

## 15. Security and Compliance Considerations

-   Use TLS/HTTPS for all production traffic.
-   Store secrets in a dedicated secrets mechanism; never commit `.env`
    files or keys.
-   Apply authentication, RBAC, least privilege, and tenant isolation
    before production use.
-   Encrypt sensitive data at rest and in transit according to the
    production environment and customer requirements.
-   Minimize PHI in logs, URLs, filenames, AI prompts, and error
    messages.
-   Define retention/deletion rules for generated PDFs and batch inputs.
-   Record audit events for sensitive production actions.
-   Conduct threat modeling, dependency scanning, vulnerability
    management, backup/restore testing, and incident-response planning.
-   HIPAA readiness requires more than software libraries: business
    associate agreements, policies, operational safeguards, access
    controls, risk analysis, and other applicable requirements must be
    addressed.

## 16. Current Repository Layout

``` text
datavue-healthprint/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |   `-- routes.py
|   |   |-- pdf/
|   |   |   `-- generator.py
|   |   |-- templates/
|   |   |   `-- clients/
|   |   |       `-- sample_anoc.html
|   |   `-- main.py
|   |-- output/
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- app/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- public/
|   |-- package.json
|   |-- Dockerfile
|   `-- .dockerignore
|-- docker-compose.yml
|-- .gitignore
`-- .env (local only; must not be committed)
```

## 17. Technology Decisions Still TBD

-   Cloud hosting platform and production container orchestration.
-   Relational database.
-   Object storage.
-   Authentication/identity provider.
-   Background queue and worker framework.
-   Print/mail provider.
-   Centralized logging/monitoring stack.
-   Secrets manager.
-   CI/CD platform and environment promotion model.
-   Multi-tenant isolation model.
-   Production AI model(s), data controls, and governance.
-   Electronic approval/sign-off implementation.

## 18. Recommended Next Technical Milestones

1.  Build the full HealthPrint application shell and structured change
    editor.
2.  Introduce shared typed API contracts and stronger Pydantic request
    models.
3.  Reintroduce SmartCompose behind a backend-only OpenAI integration.
4.  Add a persistent database and explicit document/job model.
5.  Implement CSV validation and asynchronous batch processing.
6.  Move generated documents to durable object storage.
7.  Add authentication, RBAC, audit events, and tenant boundaries.
8.  Implement template versioning and approval controls.
9.  Evaluate and integrate a print/mail provider.
10. Add production observability, CI/CD, backup/DR, and security
    hardening.
