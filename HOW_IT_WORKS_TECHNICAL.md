# 🤖 VAD ÄR AIFM PORTALEN? - TEKNISK ÖVERSIKT

## 🎯 VAD GÖR TJÄNSTEN?

AIFM Portal är ett **AI-drivet fondredovisningssystem** som automatiserar tre huvuduppgifter:

### 1. **Bankavstämning (Bank Reconciliation)**
- **Vad:** Jämför bankutdrag med redovisningen
- **Varför:** Hitta diskrepanser och fel
- **Hur:** AI analyserar transaktioner och flaggar skillnader

### 2. **KYC-granskning (Know Your Customer)**
- **Vad:** Kontrollerar investorers identitet och compliance
- **Varför:** Måste enligt lag för att förhindra penningtvätt
- **Hur:** AI kontrollerar mot PEP-listor, sanktionsregister, UBO-struktur

### 3. **Rapportgenerering (Report Drafting)**
- **Vad:** Skapar månads-/kvartals-/årsrapporter för fonder
- **Varför:** Klienter behöver professionella rapporter
- **Hur:** AI analyserar data och skriver första versionen

---

## 🔌 VAD KOPPLAR JAG UPP DEN MOT?

### **Data-källor (ETL Workers)**

Systemet kan koppla upp mot:

1. **Banker** (via PSD2/Nordigen)
   - Automatisk hämtning av bankutdrag
   - Transaktioner importeras till databasen
   - Exempel: SEB, Nordea, Handelsbanken

2. **Redovisningssystem**
   - **Fortnox** - Svenska bokföringssystem
   - **Allvue** - Fondspecifikt system
   - Manuella imports också möjliga

3. **Skatteverket (SKV)**
   - För verifiering av organisationsnummer

4. **Finansinspektionen (FI)**
   - För compliance-kontroller

### **Hur data flödar:**

```
Bank API → ETL Worker → PostgreSQL Database → AI Processing → Tasks → Human Review → Reports
```

---

## 🤖 HUR FUNGERAR GPT/OPENAI?

### **AI används på tre ställen:**

### **1. Bank Reconciliation (GPT analyserar)**

**Input:**
- Bankutdrag (från bank API)
- Ledger entries (från redovisningssystem)

**Vad GPT gör:**
```json
{
  "bankBalance": 125000000,
  "ledgerBalance": 124950000,
  "discrepancy": 50000,
  "analysis": "AI analyserar varför det finns skillnad",
  "flags": [
    {"type": "error", "message": "Saknad transaktion: -50000 SEK"}
  ]
}
```

**System Prompt:**
```
Du är en expert på fondredovisning och bankavstämning.
Jämför bankutdrag med redovisningen.
Identifiera diskrepanser och deras orsaker.
Klassificera avvikelser (kritiska, varningar, info).
```

### **2. KYC Review (GPT granskar)**

**Input:**
- Investor-information
- UBO-struktur (Ultimate Beneficial Owner)
- Dokumentation

**Vad GPT gör:**
```json
{
  "investorName": "Pension Fund Sweden AB",
  "riskLevel": "medium",
  "pepStatus": "clear",
  "sanctionStatus": "clear",
  "approved": true,
  "issues": []
}
```

**System Prompt:**
```
Du är en compliance officer.
Verifiera investerares identitet.
Bedöm risknivå (low, medium, high).
Kontrollera PEP-status och sanktionslister.
```

### **3. Report Drafting (GPT skriver)**

**Input:**
- Fund data (NAV, performance, holdings)
- Period (t.ex. oktober 2024)
- Historik

**Vad GPT gör:**
```markdown
# Nordic Growth Fund - October 2024 Report

## Executive Summary
Fund NAV as of October 31, 2024: **SEK 125,000,000**

## Performance Metrics
- Return YTD: +8.2%
- Monthly Return: +1.5%
...
```

**System Prompt:**
```
Du är en professionell fondredovisningsrapportskrivare med 15 års erfarenhet.
Sammanfatta fondens prestanda.
Analysera portföljhållningar.
Bedöm risker.
Skriva en professionell, läsbar rapport.
```

---

## 🔄 KOMPLETT DATAFLÖDE

### **Steg 1: Data hämtas**
```
Bank API → ETL Worker → PostgreSQL
Fortnox API → ETL Worker → PostgreSQL
```

### **Steg 2: AI-processar**
```
GPT analyserar data → Skapar Tasks → Flaggar diskrepanser
```

### **Steg 3: Människa granskar**
```
Coordinator ser tasks → Godkänner/avvisar
```

### **Steg 4: Specialist finaliserar**
```
Specialist redigerar rapport → Godkänner → Publiserar
```

---

## 💻 VAR ÄR KODEN?

### **OpenAI-integration:**
- `apps/web/src/app/api/ai/process/route.ts` - Hanterar AI-anrop
- `apps/web/src/app/api/ai/report/route.ts` - Genererar rapporter

### **ETL Workers:**
- `apps/workers/src/workers/etl.bank.ts` - Hämtar bankdata
- `apps/workers/src/workers/etl.fortnox.ts` - Hämtar Fortnox-data

### **AI Processing:**
- `apps/web/src/app/api/ai/process/route.ts` - System prompts och few-shot examples

---

## 🔑 MILJÖVARIABLER DU BEHÖVER

I Railway måste du ha:

```bash
# OpenAI
OPENAI_API_KEY=sk-...           # Din OpenAI API-nyckel
OPENAI_MODEL=gpt-5-mini         # Model att använda

# Database
DATABASE_URL=postgresql://...    # PostgreSQL connection string

# NextAuth
NEXTAUTH_URL=https://...         # Din Railway URL
NEXTAUTH_SECRET=...              # Random secret

# Optional
REDIS_URL=...                    # För job queues
```

---

## 🎬 PRAKTISKT EXEMPEL

### **Scenario: Bankavstämning för oktober**

1. **ETL Worker hämtar data:**
   - Bank API: 125,000,000 SEK
   - Redovisning: 124,950,000 SEK
   - Skillnad: 50,000 SEK

2. **AI analyserar:**
   - GPT får data via `/api/ai/process`
   - GPT analyserar: "Saknad transaktion: -50,000 SEK"
   - Skapar Task med status "NEEDS_REVIEW"

3. **Coordinator ser task:**
   - Går till `/coordinator/inbox`
   - Ser "BANK RECON - Nordic Growth Fund"
   - Flag: "Discrepancy: 50,000 SEK"
   - Klickar "APPROVE" när allt är korrekt

4. **Task markeras som DONE:**
   - Systemet fortsätter automatiskt

---

## 📚 VAR FINNS SYSTEM PROMPTS?

I `apps/web/src/app/api/ai/process/route.ts`:

```typescript
const SYSTEM_PROMPTS = {
  BANK_RECON: `Du är en expert på fondredovisning...
  KYC_REVIEW: `Du är en compliance officer...
  REPORT_DRAFT: `Du är en professionell fondredovisningsrapportskrivare...
`;
```

Dessa prompts "tränar" GPT att förstå vad den ska göra!

---

## 🚀 SÄTT UPP EGEN INTEGRATION

För att koppla upp mot riktiga system:

1. **Bank API:**
   - Skaffa API-nyckel från Nordigen eller din bank
   - Lägg till i `apps/workers/src/workers/etl.bank.ts`

2. **Fortnox:**
   - Skaffa API-nyckel från Fortnox
   - Lägg till i `apps/workers/src/workers/etl.fortnox.ts`

3. **OpenAI:**
   - Redan kopplat! Använder din API-nyckel
   - Prompts kan justeras i `route.ts`-filerna

---

## ❓ VANLIGA FRÅGOR

**Q: Behöver jag träna GPT?**
A: Nej! System prompts och few-shot examples gör att GPT förstår uppgiften direkt.

**Q: Var lagras data?**
A: PostgreSQL-databasen på Railway. All data finns där.

**Q: Kan jag koppla upp flera banker?**
A: Ja! Varje client kan ha flera bankkonton.

**Q: Fungerar AI på svenska?**
A: Ja! System prompts är på svenska, så GPT svarar på svenska.

---

**Nu förstår du hur systemet fungerar!** 🎉

