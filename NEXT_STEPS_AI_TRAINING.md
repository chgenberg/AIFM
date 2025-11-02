# 🎓 Nästa Steg: Utbilda GPT med Verkliga Uppgifter

## 📊 Nuvarande Status

### **Vad vi har:**
- ✅ Knowledge Base system i Prisma (`AIModel`, `AIModelExample`, `AIFeedback`)
- ✅ API endpoints för att hantera modeller (`/api/ai/models`)
- ✅ Seed-script med initiala modeller (`scripts/seed-ai-models.ts`)
- ✅ Feedback-system (`/api/ai/feedback`)
- ✅ Task creation som använder AI (`/api/tasks/create`)

### **Vad som saknas:**
- ⚠️ Initiala modeller är inte i databasen ännu (seed-script har inte körts)
- ⚠️ Feedback-loop är inte implementerad (när tasks godkänns/avvisas)
- ⚠️ Automatisk konvertering av godkända tasks till exemplen
- ⚠️ Admin-panel för att hantera modeller

---

## 🚀 Nästa Steg: Konkret Plan

### **Steg 1: Aktivera Initiala Modeller (Nu!)**

**Vad:** Kör seed-script för att skapa initiala modeller i databasen

**Hur:**
```bash
# 1. Kör migration (om inte redan gjort)
npx prisma migrate dev --name add-ai-knowledge-base

# 2. Seed initiala modeller
npx tsx scripts/seed-ai-models.ts
```

**Resultat:**
- ✅ Modeller för BANK_RECON, KYC_REVIEW, REPORT_DRAFT är i databasen
- ✅ Initiala prompts och exemplen är tillgängliga
- ✅ AI kan börja använda Knowledge Base

---

### **Steg 2: Implementera Feedback-Loop (Prioritet 1)**

**Vad:** När Coordinator/Specialist godkänner eller avvisar en task, spara feedback automatiskt

**Var:** `apps/web/src/app/api/tasks/[id]/approve/route.ts` eller `apps/web/src/app/api/tasks/[id]/reject/route.ts`

**Implementation:**
```typescript
// När task godkänns
POST /api/tasks/[id]/approve
{
  approved: true,
  feedback?: string
}

// Automatiskt:
1. Spara feedback i AIFeedback tabell
2. Uppdatera success rate för relaterade exemplen
3. Om task är godkänd → konvertera till nytt exempel (optional)
```

**Varför detta är viktigt:**
- ✅ AI lär sig automatiskt från vad som faktiskt fungerar
- ✅ Success rate för exemplen uppdateras automatiskt
- ✅ Systemet blir smartare över tid utan manuellt arbete

---

### **Steg 3: Konvertera Godkända Tasks till Exempel (Prioritet 2)**

**Vad:** Skapa API endpoint för att konvertera godkända tasks till exemplen

**Var:** `apps/web/src/app/api/ai/examples/from-task/route.ts`

**Implementation:**
```typescript
POST /api/ai/examples/from-task
{
  taskId: "task-123",
  modelId: "bank-recon-expert-v1",
  tags: ["timing-difference", "real-world"]
}

// Process:
1. Hämta task från databasen
2. Extrahera input från task.payload
3. Extrahera output från task (flags, AI-resultat)
4. Skapa nytt AIModelExample
5. Lägg till i Knowledge Base
```

**Varför detta är viktigt:**
- ✅ Verkliga tasks blir exemplen för framtida träning
- ✅ AI lär sig från vad som faktiskt fungerade i verkligheten
- ✅ Bygger upp en databas av verkliga scenarion

---

### **Steg 4: Admin-Panel för Modellhantering (Prioritet 3)**

**Vad:** UI för att hantera modeller, prompts, och exemplen

**Var:** `apps/web/src/app/admin/ai-models/page.tsx`

**Features:**
- ✅ Lista alla modeller
- ✅ Redigera prompts
- ✅ Lägg till/ta bort exemplen
- ✅ Se success rate för exemplen
- ✅ A/B testa olika prompts

**Varför detta är viktigt:**
- ✅ Administratörer kan förbättra AI utan kod-ändringar
- ✅ Enkel att lägga till nya exemplen
- ✅ Visualisera vad som fungerar bra

---

### **Steg 5: Automatisk Exempel-Generering (Prioritet 4)**

**Vad:** Automatiskt konvertera godkända tasks till exemplen

**Var:** Background job eller cron job

**Implementation:**
```typescript
// Varje dag kl 02:00
1. Hämta alla godkända tasks från igår
2. För varje task:
   - Kontrollera om det redan finns som exempel
   - Om inte, konvertera till exempel
   - Lägg till i Knowledge Base
```

**Varför detta är viktigt:**
- ✅ Knowledge Base byggs automatiskt upp
- ✅ Inget manuellt arbete behövs
- ✅ Systemet blir smartare över tid

---

## 🎯 Rekommenderad Ordning

### **Vecka 1: Grundläggande Setup**
1. ✅ Kör seed-script för att skapa initiala modeller
2. ✅ Testa att AI använder Knowledge Base
3. ✅ Verifiera att exemplen fungerar

### **Vecka 2: Feedback-Loop**
1. ✅ Implementera feedback när tasks godkänns/avvisas
2. ✅ Testa att feedback sparas korrekt
3. ✅ Verifiera att success rate uppdateras

### **Vecka 3: Exempel-Generering**
1. ✅ Skapa API endpoint för att konvertera tasks till exemplen
2. ✅ Manuellt konvertera några godkända tasks
3. ✅ Verifiera att nya exemplen fungerar

### **Vecka 4: Admin-Panel**
1. ✅ Bygga grundläggande admin-panel
2. ✅ Lägga till funktionalitet för att hantera modeller
3. ✅ Testa med riktiga användare

---

## 📝 Konkret Implementation: Feedback-Loop

### **Steg 1: Skapa API Endpoint för Task Approval**

**Fil:** `apps/web/src/app/api/tasks/[id]/approve/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { recordAIFeedback } from '@/lib/ai-knowledge';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { approved, feedback, rating } = body;

    // Hämta task
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        flags: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Uppdatera task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: approved ? 'DONE' : 'NEEDS_REVIEW',
        comment: feedback || task.comment,
      },
    });

    // Spara feedback för AI
    // Hitta modell baserat på task kind
    const model = await prisma.aIModel.findFirst({
      where: {
        taskKind: task.kind,
        isDefault: true,
        isActive: true,
      },
    });

    if (model) {
      await recordAIFeedback({
        modelId: model.id,
        userId: (session.user as any)?.id,
        taskId: task.id,
        rating: rating || (approved ? 5 : 2),
        wasCorrect: approved,
        comment: feedback,
        input: task.payload,
        output: {
          flags: task.flags,
          analysis: task.payload.analysis,
        },
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('Error approving task:', error);
    return NextResponse.json(
      { error: 'Failed to approve task', details: error?.message },
      { status: 500 }
    );
  }
}
```

---

### **Steg 2: Implementera i UI**

**Var:** `apps/web/src/app/coordinator/inbox/page.tsx`

**Lägg till:**
```typescript
const handleApprove = async (taskId: string) => {
  const response = await fetch(`/api/tasks/${taskId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      approved: true,
      rating: 5, // eller låt användaren välja
    }),
  });
  
  // Reload tasks
  fetchTasks();
};
```

---

## 🎯 Sammanfattning: Nästa Steg

### **Omedelbart (Idag):**
1. ✅ **Kör seed-script:** `npx tsx scripts/seed-ai-models.ts`
2. ✅ **Verifiera:** Att modeller är i databasen
3. ✅ **Testa:** Att AI använder Knowledge Base

### **Kortsiktigt (Denna vecka):**
1. ✅ **Implementera feedback-loop:** När tasks godkänns/avvisas
2. ✅ **Testa feedback:** Verifiera att det sparas korrekt
3. ✅ **Konvertera tasks:** Manuellt konvertera några godkända tasks till exemplen

### **Medellång sikt (Nästa vecka):**
1. ✅ **Admin-panel:** Bygga UI för modellhantering
2. ✅ **Automatisk exempel-generering:** Background job
3. ✅ **Förbättringar:** Baserat på feedback från användare

---

## 💡 Viktiga Punkter

### **1. Feedback-Loop är Kritiskt**
- ✅ Varje godkänd task = positiv feedback
- ✅ Varje avvisad task = negativ feedback
- ✅ Success rate uppdateras automatiskt
- ✅ Systemet blir smartare över tid

### **2. Verkliga Exempel är Viktigast**
- ✅ Syntetiska exemplen fungerar, men verkliga är bättre
- ✅ Varje godkänd task kan bli ett exempel
- ✅ Bygg upp en databas av verkliga scenarion

### **3. Iterativ Förbättring**
- ✅ Börja med seed-script (initiala modeller)
- ✅ Lägg till feedback-loop (automatisk förbättring)
- ✅ Konvertera tasks till exemplen (bygga databas)
- ✅ Admin-panel (manuell förbättring)

---

**Nästa steg är att köra seed-script och sedan implementera feedback-loop!** 🚀

