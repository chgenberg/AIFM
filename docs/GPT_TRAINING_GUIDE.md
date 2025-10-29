# 🎓 GPT Training Guide - Fund Accounting AI

## Överblick
GPT behöver "utbildas" på dina specifika uppgifter genom:
1. **System Prompts** - Instruktioner om vad GPT ska göra
2. **Few-Shot Examples** - Exempel på input/output
3. **Context från Prisma** - Real data från din databas
4. **Iterativ Refinement** - Testa och förbättra

---

## 1️⃣ System Prompts (Huvudinstruktioner)

### Bank Reconciliation Expert
```
Du är en expert på fondredovisning. Din uppgift är att:

1. Jämföra bankutdrag med redovisningen
2. Identifiera diskrepanser
3. Klassificera avvikelser (kritiska, varningar, info)
4. Ge rekommendationer

Returnera alltid JSON med denna struktur:
{
  "analysis": "Detaljad analys av avvikelserna",
  "discrepancies": [
    {
      "type": "MISSING_TRANSACTION",
      "amount": 50000,
      "date": "2024-01-15",
      "explanation": "Transaktion saknas i redovisningen"
    }
  ],
  "recommendations": [
    "Verifiering med bank krävs",
    "Manual bokföring av transaktion"
  ],
  "flags": [
    {
      "severity": "warning",
      "message": "Bank balance discrepancy",
      "code": "BANK_MISMATCH"
    }
  ]
}
```

### KYC Review Expert
```
Du är en compliance officer. Din uppgift är att granska KYC-dokument:

1. Verifiera investerares identitet
2. Bedöm risknivå (low, medium, high)
3. Kontrollera PEP-status (politically exposed person)
4. Kontrollera sanktionslister
5. Analysera ägarstrukturen (UBO - Ultimate Beneficial Owner)

Returnera JSON:
{
  "approved": true/false,
  "riskLevel": "low|medium|high",
  "pepStatus": "clear|flagged",
  "sanctionStatus": "clear|flagged",
  "issues": ["Saknade dokument", "Otydlig ägarstruktur"],
  "recommendedActions": ["Manuell granskning", "Kontakta investerare"]
}
```

### Report Generation Expert
```
Du är en professionell fondredovisningsrapportskrivare. Din uppgift är att:

1. Sammanfatta fondens prestanda
2. Analysera portföljhållningar
3. Bedöma risker
4. Skriva en professionell rapport

Tillgänglig data:
- NAV och prestation
- Transaktioner
- Riskmätvärden
- Investerardata

Skriva rapport i Markdown format.
```

---

## 2️⃣ Few-Shot Examples (Träningsexempel)

### Example 1: Bank Reconciliation
**INPUT:**
```json
{
  "bankBalance": 125000000,
  "ledgerBalance": 124950000,
  "discrepancy": 50000,
  "recentTransactions": [
    { "date": "2024-01-15", "amount": 5000000, "type": "inflow", "description": "Capital call" },
    { "date": "2024-01-16", "amount": -50000, "type": "fee", "description": "Management fee" }
  ]
}
```

**EXPECTED OUTPUT:**
```json
{
  "analysis": "Bank visar 125M SEK medan redovisningen visar 124.95M SEK. Diskrepans på 50K SEK. Trolig orsak: en väntande transaktion som bokfördes i bank men inte ännu i redovisningen.",
  "discrepancies": [
    {
      "type": "TIMING_DIFFERENCE",
      "amount": 50000,
      "explanation": "Management fee debited by bank on 2024-01-16, pending in ledger"
    }
  ],
  "recommendations": [
    "Verifiera att 50K management fee är korrekt",
    "Bokför i redovisningen för att stämma av"
  ],
  "flags": [
    {
      "severity": "info",
      "message": "Timing difference detected - normal reconciliation item",
      "code": "TIMING_DIFF"
    }
  ]
}
```

### Example 2: KYC Review
**INPUT:**
```json
{
  "investorName": "Pension Fund Sweden",
  "documentSet": {
    "identityDoc": "verified",
    "addressProof": "verified",
    "ownershipStructure": "100% Swedish State",
    "pepCheck": "clear",
    "sanctionCheck": "clear"
  }
}
```

**EXPECTED OUTPUT:**
```json
{
  "approved": true,
  "riskLevel": "low",
  "pepStatus": "clear",
  "sanctionStatus": "clear",
  "issues": [],
  "recommendedActions": [
    "Approve KYC application",
    "Add to approved investor list"
  ]
}
```

---

## 3️⃣ Context från Prisma (Faktisk Data)

### Hämta Data för GPT Context

```typescript
// I din API route: /api/ai/process

async function getBankReconciliationContext(clientId: string) {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { clientId }
  });

  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { clientId },
    orderBy: { bookingDate: 'desc' },
    take: 50
  });

  const tasks = await prisma.task.findMany({
    where: { clientId, kind: 'BANK_RECON' },
    take: 5
  });

  return {
    bankBalance: bankAccount?.balance,
    ledgerEntries,
    previousTasks: tasks,
    // ... mer data
  };
}
```

---

## 4️⃣ Iterativ Refinement (Testning & Förbättring)

### Steg 1: Testa GPT Med Enkla Fall
```bash
curl -X POST http://localhost:3000/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "taskKind": "BANK_RECON",
    "context": {
      "bankBalance": 125000000,
      "ledgerBalance": 124950000,
      "discrepancy": 50000
    }
  }'
```

### Steg 2: Iterera På Prompts
- Om GPT ger dåligt svar → Förbättra system prompt
- Lägg till fler exempel (few-shot learning)
- Specificera output format tydligare

### Steg 3: A/B Testing
Jämför två versioner av prompts:
```typescript
const promptV1 = `Du är expert på...`;
const promptV2 = `Du är en erfaren expert på...`;

// Kör båda och jämför resultat
const result1 = await openai.chat.completions.create({ messages: [{role: 'system', content: promptV1}, ...] });
const result2 = await openai.chat.completions.create({ messages: [{role: 'system', content: promptV2}, ...] });
```

---

## 5️⃣ Production Setup

### Sparad Kontext i Systemet

```typescript
// apps/web/src/app/api/ai/process/route.ts

const TASK_PROMPTS: Record<string, SystemPrompt> = {
  BANK_RECON: {
    system: `Du är expert på fondredovisning...`,
    examples: [
      {
        input: { bankBalance: 125M, ledger: 124.95M },
        output: { analysis: "...", discrepancies: [...] }
      }
    ]
  },
  KYC_REVIEW: {
    system: `Du är compliance officer...`,
    examples: [...]
  },
  REPORT_DRAFT: {
    system: `Du är rapportskrivare...`,
    examples: [...]
  }
};

export async function POST(request: NextRequest) {
  const { taskKind, context } = await request.json();
  const prompt = TASK_PROMPTS[taskKind];
  
  // Bygga messages med system + examples + context
  const messages = [
    { role: 'system', content: prompt.system },
    ...prompt.examples.map(ex => [
      { role: 'user', content: JSON.stringify(ex.input) },
      { role: 'assistant', content: JSON.stringify(ex.output) }
    ]).flat(),
    { role: 'user', content: JSON.stringify(context) }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages,
    response_format: { type: 'json_object' }
  });

  return NextResponse.json(JSON.parse(response.choices[0].message.content));
}
```

---

## 6️⃣ Finetuning (Avancerat)

Om du vill en ännu smartare AI, kan du använda **OpenAI Fine-tuning**:

```bash
# 1. Samla examples i JSONL format
{
  "messages": [
    {"role": "system", "content": "Du är expert..."},
    {"role": "user", "content": "{\"bankBalance\": 125M, ...}"},
    {"role": "assistant", "content": "{\"analysis\": \"...\"}"}
  ]
}

# 2. Upload och finetuning
openai.fine_tuning.jobs.create(
  training_file="file-xxx.jsonl",
  model="gpt-5-mini"
)

# 3. Använd finetuned model
response = openai.chat.completions.create(
  model="ft:gpt-5-mini:aifm::xxx",
  messages=[...]
)
```

---

## ✅ Nästa Steg

1. **Uppdatera System Prompts** i `/api/ai/process` route
2. **Lägg till Few-Shot Examples** för varje task type
3. **Testa med Demo Data** från Prisma
4. **Iterera** baserat på resultat
5. **Deploy till Production**

Vill du att jag implementerar denna nu? 🚀
