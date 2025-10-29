# 🎓 AI Training Strategies - Complete Guide

## Så här fungerar det nu (och hur du förbättrar det)

### ✅ VAD DU HAR NU (Bra start!)

1. **System Prompts** - Instruktioner till GPT om vad den ska göra
2. **Few-Shot Examples** - Exempel på input/output för att "lära" GPT
3. **Context från Prisma** - Real-time data från databasen

**Var:** `/apps/web/src/app/api/ai/process/route.ts`

---

## 🎯 METODER ATT FÖRBÄTTRA AI (Rankad efter effektivitet)

### 1. **PROMPT ENGINEERING** (Vad du gör nu) ⭐⭐⭐⭐⭐
**Bäst för:** Snabb implementation, bra resultat direkt

**Hur det fungerar:**
- System prompts definierar rollen och uppgiften
- Few-shot examples visar vad korrekt output ser ut
- Context från databasen ger real-time data

**Förbättringar du kan göra:**
```typescript
// Lägg till fler few-shot examples
const FEW_SHOT_EXAMPLES = {
  BANK_RECON: [
    // Lägg till 3-5 olika scenarion
    example1, example2, example3, example4, example5
  ]
};

// Lägg till mer detaljerad system prompt
const SYSTEM_PROMPT = `
Du är en expert på fondredovisning med 15 års erfarenhet.

DOMÄNKUNSKAP:
- Bank reconciliation: Jämför bankutdrag med redovisning
- Timing differences är VANLIGA och normalt (inte kritiskt)
- Belopp under 10,000 SEK är ofta avrundningsfel
- Management fees debiteras vanligtvis månadsvis

REGELVERK:
- Svenska fondregler kräver stämning T+3
- AML-regler kräver PEP-check för alla investerare
- Kapitalförvaltningslagen (SFS 2019:579)

RETURNERA JSON med exakt denna struktur:
{...}
`;
```

---

### 2. **KNOWLEDGE BASE I PRISMA** (Rekommenderas!) ⭐⭐⭐⭐⭐
**Bäst för:** Skalbar kunskap, dynamiska exempel, versionshantering

**Koncept:** Lagra prompts, exempel, och FAQ i databasen istället för hardcoded.

**Schema för Prisma:**
```prisma
model AIModel {
  id          String   @id @default(cuid())
  name        String   // "bank-recon-expert-v2"
  version     String   // "1.2.0"
  description String?
  
  prompts     AIModelPrompt[]
  examples    AIModelExample[]
  settings    Json?    // { verbosity: "high", reasoning_effort: "standard" }
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  isActive    Boolean  @default(true)
}

model AIModelPrompt {
  id          String   @id @default(cuid())
  modelId     String
  model       AIModel  @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  role        String   // "system" | "user" | "assistant"
  content     String   // Prompt text
  order       Int      // Ordning i messages array
  
  createdAt   DateTime @default(now())
  
  @@index([modelId, order])
}

model AIModelExample {
  id          String   @id @default(cuid())
  modelId     String
  model       AIModel  @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  taskKind    String   // "BANK_RECON" | "KYC_REVIEW" | etc.
  input       Json     // Example input
  output      Json     // Expected output
  tags        String[] // ["timing-difference", "high-amount"]
  
  usageCount  Int      @default(0) // Hur ofta den används
  successRate Float?   // Hur ofta den ger korrekt resultat
  
  createdAt   DateTime @default(now())
  
  @@index([modelId, taskKind])
}

model AIKnowledgeBase {
  id          String   @id @default(cuid())
  category    String   // "workflow" | "regulation" | "common-issues"
  title       String
  content     String   // Markdown text
  tags        String[]
  
  views       Int      @default(0)
  helpful     Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fördelar:**
- ✅ Uppdatera prompts utan deployment
- ✅ A/B testa olika prompts
- ✅ Spåra vilka exempel som fungerar bäst
- ✅ Admin-panel för att hantera kunskap
- ✅ Versionshantering

---

### 3. **RAG (Retrieval Augmented Generation)** ⭐⭐⭐⭐
**Bäst för:** Stora dokumentbibliotek, regelverk, historiska cases

**Koncept:** 
1. Skapa embeddings av dokument/kunskap
2. Sök relevanta dokument baserat på frågan
3. Inkludera i context till GPT

**Implementation:**
```typescript
// När du sparar kunskap
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: knowledgeBaseContent
});

// När användare frågar
const queryEmbedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: userQuestion
});

// Sök i vektor-databas (ex. Pinecone, Weaviate, eller PostgreSQL med pgvector)
const relevantDocs = await searchSimilarDocuments(queryEmbedding);

// Inkludera i prompt
const enhancedPrompt = `
SYSTEM KNOWLEDGE:
${relevantDocs.map(doc => doc.content).join('\n\n')}

USER QUESTION: ${userQuestion}
`;
```

---

### 4. **FINE-TUNING** ⭐⭐⭐
**Bäst för:** Mycket specifik domänkunskap, konsistent output

**När att använda:**
- Du har 100+ exempel på korrekt input/output
- Du vill ha konsistent output-format
- Du har specifik terminologi

**Nackdelar:**
- Kräver träningsdata (100+ exempel)
- Kostar mer att träna
- Svårare att uppdatera (måste träna om)

---

### 5. **HYBRID APPROACH** (Bästa lösningen!) ⭐⭐⭐⭐⭐
**Kombinera allt:**

```
┌─────────────────────────────────────────┐
│  User Question                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  1. Sök Knowledge Base (RAG)           │
│     - Regelverk                         │
│     - Historiska cases                  │
│     - FAQ                               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Hämta System Prompt från Prisma    │
│     - Aktuell version                   │
│     - Few-shot examples                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Hämta Context från Prisma          │
│     - Tasks, Reports, Clients          │
│     - Real-time data                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Bygg Complete Prompt               │
│     System Prompt                       │
│     + Few-Shot Examples                │
│     + Knowledge Base Content            │
│     + Real-time Context                 │
│     + User Question                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Call GPT-5-mini                    │
│     - Med alla context                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  6. Spara Feedback (för förbättring)    │
│     - Var svaret korrekt?               │
│     - Uppdatera example success rate    │
└─────────────────────────────────────────┘
```

---

## 🚀 REKOMMENDATIONER FÖR DITT SYSTEM

### **STEG 1: Förbättra nuvarande prompts** (1-2 timmar)
1. Lägg till fler few-shot examples (3-5 per task type)
2. Förbättra system prompts med mer domänkunskap
3. Lägg till vanliga edge cases

### **STEG 2: Knowledge Base i Prisma** (4-6 timmar) ⭐ REKOMMENDERAS
- Skapa AIModel, AIModelPrompt, AIModelExample tabeller
- Admin-panel för att hantera prompts
- Versionshantering och A/B testing

### **STEG 3: Feedback Loop** (2-3 timmar)
- Spåra vilka svar som är korrekta
- Uppdatera example success rates
- Automatisk förbättring över tid

### **STEG 4: RAG (Om du har många dokument)** (6-8 timmar)
- Embeddings för regelverk och dokumentation
- Vektor-sökning för relevant kunskap

---

## 💡 PRAKTISK IMPLEMENTATION

**Du behöver INTE:**
- ❌ Trädstruktur med frågor i Prisma (det är för FAQ-chatbot)
- ❌ Fine-tuning (för tidigt, du har för få exempel ännu)

**Du BÖR:**
- ✅ Förbättra prompts med mer domänkunskap
- ✅ Lägg till fler few-shot examples
- ✅ Bygga Knowledge Base i Prisma (för skalbarhet)
- ✅ Feedback-loop för att lära från användning

Vill du att jag ska:
1. Bygga Knowledge Base-schemat i Prisma?
2. Förbättra nuvarande prompts med mer domänkunskap?
3. Skapa admin-panel för att hantera prompts?

Hur vill du gå vidare?

