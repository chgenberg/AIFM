# 🏷️ White Label-lösning för Ekonomiassistenter

## Översikt

AIFM Portal kan användas som en **white label-lösning** där en ekonomiassistent (eller redovisningsbyrå) kan erbjuda systemet till sina kunder under eget varumärke. Systemet är redan byggt med multi-tenant isolation och rollbaserad åtkomst, vilket gör det perfekt för detta användningsfall.

## 🎯 Användningsfall: Ekonomiassistent med flera kunder

### Scenario
En ekonomiassistent vill:
- Använda systemet för att hantera redovisning för sina kunder (små/medelstora bolag)
- Varje kund ska ha sin egen isolerade miljö
- AI:n ska vara tränad på redovisning (inte fund accounting)
- Kunderna ska kunna logga in och se sina egna data
- Ekonomiassistenten ska kunna hantera alla kunder från en central plats

---

## ✅ Vad som redan finns i systemet

### 1. Multi-Tenant Isolation ✅
Systemet har redan `Client`-modellen som isolerar data per kund:
```prisma
model Client {
  id            String         @id @default(cuid())
  name          String
  orgNo         String         @unique
  tasks         Task[]
  reports       Report[]
  users         User[]
  // ... all data är isolerad per clientId
}
```

**Varje kunds data är helt isolerad:**
- `Task` → `clientId`
- `Report` → `clientId`
- `LedgerEntry` → `clientId`
- `User` → `clientId` (för CLIENT-roll)

### 2. Rollbaserad åtkomst (RBAC) ✅
Det finns fyra roller:
- **ADMIN**: Full systemåtkomst (för ekonomiassistenten)
- **COORDINATOR**: Kan granska och godkänna tasks (för ekonomiassistenten)
- **SPECIALIST**: Kan skapa och redigera rapporter (för ekonomiassistenten)
- **CLIENT**: Kan bara se sina egna data (för kunderna)

### 3. AI Knowledge Base ✅
AI-modeller kan tränas per task type:
- `BANK_RECON` - Bankavstämning
- `KYC_REVIEW` - KYC-granskning (kan anpassas för företagsverifiering)
- `REPORT_DRAFT` - Rapportgenerering
- `QC_CHECK` - Kvalitetskontroll

---

## 🔧 Vad som behöver läggas till för white label

### 1. Ny roll: `ACCOUNTANT` eller `ACCOUNTANT_ADMIN`

**Syfte:** Ekonomiassistenten behöver en roll som kan:
- Hantera flera kunder (flera `Client`-instanser)
- Se alla sina kunders data
- Skapa/ta bort kunder
- Anpassa systemet för varje kund

**Implementering:**
```prisma
enum Role {
  CLIENT
  COORDINATOR
  SPECIALIST
  ADMIN
  ACCOUNTANT_ADMIN  // Ny roll
}

model User {
  // ... existing fields
  role Role
  managedClients Client[] @relation("AccountantManagedClients") // Nya relation
}

model Client {
  // ... existing fields
  accountantId String?  // Referens till ekonomiassistenten
  accountant User? @relation("AccountantManagedClients", fields: [accountantId], references: [id])
}
```

### 2. White Label Branding

**Syfte:** Varje kund (eller ekonomiassistent) ska kunna anpassa:
- Logo
- Färger
- Domännamn (subdomain eller custom domain)
- Företagsnamn i UI

**Implementering:**
```prisma
model Client {
  // ... existing fields
  branding Branding?
}

model Branding {
  id String @id @default(cuid())
  clientId String @unique
  client Client @relation(fields: [clientId], references: [id])
  
  logoUrl String?
  primaryColor String? // Hex color
  secondaryColor String?
  companyName String?
  customDomain String? // e.g., "client1.accountant.com"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. Anpassad AI-träning för redovisning

**Behov:** AI:n behöver tränas på:
- Redovisning för små/medelstora bolag
- Svenska redovisningsregler (K3)
- Typiska redovisningsuppgifter (bokföring, årsredovisning, momsdeklaration)

**Implementering:**
```typescript
// Skapa nya AI-modeller för redovisning
const accountingModels = [
  {
    name: 'accounting-qc-expert',
    taskKind: 'QC_CHECK',
    prompts: [
      {
        role: 'system',
        content: `Du är en expert på svensk redovisning enligt K3-regler. 
        Din uppgift är att:
        1. Granska bokföringstransaktioner för fel
        2. Kontrollera att kontoplanen följs korrekt
        3. Identifiera avvikelser och rekommendera åtgärder
        4. Säkerställa att momsen är korrekt bokförd
        
        Alltid använd svenska och var professionell men vänlig.`
      }
    ]
  },
  {
    name: 'accounting-reconciliation-expert',
    taskKind: 'BANK_RECON',
    prompts: [
      {
        role: 'system',
        content: `Du är en expert på bankavstämning för små och medelstora bolag.
        Din uppgift är att:
        1. Matcha banktransaktioner med bokföringsposter
        2. Identifiera timing-differenser
        3. Hitta saknade transaktioner
        4. Föreslå justeringar
        
        Alltid använd svenska och var professionell men vänlig.`
      }
    ]
  }
];
```

### 4. Anpassade Task Types för redovisning

**Behov:** Nya uppgiftstyper för redovisning:
- `ACCOUNTING_RECON`: Bankavstämning
- `ACCOUNTING_QC`: Kvalitetskontroll av bokföring
- `VAT_REPORT`: Momsdeklaration
- `ANNUAL_REPORT`: Årsredovisning
- `PAYROLL`: Lönehantering

**Implementering:**
```prisma
enum TaskKind {
  // Existing
  QC_CHECK
  KYC_REVIEW
  REPORT_DRAFT
  BANK_RECON
  
  // New for accounting
  ACCOUNTING_RECON
  ACCOUNTING_QC
  VAT_REPORT
  ANNUAL_REPORT
  PAYROLL
}
```

### 5. Subdomain eller Custom Domain Support

**Syfte:** Varje kund ska kunna komma åt systemet via:
- `client1.accountant.com`
- `client2.accountant.com`
- Eller `client.customdomain.se`

**Implementering:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if it's a subdomain
  const subdomain = hostname.split('.')[0];
  
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // Find client by subdomain or custom domain
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { branding: { customDomain: hostname } },
          { id: subdomain }, // Or use a slug field
        ]
      },
      include: { branding: true }
    });
    
    if (client?.branding) {
      // Set branding in request headers or context
      request.headers.set('x-client-id', client.id);
      request.headers.set('x-client-branding', JSON.stringify(client.branding));
    }
  }
  
  // ... rest of middleware
}
```

---

## 📋 Implementeringsplan

### Fas 1: Grundläggande white label (2-3 veckor)

1. **Lägg till ACCOUNTANT_ADMIN-roll**
   - Uppdatera Prisma schema
   - Migrera databasen
   - Uppdatera RBAC-permissions

2. **Skapa Branding-modell**
   - Lägg till `Branding` i Prisma
   - Skapa API endpoints för branding (`/api/branding`)
   - Skapa admin UI för att hantera branding

3. **Anpassa UI för branding**
   - Dynamisk logo i Header
   - Dynamiska färger via CSS variables
   - Anpassa företagsnamn i footer/header

### Fas 2: AI-träning för redovisning (1-2 veckor)

1. **Skapa nya AI-modeller**
   - `accounting-qc-expert`
   - `accounting-reconciliation-expert`
   - `accounting-report-drafter`

2. **Träna AI:n med redovisningsexempel**
   - Lägg till few-shot examples för typiska redovisningsuppgifter
   - Anpassa prompts för svensk redovisning

3. **Lägg till nya Task Types**
   - `ACCOUNTING_RECON`
   - `ACCOUNTING_QC`
   - `VAT_REPORT`
   - etc.

### Fas 3: Subdomain/Custom Domain (2-3 veckor)

1. **Subdomain-hantering**
   - Uppdatera middleware för att hantera subdomains
   - Lägg till `subdomain` eller `slug` i Client-modellen

2. **DNS-konfiguration**
   - Dokumentera hur man konfigurerar wildcard DNS
   - Lägg till stöd för custom domains

3. **SSL-certifikat**
   - Automatisera SSL via Let's Encrypt
   - Eller instruktioner för att använda Cloudflare/andra providers

---

## 💰 Affärsmodell

### För ekonomiassistenten:
- **Prenumeration per kund:** 500-2000 SEK/månad per kund
- **Bas-paket:** 10-50 kunder ingår
- **Premium:** Obegränsat antal kunder + priority support

### För kunden:
- **Ingen extra kostnad:** Inkluderat i ekonomiassistentens avgift
- **Egen portal:** Kommer åt sina egna data via subdomain
- **Begränsad åtkomst:** Kan bara se sina egna data

---

## 🚀 Nästa steg

1. **Diskutera prioritet:** Vilken fas är viktigast först?
2. **Skapa proof-of-concept:** Börja med Fas 1 (grundläggande white label)
3. **Testa med en pilottkund:** Ta en kund och testa white label-funktionaliteten
4. **Iterera baserat på feedback:** Anpassa efter behov

---

## 📝 Exempel: Hur det skulle fungera

### Setup för ekonomiassistenten:
```typescript
// 1. Skapa ekonomiassistent-konto
const accountant = await prisma.user.create({
  data: {
    email: 'ekonomiassistent@example.com',
    role: 'ACCOUNTANT_ADMIN',
    name: 'Mina Ekonomiassistenter AB'
  }
});

// 2. Lägg till kund
const client = await prisma.client.create({
  data: {
    name: 'Kund AB',
    orgNo: '556123-4567',
    accountantId: accountant.id,
    branding: {
      create: {
        logoUrl: '/logos/kund-ab.png',
        primaryColor: '#1e40af',
        companyName: 'Kund AB Portal',
        customDomain: 'kund-ab.accountant.com'
      }
    }
  }
});

// 3. Skapa kundanvändare
const clientUser = await prisma.user.create({
  data: {
    email: 'info@kund-ab.se',
    role: 'CLIENT',
    clientId: client.id,
    name: 'Kund AB Admin'
  }
});
```

### Användning:
1. **Ekonomiassistenten loggar in** → Ser alla sina kunder
2. **Väljer en kund** → Ser all data för den kunden
3. **Skapar tasks** → AI:n hanterar redovisningsuppgifter
4. **Kunden loggar in** → Ser bara sina egna data, med eget branding

---

## ❓ Frågor att besvara

1. **Hur många kunder** räknar ekonomiassistenten med att hantera?
2. **Behövs subdomain** eller är det okej med en portal där kunden väljer sin organisation?
3. **Vilken typ av redovisning** handlar det om? (Bokföring, årsredovisning, moms, löner?)
4. **Integrationer:** Behövs integrationer med Fortnox, Visma, eller andra system?
5. **Rapporter:** Vilka typer av rapporter ska kunderna kunna se?

---

## 🎯 Rekommendation

**Starta med Fas 1 (grundläggande white label)** för att:
- Snabbt få en fungerande white label-lösning
- Testa marknaden och få feedback
- Bygga vidare baserat på verkliga behov

Systemet är redan väl förberett för white label tack vare sin multi-tenant-arkitektur! 🚀

