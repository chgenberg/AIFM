# ⚡ OpenAI + Railway + Prisma - Quick Start (15 minutes)

**Get your AI running with PostgreSQL and OpenAI function calling**

---

## Step 1: Get OpenAI API Key (2 min)

```bash
# Go to https://platform.openai.com/api/keys
# Click "Create new secret key"
# Copy the key (looks like: sk-proj-xxx...)
# Save it somewhere safe
```

---

## Step 2: Setup Local Environment (3 min)

```bash
# In your project root
cp .env.example .env.local

# Edit .env.local
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-id
DATABASE_URL=postgresql://user:pass@localhost/finans
```

---

## Step 3: Deploy to Railway (5 min)

```bash
# 1. Go to https://railway.app
# 2. Click "New Project" → "GitHub"
# 3. Select your FINANS repo
# 4. Railway auto-detects your setup

# 5. Add PostgreSQL database
#    Dashboard → New → Database → PostgreSQL
#    Copy the DATABASE_URL

# 6. Set environment variables in Railway
#    Dashboard → Variables
#    Add: OPENAI_API_KEY, OPENAI_ORG_ID, DATABASE_URL

# 7. Deploy
git add .
git commit -m "feat: OpenAI integration"
git push origin main
# Railway auto-deploys!
```

---

## Step 4: Initialize Database (3 min)

```bash
# In Railway terminal OR local terminal connected to Railway DB
npx prisma migrate deploy
npx prisma db seed
```

---

## Step 5: Test It Works (2 min)

```bash
# Run a test task
npm run test:ai

# Expected output:
# ✅ Bank reconciliation task created
# ✅ AI analyzed data
# ✅ Flags created: 3
# ✅ Report draft saved
```

---

## How It Works

```
┌─────────────────────────────────────┐
│  You trigger a task                 │
│  (Bank reconciliation, KYC, etc.)   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  AI Orchestrator                    │
│  - Loads system prompt              │
│  - Gets context from Prisma DB      │
│  - Decides what to do               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  OpenAI GPT-4 with Function Calling │
│  - Understands the task             │
│  - Calls required functions:        │
│    • get_bank_transactions()        │
│    • get_ledger_entries()           │
│    • create_flag()                  │
│    • create_report_draft()          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Your Backend                       │
│  - Executes the functions           │
│  - Queries Prisma DB                │
│  - Returns results to AI            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  AI Generates Output                │
│  - Analysis report                  │
│  - Flags any issues                 │
│  - Saves everything to DB           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Human Reviews                      │
│  - Coordinator approves/rejects     │
│  - Specialist refines               │
│  - Client gets final report         │
└─────────────────────────────────────┘
```

---

## What AI Can Do Now

✅ **Bank Reconciliation**
- Matches bank transactions to ledger entries
- Flags mismatches with severity
- Calculates reconciliation rate
- Provides professional analysis

✅ **KYC Compliance Review**
- Reviews investor information
- Identifies red flags (PEP, sanctions)
- Assesses risk level
- Recommends approval/rejection

✅ **Report Generation**
- Generates professional fund reports
- Includes key metrics and analysis
- Formats as clean Markdown
- Ready for PDF conversion

✅ **Data Quality Checks**
- Validates data completeness
- Identifies outliers
- Flags consistency issues
- Recommends corrections

---

## File Structure

```
/apps/api/src/lib/
├── openai-client.ts      ← AI connection & function definitions
├── ai-orchestrator.ts    ← Task processors & analysis generators
└── prisma/
    └── schema.prisma     ← Your database schema

/OPENAI_TRAINING_GUIDE.md ← Complete training guide
```

---

## Common Tasks

### Process a Reconciliation Task

```typescript
import { processBankReconciliation } from '@/lib/ai-orchestrator';

const result = await processBankReconciliation('task-123', {
  clientId: 'client-456',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Result:
// {
//   success: true,
//   taskId: 'task-123',
//   analysis: '...',  // AI-generated analysis
//   flagsCreated: 5
// }
```

### Process a KYC Review

```typescript
import { processKYCReview } from '@/lib/ai-orchestrator';

const result = await processKYCReview('task-789', {
  clientId: 'client-456',
  kycRecordId: 'kyc-111'
});

// Result includes:
// {
//   riskLevel: 'medium',
//   recommendation: 'APPROVE',
//   flags: [...]
// }
```

### Generate a Report

```typescript
import { generateReportDraft } from '@/lib/ai-orchestrator';

const result = await generateReportDraft('task-xyz', {
  clientId: 'client-456',
  reportType: 'FUND_ACCOUNTING',
  periodStart: '2024-01-01',
  periodEnd: '2024-01-31'
});

// Report saved to Prisma:
// - Markdown content
// - Key metrics
// - Ready for specialist review
```

---

## Cost Estimation

| Task | Approx Cost | Time |
|------|------------|------|
| Bank Reconciliation | $0.15 | 2 sec |
| KYC Review | $0.08 | 1.5 sec |
| Report Generation | $0.25 | 4 sec |

**Budget example:**
- 10 daily reconciliations × $0.15 = $1.50/day
- 5 daily KYC reviews × $0.08 = $0.40/day
- 2 daily reports × $0.25 = $0.50/day
- **Total: ~$2.40/day ≈ $70/month**

---

## Monitoring & Logs

All AI operations are logged to help you monitor:

```bash
# Watch real-time logs (if using Railway terminal)
railway logs

# Check specific task
railway logs -f --grep "task-123"

# Local development
npm run logs:ai
```

Look for:
- `AI Task Started` → Beginning of processing
- `AI Function Call` → What AI decided to do
- `AI Task Completed` → Final result
- `API Cost` → Token usage and cost

---

## Troubleshooting

### "API key not found"
→ Check `.env.local` has `OPENAI_API_KEY`

### "Function never gets called"
→ AI doesn't understand what to do. Check the system prompt in `ai-orchestrator.ts`

### "Slow responses"
→ Too many sequential API calls. Check if we can batch them.

### "AI returns weird results"
→ System prompt needs clarification. Add examples!

---

## Next Steps

1. ✅ Setup complete
2. Run tests: `npm run test:ai`
3. Monitor costs in OpenAI dashboard
4. Refine prompts based on results
5. Add more task types as needed

---

## Full Documentation

👉 See `OPENAI_TRAINING_GUIDE.md` for:
- Detailed architecture
- Advanced prompting techniques
- Testing strategies
- Production best practices
- Troubleshooting guide

---

**Need help?**
- OpenAI Docs: https://platform.openai.com/docs
- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
