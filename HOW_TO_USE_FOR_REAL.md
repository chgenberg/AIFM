# 🔧 PRAKTISK GUIDE: Så använder du systemet på riktigt

## 🎯 ÖVERSIKT: Hur systemet fungerar

```
1. Koppla upp datakällor (Fortnox, Bank) → DataFeed i databasen
2. Hämta data → ETL Workers kör automatiskt eller manuellt
3. AI analyserar → Tasks skapas automatiskt
4. Människa granskar → Coordinator/Specialist godkänner
5. Resultat levereras → Rapporter publiceras
```

---

## 📍 STEG 1: VAR LÄGGER JAG API-NYCKLAR?

### **Alternativ 1: Via Railway Environment Variables** (Rekommenderat)

1. Gå till Railway Dashboard: `https://railway.app`
2. Välj ditt projekt
3. Gå till **Variables** tab
4. Lägg till:

```bash
# OpenAI (redan satt)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini

# Fortnox API
FORTNOX_API_KEY=din-fortnox-api-nyckel
FORTNOX_ACCESS_TOKEN=din-access-token

# Bank API (Nordigen)
NORDIGEN_SECRET_ID=din-secret-id
NORDIGEN_SECRET_KEY=din-secret-key

# Database (redan satt)
DATABASE_URL=postgresql://...
```

### **Alternativ 2: Via DataFeed i databasen** (Per Client)

API-nycklar kan också lagras per client i `DataFeed.configJson`:

```typescript
// Exempel: Skapa DataFeed för Fortnox
const dataFeed = {
  clientId: "client-id",
  source: "FORTNOX",
  configJson: {
    apiKey: "din-fortnox-api-nyckel",
    accessToken: "din-access-token",
    companyId: "123456"
  }
}
```

---

## 🔌 STEG 2: KOPPLA UPP FORTNOX

### **Metod 1: Via API Route** (Rekommenderat)

Skapa en API route för att konfigurera datafeeds:

```typescript
// apps/web/src/app/api/datafeeds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { etlQueue } from '@/lib/queue'; // Om du exporterar från workers

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { clientId, source, apiKey, accessToken, companyId } = await request.json();

  // Skapa eller uppdatera DataFeed
  const dataFeed = await prisma.dataFeed.upsert({
    where: {
      clientId_source: {
        clientId,
        source: source, // 'FORTNOX' eller 'BANK'
      },
    },
    update: {
      configJson: {
        apiKey,
        accessToken,
        companyId,
      },
      status: 'ACTIVE',
    },
    create: {
      clientId,
      source,
      configJson: {
        apiKey,
        accessToken,
        companyId,
      },
      status: 'ACTIVE',
    },
  });

  // Trigger ETL sync direkt
  await etlQueue.add('sync', {
    clientId,
    source,
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Senaste 30 dagarna
      end: new Date().toISOString(),
    },
  });

  return NextResponse.json({ success: true, dataFeed });
}
```

### **Metod 2: Via Prisma direkt** (Dev/Local)

```bash
# Kör i terminal eller via Prisma Studio
npx prisma studio
```

Eller via SQL:

```sql
INSERT INTO "DataFeed" (id, "clientId", source, "configJson", status)
VALUES (
  'feed-1',
  'ditt-client-id',
  'FORTNOX',
  '{"apiKey": "din-nyckel", "accessToken": "din-token", "companyId": "123456"}'::jsonb,
  'ACTIVE'
);
```

---

## 🚀 STEG 3: TRIGGA DATAHÄMNTNING (ETL)

### **Automatiskt** (Cron/Scheduled)

Workers kör automatiskt när de startas. För att schemalägga:

```typescript
// apps/workers/src/index.ts
import { CronJob } from 'cron';

// Kör varje dag kl 02:00
new CronJob('0 2 * * *', async () => {
  const clients = await prisma.client.findMany();
  for (const client of clients) {
    await etlQueue.add('sync', {
      clientId: client.id,
      source: 'FORTNOX',
      period: { /* ... */ },
    });
  }
}).start();
```

### **Manuellt via API**

```bash
# Trigger Fortnox sync
curl -X POST https://din-app.railway.app/api/datafeeds/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=din-session" \
  -d '{
    "clientId": "ditt-client-id",
    "source": "FORTNOX",
    "period": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }'
```

### **Via UI** (Om du skapar en admin-sida)

```typescript
// I admin dashboard
const handleSyncFortnox = async () => {
  await fetch('/api/datafeeds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: selectedClient.id,
      source: 'FORTNOX',
    }),
  });
};
```

---

## 🤖 STEG 4: TRIGGA AI-BERÄKNINGAR

### **Automatiskt** (När data hämtas)

AI-processer triggas automatiskt när:
1. ETL Worker hämtar data
2. Data kvalitetskontrolleras
3. Tasks skapas med status `QUEUED`

### **Manuellt via API**

```bash
# Trigger bank reconciliation
curl -X POST https://din-app.railway.app/api/ai/process \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=din-session" \
  -d '{
    "taskKind": "BANK_RECON",
    "context": {
      "bankBalance": 125000000,
      "ledgerBalance": 124950000,
      "discrepancy": 50000,
      "recentTransactions": [...]
    }
  }'
```

### **Via Admin UI**

Skapa en knapp i admin dashboard:

```typescript
const handleRunBankRecon = async (clientId: string) => {
  // 1. Hämta data från databasen
  const bankData = await prisma.bankTransaction.findMany({
    where: { clientId, /* period */ },
  });
  
  const ledgerData = await prisma.ledgerEntry.findMany({
    where: { clientId, /* period */ },
  });

  // 2. Beräkna totals
  const bankBalance = bankData.reduce((sum, t) => sum + t.amount, 0);
  const ledgerBalance = ledgerData.reduce((sum, e) => sum + e.amount, 0);

  // 3. Anropa AI
  const response = await fetch('/api/ai/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskKind: 'BANK_RECON',
      context: {
        bankBalance,
        ledgerBalance,
        discrepancy: bankBalance - ledgerBalance,
        recentTransactions: bankData.slice(-10),
      },
    }),
  });

  const result = await response.json();

  // 4. Skapa Task i databasen
  await prisma.task.create({
    data: {
      clientId,
      kind: 'BANK_RECON',
      status: 'NEEDS_REVIEW',
      payload: result,
      flags: {
        create: result.flags.map((flag: any) => ({
          severity: flag.severity,
          message: flag.message,
          code: flag.code,
        })),
      },
    },
  });
};
```

---

## 📊 KOMPLETT EXEMPEL: Bankavstämning från början till slut

### **Steg 1: Konfigurera Bank API**

```typescript
// 1. Skapa DataFeed för bank
POST /api/datafeeds
{
  "clientId": "nordic-growth-fund-id",
  "source": "BANK",
  "configJson": {
    "requisitionId": "nordigen-requisition-id",
    "accountId": "bank-account-id"
  }
}
```

### **Steg 2: Hämta bankdata**

```typescript
// ETL Worker kör automatiskt eller manuellt
POST /api/datafeeds/sync
{
  "clientId": "nordic-growth-fund-id",
  "source": "BANK",
  "period": {
    "start": "2024-10-01",
    "end": "2024-10-31"
  }
}
```

Detta kommer:
1. Anropa Nordigen API med din `requisitionId`
2. Hämta transaktioner för perioden
3. Spara i `BankTransaction` tabellen
4. Uppdatera `BankAccount.balance`

### **Steg 3: Trigga AI-analys**

```typescript
// Automatiskt eller manuellt
POST /api/tasks/create
{
  "clientId": "nordic-growth-fund-id",
  "kind": "BANK_RECON",
  "payload": {
    "periodStart": "2024-10-01",
    "periodEnd": "2024-10-31"
  }
}
```

Detta kommer:
1. Hämta bankdata och ledgerdata från databasen
2. Anropa `/api/ai/process` med `BANK_RECON`
3. GPT analyserar och returnerar resultat
4. Skapa Task med flags och analys
5. Task visas i Coordinator Inbox

### **Steg 4: Människa granskar**

Coordinator går till `/coordinator/inbox`:
- Ser task med flags
- Granskar analysen
- Klickar "APPROVE" eller "REJECT"

### **Steg 5: Resultat**

När task är godkänd:
- Status ändras till `DONE`
- Analys sparas i `Task.payload`
- Flags kan exporteras eller användas för rapporter

---

## 🛠️ SKAPA ADMIN-SIDOR FÖR KONFIGURATION

### **DataFeed Management Page**

```typescript
// apps/web/src/app/admin/datafeeds/page.tsx
export default function DataFeedsPage() {
  const [feeds, setFeeds] = useState([]);
  
  const handleCreateFortnox = async (clientId: string, apiKey: string) => {
    await fetch('/api/datafeeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        source: 'FORTNOX',
        configJson: { apiKey },
      }),
    });
  };

  const handleSync = async (feedId: string) => {
    await fetch('/api/datafeeds/sync', {
      method: 'POST',
      body: JSON.stringify({ feedId }),
    });
  };

  return (
    <div>
      <h1>Data Feeds</h1>
      {/* Form för att skapa Fortnox feed */}
      {/* Lista över feeds med sync-knappar */}
    </div>
  );
}
```

---

## 📝 API ROUTES DU BEHÖVER SKAPA

### **1. DataFeed Management**

```typescript
// apps/web/src/app/api/datafeeds/route.ts
export async function POST(request: NextRequest) {
  // Skapa/uppdatera DataFeed
}

export async function GET() {
  // Lista alla DataFeeds
}
```

### **2. Trigger Sync**

```typescript
// apps/web/src/app/api/datafeeds/sync/route.ts
export async function POST(request: NextRequest) {
  // Trigger ETL sync för en DataFeed
  const { feedId, clientId, source, period } = await request.json();
  
  // Lägg till job i queue
  await etlQueue.add('sync', { clientId, source, period });
  
  return NextResponse.json({ success: true });
}
```

### **3. Create Task**

```typescript
// apps/web/src/app/api/tasks/create/route.ts
export async function POST(request: NextRequest) {
  const { clientId, kind, payload } = await request.json();
  
  // Hämta data baserat på kind
  let context = {};
  if (kind === 'BANK_RECON') {
    const bankData = await prisma.bankTransaction.findMany({...});
    const ledgerData = await prisma.ledgerEntry.findMany({...});
    context = { bankData, ledgerData };
  }
  
  // Anropa AI
  const aiResult = await fetch('/api/ai/process', {
    method: 'POST',
    body: JSON.stringify({ taskKind: kind, context }),
  }).then(r => r.json());
  
  // Skapa Task
  const task = await prisma.task.create({
    data: {
      clientId,
      kind,
      status: 'NEEDS_REVIEW',
      payload: aiResult,
      flags: {
        create: aiResult.flags?.map(f => ({
          severity: f.severity,
          message: f.message,
          code: f.code,
        })) || [],
      },
    },
  });
  
  return NextResponse.json({ task });
}
```

---

## 🎬 PRAKTISKT EXEMPEL: Komplett flöde

### **Scenario: Månadsavstämning för oktober**

**1. Konfigurera (en gång):**
```bash
# Via Railway eller API
DataFeed.create({
  clientId: "nordic-growth-fund",
  source: "FORTNOX",
  configJson: {
    apiKey: "din-fortnox-nyckel",
    accessToken: "din-token"
  }
})
```

**2. Hämta data (varje månad):**
```bash
# Automatiskt via cron eller manuellt
POST /api/datafeeds/sync
{
  "clientId": "nordic-growth-fund",
  "source": "FORTNOX",
  "period": { "start": "2024-10-01", "end": "2024-10-31" }
}
```

**3. Trigga avstämning:**
```bash
# Automatiskt när data hämtas eller manuellt
POST /api/tasks/create
{
  "clientId": "nordic-growth-fund",
  "kind": "BANK_RECON",
  "payload": {
    "periodStart": "2024-10-01",
    "periodEnd": "2024-10-31"
  }
}
```

**4. AI analyserar:**
- Systemet hämtar bankdata och ledgerdata
- Anropar GPT med system prompt
- GPT returnerar analys med flags
- Task skapas med status `NEEDS_REVIEW`

**5. Coordinator granskar:**
- Går till `/coordinator/inbox`
- Ser task med flags
- Godkänner om allt stämmer

**6. Resultat:**
- Task blir `DONE`
- Analys sparas i databasen
- Kan användas för rapporter

---

## 🔑 VAR ALLT FINNS

### **API-nycklar:**
- Railway Dashboard → Variables (för hela systemet)
- Eller: `DataFeed.configJson` (per client)

### **ETL Workers:**
- `apps/workers/src/workers/etl.fortnox.ts` - Fortnox integration
- `apps/workers/src/workers/etl.bank.ts` - Bank integration

### **AI Processing:**
- `apps/web/src/app/api/ai/process/route.ts` - AI analysis
- `apps/web/src/app/api/ai/report/route.ts` - Report generation

### **Database:**
- `prisma/schema.prisma` - Schema definition
- `DataFeed` - Lagrar API-nycklar och konfiguration
- `Task` - Lagrar AI-resultat och status
- `Flag` - Lagrar varningar och fel

---

## 💡 TIPS

1. **Testa först lokalt:** Sätt upp Fortnox-nyckel lokalt och testa innan Railway
2. **Använd Prisma Studio:** `npx prisma studio` för att se/manipulera data
3. **Logs:** Kolla Railway logs för att se vad som händer
4. **Starta Workers:** Se till att workers körs på Railway (separat service)

---

**Nu förstår du hur systemet fungerar på riktigt!** 🚀

