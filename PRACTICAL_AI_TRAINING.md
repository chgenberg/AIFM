# 🎓 Praktisk Guide: Utbilda GPT för att lösa verkliga uppgifter

## Översikt

Detta dokument beskriver steg-för-steg hur du **praktiskt** tränar GPT-modellen så att den löser verkliga redovisningsuppgifter korrekt. Systemet är redan byggt för detta - det handlar om att **fyll det med verklig data**.

---

## 🎯 Hur GPT-lärande fungerar (i praktiken)

### Metod 1: Few-Shot Learning (Nuvarande) ⭐⭐⭐⭐⭐
**Vad det är:** Vi visar GPT exempel på vad korrekt output ser ut.

**Hur det fungerar:**
```
1. System Prompt: "Du är expert på bankavstämning..."
2. Exempel 1: Input → Output (korrekt)
3. Exempel 2: Input → Output (korrekt)
4. Exempel 3: Input → Output (korrekt)
5. Verklig uppgift: Input → GPT genererar Output (baserat på exemplen)
```

**Var data lagras:** `AIModelExample` i Prisma

### Metod 2: Feedback Loop (Automatisk förbättring) ⭐⭐⭐⭐
**Vad det är:** Systemet lär sig från användarnas feedback.

**Hur det fungerar:**
```
1. GPT ger svar
2. Användare granskar och godkänner/avvisar
3. Feedback sparas: "Var svaret korrekt? Rating: 4/5"
4. Exempel som ger korrekt svar får högre success rate
5. Systemet väljer automatiskt bästa exemplen framöver
```

**Var data lagras:** `AIFeedback` i Prisma

---

## 🚀 Steg-för-steg: Träna modellen på verkliga uppgifter

### Steg 1: Samla verkliga tasks som blev godkända

**Syfte:** Konvertera godkända tasks till few-shot examples.

**Process:**

#### 1.1 Hitta godkända tasks
```sql
-- Hitta alla godkända BANK_RECON tasks
SELECT 
  t.id,
  t.payload,
  t.comment,
  t.createdAt,
  c.name as client_name
FROM "Task" t
JOIN "Client" c ON t."clientId" = c.id
WHERE t.kind = 'BANK_RECON'
  AND t.status = 'DONE'
  AND t.comment IS NOT NULL  -- Kommentar betyder att någon granskat
ORDER BY t."updatedAt" DESC
LIMIT 100;
```

#### 1.2 Exportera till JSON
```typescript
// Script: scripts/export-approved-tasks.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function exportApprovedTasks() {
  const tasks = await prisma.task.findMany({
    where: {
      kind: 'BANK_RECON',
      status: 'DONE',
      comment: { not: null },
    },
    include: {
      client: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  // Konvertera till examples format
  const examples = tasks.map(task => ({
    input: {
      bankBalance: task.payload.bankBalance,
      ledgerBalance: task.payload.ledgerBalance,
      discrepancy: task.payload.discrepancy,
      recentTransactions: task.payload.recentTransactions,
    },
    output: {
      analysis: task.payload.analysis,
      discrepancies: task.payload.discrepancies,
      recommendations: task.payload.recommendations,
      flags: task.payload.flags,
    },
    tags: extractTags(task.payload), // ["timing-difference", "fee"]
    metadata: {
      taskId: task.id,
      clientName: task.client.name,
      approvedAt: task.updatedAt,
    },
  }));

  console.log(JSON.stringify(examples, null, 2));
}

function extractTags(payload: any): string[] {
  const tags: string[] = [];
  
  if (payload.discrepancies?.some((d: any) => d.type === 'TIMING_DIFFERENCE')) {
    tags.push('timing-difference');
  }
  if (payload.discrepancies?.some((d: any) => d.type === 'MISSING_TRANSACTION')) {
    tags.push('missing-transaction');
  }
  if (payload.flags?.some((f: any) => f.severity === 'error')) {
    tags.push('critical');
  }
  if (payload.discrepancy < 10000) {
    tags.push('small-amount');
  }
  
  return tags;
}

exportApprovedTasks();
```

### Steg 2: Lägg till exemplen i Knowledge Base

**Syfte:** Spara exemplen så att GPT kan använda dem.

**Process:**

#### 2.1 Skapa script för att importera examples
```typescript
// Script: scripts/import-task-examples.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importExamples() {
  // Läs exporterade examples
  const examples = JSON.parse(
    fs.readFileSync('approved-tasks-examples.json', 'utf-8')
  );

  // Hitta modellen
  const model = await prisma.aIModel.findFirst({
    where: {
      name: 'bank-recon-expert',
      taskKind: 'BANK_RECON',
    },
  });

  if (!model) {
    throw new Error('Model not found');
  }

  // Lägg till varje exempel
  for (const example of examples) {
    await prisma.aIModelExample.create({
      data: {
        modelId: model.id,
        name: `Real Task: ${example.metadata.clientName}`,
        input: example.input,
        output: example.output,
        tags: example.tags,
        isActive: true,
        usageCount: 0,
        successRate: 1.0, // Start with 100% (approved task)
      },
    });
  }

  console.log(`✅ Imported ${examples.length} examples`);
}

importExamples();
```

#### 2.2 Kör scriptet
```bash
npx tsx scripts/import-task-examples.ts
```

### Steg 3: Aktivera feedback-loop

**Syfte:** Låt användare ge feedback så att systemet lär sig automatiskt.

**Process:**

#### 3.1 Lägg till feedback-knappar i UI
```typescript
// I coordinator/inbox/page.tsx - när task godkänns
const handleApprove = async (taskId: string) => {
  // ... existing approval logic ...
  
  // Spara feedback automatiskt
  await fetch('/api/ai/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId: task.aiModelId, // Vilken modell användes?
      taskId: taskId,
      rating: 5, // Godkänd = 5/5
      wasCorrect: true,
      input: task.payload.input,
      output: task.payload.output,
      expected: task.payload.output, // Samma som output (korrekt)
    }),
  });
};
```

#### 3.2 Uppdatera success rates automatiskt
```typescript
// I /api/ai/feedback/route.ts - efter feedback sparas
import { trackExampleUsage } from '@/lib/ai-knowledge';

// ... existing code ...

// Hitta vilket exempel som användes (förenklad matching)
const similarExamples = await prisma.aIModelExample.findMany({
  where: {
    modelId: feedback.modelId,
    isActive: true,
  },
});

// Matcha input och uppdatera success rate
for (const example of similarExamples) {
  const similarity = calculateSimilarity(example.input, feedback.input);
  if (similarity > 0.8) { // Liknande input
    await trackExampleUsage(example.id, feedback.wasCorrect ?? false);
  }
}
```

### Steg 4: Lägg till fler few-shot examples manuellt

**Syfte:** Fyll Knowledge Base med olika scenarion.

**Process:**

#### 4.1 Skapa admin-panel för att hantera examples
```typescript
// apps/web/src/app/admin/ai-models/page.tsx
'use client';

export default function AIModelsPage() {
  // Visa alla modeller
  // Möjlighet att lägga till/redigera examples
  // Möjlighet att testa modeller
}
```

#### 4.2 Lägg till examples för olika scenarion

**Vanliga scenarion för bankavstämning:**
1. **Timing difference** - Management fee debiteras men inte bokförd än
2. **Missing transaction** - Transaktion i banken men inte i redovisning
3. **Rounding error** - Avrundningsfel under 1000 SEK
4. **Large discrepancy** - Stor avvikelse som kräver omedelbar granskning
5. **Multiple small differences** - Flera små avvikelser

**Exempel på hur man lägger till:**
```typescript
// Via admin-panel eller direkt i databasen
await prisma.aIModelExample.create({
  data: {
    modelId: 'bank-recon-model-id',
    name: 'Rounding Error - Small Amount',
    tags: ['rounding-error', 'small-amount', 'normal'],
    input: {
      bankBalance: 125000000,
      ledgerBalance: 124999500,
      discrepancy: 500,
      recentTransactions: []
    },
    output: {
      analysis: 'Small discrepancy of 500 SEK. Likely rounding difference.',
      discrepancies: [{
        type: 'ROUNDING_ERROR',
        amount: 500,
        date: new Date().toISOString(),
        explanation: 'Rounding difference - normal'
      }],
      recommendations: ['Accept as rounding difference'],
      flags: [{
        severity: 'info',
        message: 'Small rounding difference detected',
        code: 'ROUNDING_DIFF'
      }]
    },
    isActive: true
  }
});
```

---

## 📊 Praktisk arbetsflöde: Förbättra modellen över tid

### Månad 1: Grundläggande träning

**Vecka 1-2:**
- ✅ Exportera 50 godkända tasks
- ✅ Konvertera till examples
- ✅ Importera till Knowledge Base
- ✅ Verifiera att GPT använder exemplen

**Vecka 3-4:**
- ✅ Implementera feedback-loop i UI
- ✅ Samla feedback från användare
- ✅ Uppdatera success rates automatiskt

### Månad 2: Förbättrad träning

**Vecka 1-2:**
- ✅ Lägg till examples för edge cases
- ✅ Förbättra system prompts med mer domänkunskap
- ✅ A/B testa olika prompts

**Vecka 3-4:**
- ✅ Analysera vilka examples som ger bäst resultat
- ✅ Ta bort examples med låg success rate
- ✅ Lägg till nya examples för vanliga problem

### Månad 3+: Kontinuerlig förbättring

**Varje vecka:**
- ✅ Granska feedback från användare
- ✅ Lägg till nya examples för nya scenarion
- ✅ Förbättra prompts baserat på feedback
- ✅ Mät accuracy och förbättring

---

## 🛠️ Verktyg och Scripts

### Script 1: Exportera godkända tasks
```typescript
// scripts/export-approved-tasks.ts
// (Se ovan)
```

### Script 2: Importera examples
```typescript
// scripts/import-task-examples.ts
// (Se ovan)
```

### Script 3: Analysera feedback
```typescript
// scripts/analyze-feedback.ts
async function analyzeFeedback() {
  const feedback = await prisma.aIFeedback.findMany({
    include: {
      model: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  // Analysera
  const stats = {
    total: feedback.length,
    correct: feedback.filter(f => f.wasCorrect).length,
    avgRating: feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length,
    byModel: {},
  };

  console.log('Feedback Statistics:', stats);
}
```

### Script 4: Rensa dåliga examples
```typescript
// scripts/cleanup-bad-examples.ts
async function cleanupBadExamples() {
  // Ta bort examples med låg success rate
  await prisma.aIModelExample.updateMany({
    where: {
      isActive: true,
      usageCount: { gte: 10 }, // Minst 10 användningar
      successRate: { lt: 0.5 }, // Success rate under 50%
    },
    data: {
      isActive: false,
    },
  });
  
  console.log('✅ Cleaned up bad examples');
}
```

---

## 📈 Förväntade resultat

### Efter 50 examples:
- **Accuracy:** 70-75% (från ~60%)
- **False Positives:** -30%
- **False Negatives:** -25%

### Efter 100 examples + feedback loop:
- **Accuracy:** 85-90%
- **False Positives:** -60%
- **False Negatives:** -50%
- **Användartillfredsställelse:** +40%

### Efter 200+ examples + kontinuerlig feedback:
- **Accuracy:** 90-95%
- **False Positives:** -80%
- **False Negatives:** -70%
- **Systemet blir smartare automatiskt:** ✅

---

## ✅ Checklista: Träna modellen

### Initial setup:
- [ ] Exportera godkända tasks (50+)
- [ ] Konvertera till examples format
- [ ] Importera till Knowledge Base
- [ ] Verifiera att GPT använder exemplen

### Feedback loop:
- [ ] Lägg till feedback-knappar i UI
- [ ] Spara feedback automatiskt när tasks godkänns
- [ ] Uppdatera success rates automatiskt
- [ ] Visa feedback-statistik i admin-panel

### Kontinuerlig förbättring:
- [ ] Lägg till examples för edge cases
- [ ] Förbättra system prompts
- [ ] Analysera feedback regelbundet
- [ ] Rensa dåliga examples
- [ ] Lägg till nya examples för nya scenarion

---

## 🎯 Sammanfattning

### Hur man tränar GPT i praktiken:

1. **Samla verklig data:** Exportera godkända tasks
2. **Konvertera till examples:** Skapa input/output par
3. **Lägg till i Knowledge Base:** Spara i `AIModelExample`
4. **Aktivera feedback:** Låt användare ge feedback
5. **Förbättra automatiskt:** Systemet lär sig från feedback

### Det viktigaste:
- ✅ **Mer examples = bättre resultat**
- ✅ **Feedback loop = automatisk förbättring**
- ✅ **Systemet blir smartare över tid automatiskt**

### Du behöver INTE:
- ❌ Fine-tuning (för tidigt)
- ❌ Trädstruktur (för FAQ-chatbot)
- ❌ Komplex ML (GPT-5-mini klarar detta)

### Du behöver:
- ✅ Verkliga examples från godkända tasks
- ✅ Feedback från användare
- ✅ Kontinuerlig förbättring baserat på feedback

**Starta med att exportera 50 godkända tasks och konvertera till examples - det ger direkt förbättring!** 🚀

