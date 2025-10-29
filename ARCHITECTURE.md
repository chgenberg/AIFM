# AIFM Agent Portal – Detailed Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PORTAL (Next.js 15)                     │
│  Client | Coordinator | Specialist | Admin                   │
│  (Clerk OAuth + RBAC)                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / API Routes
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND API (Next.js API Routes)                 │
│  /api/auth | /api/clients | /api/datafeeds | /api/webhooks  │
│  /api/tasks | /api/reports | /api/admin/health              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    PostgreSQL      Redis         S3/R2
    (Prisma)       (BullMQ)      (Evidence)
                       │
        ┌──────────────┴──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ ETL      │  │   AI     │  │ Reports  │
    │ Workers  │  │ Workers  │  │ Workers  │
    └──────────┘  └──────────┘  └──────────┘
        │              │              │
        ▼              ▼              ▼
    Fortnox        Recon.py       PDF/Excel
    Bank           Drafting       Rendering
    Allvue         Data QC
```

## Layer Breakdown

### 1. Frontend Portal (`apps/web`)

**Stack:** Next.js 15 App Router, React 18, TailwindCSS, Clerk

**Key Routes:**
```
/                          → Public landing / auth redirect
/auth                      → Clerk OAuth callback
/client/*                  → Client dashboard
  /datafeeds               → Configure Fortnox, Bank, etc.
  /uploads                 → CSV/XLSX uploader with validation
  /reports                 → View published reports
  /onboarding             → Investor KYC checklist
/coordinator/*            → Data QC workflows
  /inbox                  → Task queue (NEEDS_REVIEW)
  /diff-viewer            → Bank vs GL side-by-side
  /kyc-panel              → Investor risk assessment
/specialist/*            → Report delivery
  /board                  → Kanban (Draft → QC → Approval → Pub)
  /[reportId]/edit        → Rich text editor + versioning
  /[reportId]/sign-off    → 2-stage attest + e-sign
/admin/*                 → Monitoring & migrations
  /health                 → Queue status, DB checks
  /logs                   → Audit trail
  /migrations             → Pending migration safety check
```

**Authentication & RBAC:**
- Clerk OAuth (+ Magic Link fallback)
- Middleware: `auth.middleware.ts` checks JWT + role
- Row-level policies enforced in API (client-scoped data)

**UI Components:**
- `DiffViewer`: Side-by-side ledger reconciliation
- `ReportEditor`: Rich text (MDX/TipTap) with versioning
- `TaskCard`: Kanban task with status transitions
- `DataFeedForm`: OAuth integration setup

### 2. Backend API (`apps/api`)

**Stack:** Next.js API Routes, Prisma ORM, Zod validation

**Core Endpoints:**

#### Auth
```
POST /api/auth/callback          → Clerk webhook
GET  /api/auth/me                → Current user + permissions
```

#### Clients
```
POST   /api/clients              → Create client (admin)
GET    /api/clients              → List (filtered by role)
GET    /api/clients/[id]         → Get details
PATCH  /api/clients/[id]         → Update (admin)
DELETE /api/clients/[id]         → Soft delete (admin)
```

#### Data Feeds
```
POST   /api/datafeeds            → Create feed (config JSON)
GET    /api/datafeeds/[id]       → Get feed status
PATCH  /api/datafeeds/[id]       → Update config
DELETE /api/datafeeds/[id]       → Disconnect
POST   /api/datafeeds/[id]/sync  → Manual re-sync → enqueue ETL job
```

#### Tasks
```
GET    /api/tasks               → List tasks (filtered by user role)
GET    /api/tasks/[id]          → Get task + flags
PATCH  /api/tasks/[id]          → Update status + comment
POST   /api/tasks/[id]/approve  → Mark DONE + create audit log
```

#### Reports
```
POST   /api/reports             → Create report skeleton
GET    /api/reports/[id]        → Get report + draftText
PATCH  /api/reports/[id]        → Update text, change status
POST   /api/reports/[id]/draft  → Enqueue AI drafting job
POST   /api/reports/[id]/sign   → Add sign-off + trigger PDF render
GET    /api/reports/[id]/pdf    → Download PDF artifact
```

#### Webhooks
```
POST   /api/webhooks/fortnox    → Fortnox push notifications
POST   /api/webhooks/bank       → Bank reconciliation alerts
POST   /api/webhooks/stripe     → Payment notifications
```

#### Admin
```
GET    /api/admin/health        → Queue status, DB healthy, syncs
POST   /api/admin/migrate       → Run pending Prisma migrations (guarded)
```

**Error Handling:**
- Standard `AppError` with code + status code
- Validation errors return 400 + Zod issues
- Auth errors return 401/403 + audit log
- Rate limiting: `3 req/sec` per IP (redis-based)

### 3. Job Queue (`apps/workers` + BullMQ)

**Queues:**

#### `etl` queue
- **Processor:** `workers/etl.fortnox.ts`, `etl.bank.ts`, etc.
- **Job:** `{ clientId, source, period, configJson }`
- **Concurrency:** 2 (rate-limited by API providers)
- **Retry:** 3x exponential backoff (2s, 4s, 8s)
- **Output:** LedgerEntry records in DB

**Example Flow:**
```
1. Portal: Click "Sync Fortnox" → POST /api/datafeeds/[id]/sync
2. API: Validate, enqueue ETL job → etlQueue.add('sync', { clientId, source: 'FORTNOX', ... })
3. Worker: Fetch via Fortnox API → normalize → Zod validate → DB upsert
4. Result: LedgerEntry records + DataFeed.status = 'ACTIVE'
5. Trigger: Auto-enqueue AI data quality check
```

#### `ai` queue
- **Processor:** `workers/ai.data-quality.ts`, (future: reconciliation, drafting)
- **Job:** `{ clientId, task, period, artifacts }`
- **Concurrency:** 3
- **Timeout:** 60s
- **Output:** Task + Flags + draftText (for reports)

**Example:**
```
Job: { clientId: 'c1', task: 'data_quality', period: { start, end }, ... }
Output: Task(QC_CHECK, NEEDS_REVIEW) + 5 Flags (error/warning)
→ Coordinator sees inbox item + diff-viewer link
```

#### `reports` queue
- **Processor:** `jobs/reports/generate-investor-report.ts`
- **Job:** `{ reportId, clientId, periodStart, periodEnd }`
- **Concurrency:** 1 (PDF rendering intensive)
- **Output:** S3 PDF URL + Report.artifactUrl

#### `compliance` queue
- **Processor:** `jobs/compliance/policy-eval.ts`
- **Job:** `{ clientId, rulesetId }`
- **Output:** Findings + Tasks for deadline breaches

### 4. Database (Postgres + Prisma)

**Key Tables:**

| Table | Purpose |
|-------|---------|
| `Client` | Org info, tier (XL/LARGE) |
| `User` | Clerk sync, role, permissions |
| `Subscription` | Plan (AGENT_PORTAL, COORDINATOR, SPECIALIST) + SLA |
| `DataFeed` | API config, last sync, error status |
| `LedgerEntry` | Normalized entries from all sources |
| `BankAccount` | Bank connections, balance snapshots |
| `Task` | QC, KYC, Reports work items + status |
| `Flag` | Issue details attached to tasks |
| `Report` | Report metadata, draft text, status |
| `ReportVersion` | Historical drafts for versioning |
| `Evidence` | Immutable S3 copy + file hash (compliance) |
| `SignOff` | Attest trail (Coordinator → Specialist → Published) |
| `KYCRecord` | Investor KYC + risk level + PEP/sanction status |
| `Investor` | Fund investor records |
| `RiskProfile` | Period-bound risk metrics (VaR, concentration) |
| `AuditLog` | Every mutation (CREATE, UPDATE, DELETE, APPROVE) |

**Indexes:**
- `Client(tier, orgNo)`
- `DataFeed(clientId, status)`
- `LedgerEntry(clientId, bookingDate, account)`
- `Task(clientId, status, kind)`
- `Report(clientId, status, type)`
- `AuditLog(refType, refId, createdAt)`

### 5. AI Skills (Python)

**Location:** `packages/ai/src/`

**Modules:**

#### `reconciliation.py`
```python
def reconcile_transactions(bank_txs, ledger_entries, tolerance_days=3, tolerance_amount=0.01)
  → (matched[], deltas[])
```
- Fuzzy-matches transactions on amount + date + description
- Returns confidence scores + match methods
- Detects unmatched bank/ledger items

#### `report_drafter.py`
```python
def draft_report(client_id, report_type, period_start, period_end, metrics, positions)
  → Report{ text, html, metrics }
```
- Templates for Investor Letter, Financial Report
- Generates highlights + commentary from metrics
- Basic markdown → HTML conversion

#### `data_quality.py` (in Node, see `ai.data-quality.ts`)
- Validates ledger entries
- Detects duplicates, missing fields, amount errors
- Checks debit/credit balance
- Creates Task + Flags

#### Future Modules:
- `kyc_aml_checker.py` – OCR + PEP/sanction APIs
- `risk_engine.py` – VaR, concentration, stress testing
- `compliance_rules.py` – YAML policy eval

### 6. External Integrations

#### Fortnox
- **API:** REST, OAuth 2.0
- **Rate Limit:** 10 req/s per token
- **Data:** Vouchers → Ledger entries
- **Endpoint:** `https://api.fortnox.se/3/vouchers`

#### Nordigen (Bank / PSD2)
- **API:** REST, JWT token
- **Rate Limit:** 10 req/s
- **Data:** Requisition → Accounts → Transactions + Balances
- **Endpoint:** `https://api.nordigen.com/api/v2/`

#### Clerk (Auth)
- **Webhooks:** user.created, user.deleted
- **Sync:** New Clerk users → DB User + RBAC setup

#### S3 / Cloudflare R2 (Evidence)
- **Storage:** Immutable PDFs + backups (object lock)
- **File Hash:** SHA256 for integrity verification
- **Retention:** 7 years (compliance)

---

## Data Flow Examples

### Example 1: Investor Report Generation

```
[Portal] Client clicks "Generate Report"
   ↓ POST /api/reports
[API] Create Report(status=DRAFT) + enqueue AI job
   ↓ Queue: aiQueue.add('report_draft', { reportId, clientId, period, ... })
[Worker] AI job picked up by BullMQ
   ↓ Fetch LedgerEntry, Position data
   ↓ Call report_drafter.py
   ↓ Parse metrics, generate text, save to DB
[API] Report updated (status=QC, draftText=...)
   ↓ Task created: Task(REPORT_DRAFT, NEEDS_REVIEW)
[Portal Coordinator] Sees task in inbox
   ↓ Clicks → Diff-viewer (AI vs manual text)
   ↓ Approves or rejects with comments
   ↓ PATCH /api/tasks/[id] { status: 'DONE' }
[Worker] Specialist queue pick-up
   ↓ Report status → APPROVAL
[Portal Specialist] Sees in Delivery Board
   ↓ Edits rich text, adds notes
   ↓ PATCH /api/reports/[id] { finalText: '...', status: 'APPROVAL' }
   ↓ Both sign (2-stage) → POST /api/reports/[id]/sign
   ↓ Enqueue PDF render job
[Worker] PDF renderer
   ↓ Puppeteer render HTML → PDF
   ↓ Upload to S3 (with object lock)
   ↓ Update Report.artifactUrl
   ↓ Create Evidence record (audit)
[Portal] Report now PUBLISHED
   ↓ Client can download PDF
```

### Example 2: Bank Reconciliation

```
[Worker] ETL job fetches Bank transactions (Nordigen)
   ↓ 100 transactions fetched → LedgerEntry records in DB
[Worker] Data Quality job runs (auto-triggered)
   ↓ Flags: "Ledger unbalanced by €50"
   ↓ Task(QC_CHECK, NEEDS_REVIEW) created
[Portal Coordinator] Sees task
   ↓ Clicks Diff-Viewer
   ↓ Sees unmatched bank tx: "€50 on 2024-01-15"
   ↓ Manually links to GL entry with comment
   ↓ Re-runs AI reconciliation job
   ↓ Result: 98/100 matched (98% match rate)
   ↓ Approves task → DONE
   ↓ Audit log: "Coordinator reconciled by manual linkage"
```

### Example 3: Compliance Rule Evaluation

```
[Schedule] CRON job runs daily for client X
   ↓ Enqueue compliance job
[Worker] Evaluates YAML rules from policy document:
   "rule: Monthly NAV close deadline"
   "when: month_end + 5d"
   "must: report.published == true"
   "severity: high"
   ↓ Check: Is NAV report published by deadline?
   ↓ If NO: Create Task(COMPLIANCE_CHECK, BLOCKED)
   ↓ Assign to Specialist, send Slack alert
[Portal Specialist] Sees blocked task
   ↓ Clicks → explanation + deadline
   ↓ Expedites report approval
   ↓ Once published → Task auto-resolves
```

---

## Security & Compliance

### Authentication
- **Clerk OAuth:** Primary, SSO-ready
- **Magic Link:** Fallback for non-OAuth users
- **JWT:** Session tokens, 15-min expiry + refresh

### Authorization
- **RBAC:** 4 roles (CLIENT, COORDINATOR, SPECIALIST, ADMIN)
- **Row-Level Security:** Middleware enforces `clientId` scoping
- **API Layer:** Every endpoint checks `req.user.role` + `req.user.clientId`

### Audit
- **AuditLog:** Every CREATE/UPDATE/DELETE with actor, diff, IP
- **Evidence:** Immutable S3 copies of reports (object lock, 7yr retention)
- **File Hash:** SHA256 verification on download

### Data Protection
- **PII:** Krypterade fält (personnummer, IBAN) via envelope encryption (TBD)
- **Encryption in Transit:** TLS 1.3 only
- **Secrets:** Vault or Railway secrets (not in code)

### Compliance Frameworks
- **GDPR:** Data residency (EU), consent, DPA
- **MiFID II:** Suitable investments, best execution
- **AIFMD:** Delegation, leverage, annual accounts
- **AML/KYC:** PEP/sanction checking, beneficial owner info

---

## Deployment (Railway)

**Services:**

| Service | Port | Env |
|---------|------|-----|
| `web` | 3000 | NODE_ENV=production |
| `api` | 3000 | (same domain) |
| `workers` | - | (background) |
| `postgres` | 5432 | managed |
| `redis` | 6379 | managed |

**Migrations Guard:**
- Before deploy: `prisma migrate status` check
- If pending: Fail deployment + alert
- Migrations run as first boot step

**Observability:**
- **Sentry:** Frontend + backend errors
- **OpenTelemetry:** Traces → Grafana Tempo
- **Prometheus:** Queue metrics, DB connection pool
- **Health:** `/api/admin/health` checked every 60s

---

## Next Steps (Post-MVP)

1. ✅ Core infrastructure (DB, queue, auth, basic ETL)
2. ⏳ Portal UI (Coordinator/Specialist views)
3. ⏳ Advanced AI (LLM integration, risk engine)
4. ⏳ Regulatory integrations (SKV, FI, Sigma)
5. ⏳ Investor onboarding e-flow
6. ⏳ Production hardening (monitoring, backups, DR)

