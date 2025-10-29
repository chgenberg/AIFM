# AIFM Agent Portal – Quick Start (5 Minutes)

## TL;DR

**What:** End-to-end ETL + AI + database for AIFM (funds) data processing  
**Status:** Foundation complete (workers, DB, AI skills ready)  
**Next:** Portal UI + API endpoints  

---

## One-Time Setup

### 1. Install & Start
```bash
cd /Users/christophergenberg/Desktop/FINANS
npm install                    # 2 min
docker-compose up -d          # 1 min
npm run db:push               # 30 sec
```

### 2. Start Workers
```bash
npm run dev -w apps/workers   # Watch for "All workers running"
```

### 3. Verify
```bash
# In another terminal:
docker-compose ps             # Both postgres + redis should be running
```

---

## Test a Data Sync

### Create Test Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Fund",
    "orgNo": "123456789",
    "tier": "XL"
  }'
# Note the returned clientId
```

### Create Fortnox DataFeed
```bash
curl -X POST http://localhost:3000/api/datafeeds \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "[use returned ID above]",
    "source": "FORTNOX",
    "configJson": {
      "apiKey": "your-fortnox-key-here"
    }
  }'
```

### Trigger Sync
```bash
curl -X POST http://localhost:3000/api/datafeeds/[feedId]/sync
```

### Check Results
```bash
# Queue status:
curl http://localhost:3000/api/admin/health

# Database:
docker exec -it aifm-postgres psql -U aifm -d aifm_dev
SELECT COUNT(*) FROM "LedgerEntry";
SELECT COUNT(*) FROM "Task" WHERE kind = 'QC_CHECK';
```

---

## Key Files to Explore

| File | What | Lines |
|------|------|-------|
| `prisma/schema.prisma` | Database schema | 800 |
| `apps/workers/src/index.ts` | Worker bootstrap | 40 |
| `apps/workers/src/lib/queue.ts` | BullMQ setup | 100 |
| `apps/workers/src/workers/etl.fortnox.ts` | Fortnox connector | 150 |
| `apps/workers/src/workers/etl.bank.ts` | Bank connector | 200 |
| `apps/workers/src/workers/ai.data-quality.ts` | QC validation | 300 |
| `packages/shared/src/contracts.ts` | Zod schemas | 400 |
| `packages/ai/src/reconciliation.py` | Bank recon | 200 |
| `packages/ai/src/report_drafter.py` | Report gen | 300 |

---

## Project Structure

```
FINANS/
├── apps/
│   ├── web/              ← Your portal UI goes here
│   ├── api/              ← Your API endpoints go here
│   └── workers/          ✅ Ready: ETL + AI orchestration
├── packages/
│   ├── shared/           ✅ Ready: Zod contracts + types
│   └── ai/               ✅ Ready: Python AI skills
├── prisma/
│   └── schema.prisma     ✅ Ready: Full DB schema
└── docker-compose.yml    ✅ Ready: Local services
```

---

## Environment Setup

Copy & customize:
```bash
cp .env.example .env.local
# Edit with your credentials
```

Key variables:
```
DATABASE_URL="postgresql://aifm:aifm_dev_pass@localhost:5432/aifm_dev"
REDIS_URL="redis://localhost:6379"
FORTNOX_API_KEY="xxx"
NORDIGEN_SECRET_ID="xxx"
NORDIGEN_SECRET_KEY="xxx"
```

---

## Common Commands

```bash
# Development
npm run dev                    # All services
npm run dev -w apps/web       # Just portal
npm run dev -w apps/workers   # Just workers

# Database
npm run db:push              # Create/migrate schema
npm run db:setup             # Create + seed

# Quality
npm run lint                 # Check code style
npm run type-check          # TypeScript check

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # Watch logs
```

---

## First Data Sync Flow

```
1. Client created in DB
   ↓
2. DataFeed configured (e.g., Fortnox API key)
   ↓
3. Manual sync triggered → Job enqueued
   ↓
4. Fortnox worker processes job
   ├─ Fetch vouchers from API
   ├─ Normalize to LedgerEntry
   ├─ Validate with Zod
   └─ Upsert to DB
   ↓
5. Data Quality job auto-triggered
   ├─ Validate ledger entries
   ├─ Check duplicates, amounts, currencies
   └─ Create QC Task if issues found
   ↓
6. Coordinator sees task in inbox
   └─ Can review + approve or reject
```

---

## Example: Get QC Tasks

```bash
# Get all QC tasks for a client
curl "http://localhost:3000/api/tasks?clientId=[id]&kind=QC_CHECK"

# Response:
{
  "items": [
    {
      "id": "task-123",
      "kind": "QC_CHECK",
      "status": "NEEDS_REVIEW",
      "payload": {
        "checks": [...],
        "errorCount": 2,
        "warningCount": 5
      },
      "flags": [
        {
          "severity": "error",
          "message": "Ledger unbalanced by €50",
          "code": "LEDGER_UNBALANCED"
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Workers Not Starting
```bash
# Check Redis
docker exec -it aifm-redis redis-cli ping
# Should respond: PONG

# Check logs
docker-compose logs -f workers
```

### Database Connection Error
```bash
# Check Postgres
docker exec -it aifm-postgres pg_isready -U aifm
# Should respond: accepting connections

# Reset migrations
npm run db:push --force
```

### Missing Zod Errors
```bash
# Rebuild shared package
npm run build -w packages/shared

# Re-install monorepo deps
npm install
```

---

## What's Ready vs. Pending

### ✅ Production-Ready
- ETL workers (Fortnox, Bank)
- Data validation (QC checks)
- Report drafting templates
- Database schema
- Job queue + retry logic
- Type safety (Zod + TypeScript)

### ⏳ Pending (Phase 2-3)
- Portal UI (Coordinator, Specialist, Admin views)
- API endpoints (full CRUD)
- Advanced AI (LLM, risk engine)
- Investor onboarding
- Compliance rules engine
- Monitoring (Sentry, OpenTelemetry)

---

## Next Steps

1. **Setup Local** (15 min): Run SETUP.md
2. **Test Sync** (10 min): Try Fortnox/Bank connector
3. **Build Portal** (4-6 weeks): Implement UI + API
4. **Add Features** (8-10 weeks): Advanced AI, compliance, etc.

---

## Documentation Map

```
├── README.md              ← Overview + architecture
├── ARCHITECTURE.md        ← Deep dive (data flows, security)
├── SETUP.md              ← Local development guide
├── PROJECT_STATUS.md     ← What's done, timeline
├── DELIVERY_SUMMARY.md   ← This session's deliverables
└── QUICKSTART.md         ← You are here
```

---

## Questions?

- **How does data flow?** → See ARCHITECTURE.md "Example 1: Investor Report"
- **How to add a new connector?** → Copy `etl.fortnox.ts` pattern
- **How to customize reports?** → Edit `packages/ai/src/report_drafter.py`
- **How to check audit logs?** → Query `AuditLog` table
- **How to deploy?** → Check PROJECT_STATUS.md "Deployment"

---

**You're ready to go!** 🚀

Start with: `npm install && docker-compose up -d && npm run db:push`

