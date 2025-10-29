# 📖 SÅ ANVÄNDER DU AIFM PORTALEN - KOMPLETT GUIDE

## 🎯 ÖVERSIKT
AIFM Portal är ett AI-drivet system för fondredovisning som automatiserar:
- **Bankavstämning** (reconciliation)
- **KYC-granskning** (investor verification)
- **Rapportgenerering** (report drafting)

## 👥 TRE ROLLER

### 1. **ADMIN** - Översikt och monitoring
- Se systemstatistik (hur många clients, tasks, reports)
- Övervaka systemhälsa
- Hantera användare

### 2. **COORDINATOR** - Quality Control
- Granska tasks som AI har flaggat
- Godkänna eller avvisa tasks
- Säkerställa kvalitet innan nästa steg

### 3. **SPECIALIST** - Expert Review
- Granska AI-genererade rapporter
- Redigera och förbättra rapporter
- Flytta rapporter genom approval-processen

---

## 🚀 STEG-FÖR-STEG GUIDE

### **STEG 1: Logga in**

1. Gå till: `https://aifm-production.up.railway.app`
2. Klicka på **"SIGN IN"**
3. Använd ett av dessa konton:
   - **Email:** `admin@aifm.com` | **Password:** `Password1!`
   - **Email:** `coordinator@aifm.com` | **Password:** `Password1!`
   - **Email:** `specialist@aifm.com` | **Password:** `Password1!`

### **STEG 2: Välj din roll**

Efter inloggning ser du en **dashboard-startsida** som visar din roll. Klicka på **"ENTER DASHBOARD"**.

---

## 📋 PRAKTISKA EXEMPEL

### **Exempel 1: Som COORDINATOR - Granska en Bank Reconciliation**

1. **Logga in** som `coordinator@aifm.com`
2. Du kommer till **"QUALITY CONTROL INBOX"**
3. Du ser **3 tasks**:
   - **BANK RECON** - Bankavstämning för Nordic Growth Fund
   - **KYC REVIEW** - KYC-granskning för Pension Fund Sweden AB
   - **REPORT DRAFT** - Rapport som väntar på granskning

4. **Klicka på "APPROVE"** för BANK RECON-tasken
5. Tasken försvinner från listan (markeras som godkänd)
6. Systemet fortsätter automatiskt till nästa steg

**Vad händer här?**
- AI har jämfört bankutdrag med redovisningen
- AI har flaggat något som behöver granskas
- Du som Coordinator godkänner att allt stämmer

---

### **Exempel 2: Som SPECIALIST - Granska och redigera en rapport**

1. **Logga in** som `specialist@aifm.com`
2. Du kommer till **"SPECIALIST BOARD"**
3. Du ser **4 kolumner**:
   - **DRAFT** - AI-genererade rapporter
   - **QC** - Rapporter som väntar på quality control
   - **APPROVAL** - Rapporter som väntar på godkännande
   - **PUBLISHED** - Färdiga rapporter

4. I **DRAFT-kolumnen** ser du:
   - **FUND ACCOUNTING** rapport för Nordic Growth Fund
   - Period: Oktober 2024

5. **Klicka på edit-ikonen** (penna) för att redigera rapporten
6. Du kan nu:
   - Läsa AI-genererad text
   - Redigera och förbättra
   - Spara ändringar

7. **Klicka på check-ikonen** för att flytta rapporten till nästa steg (QC → APPROVAL → PUBLISHED)

**Vad händer här?**
- AI har genererat en första version av rapporten
- Du som Specialist granskar och förbättrar den
- När den är klar godkänner du den så den kan publiceras

---

### **Exempel 3: Som ADMIN - Översikt**

1. **Logga in** som `admin@aifm.com`
2. Du kommer till **"ADMIN DASHBOARD"**
3. Du ser **statistik**:
   - **Clients:** 1 (Nordic Growth Fund)
   - **Tasks:** 3 (alla olika typer)
   - **Reports:** 1 (Fund Accounting rapport)
   - **Investors:** 1 (Pension Fund Sweden AB)

4. Du ser också **breakdown**:
   - Hur många tasks i varje status (QUEUED, NEEDS_REVIEW, DONE, etc.)
   - Hur många reports i varje status (DRAFT, QC, APPROVAL, PUBLISHED)

**Vad ser du här?**
- Översikt över hela systemet
- Antal tasks som väntar på granskning
- Antal rapporter i olika stages

---

## 🔄 KOMPLETT ARBETSFLÖDE

### **Scenario: En ny månadsrapport ska skapas**

1. **AI genererar** en rapport baserat på bankdata och ledger entries
   - Rapport skapas som **DRAFT**
   - Task skapas av typen **REPORT_DRAFT**

2. **SPECIALIST** ser rapporten i sin board
   - Redigerar och förbättrar texten
   - Flyttar den till **QC**-stadiet

3. **COORDINATOR** granskar rapporten
   - Kontrollerar att allt stämmer
   - Godkänner eller begär ändringar
   - Flyttar den till **APPROVAL**-stadiet

4. **SPECIALIST** (eller ADMIN) gör final review
   - Godkänner rapporten
   - Flyttar den till **PUBLISHED**
   - Rapport är nu klar och kan levereras till klienten

---

## 💡 TIPS

- **Varje task har en status** - När du godkänner en task, ändras dess status till DONE
- **Rapporter flödar genom stages** - DRAFT → QC → APPROVAL → PUBLISHED
- **Flaggade items** - När AI hittar något som behöver granskas, flaggas det
- **Bank Reconciliation** - AI jämför bankutdrag med redovisningen och flaggar diskrepanser
- **KYC Review** - AI kontrollerar investors mot PEP-listor och sanktionsregister

---

## 🎬 TESTA NU

1. **Logga in** som `coordinator@aifm.com`
2. Se de 3 tasks i inboxen
3. Klicka **"APPROVE"** på BANK RECON-tasken
4. Se att den försvinner från listan
5. Logga in som `specialist@aifm.com`
6. Se rapporten i DRAFT-kolumnen
7. Klicka på edit-ikonen för att redigera
8. Klicka på check-ikonen för att flytta till nästa steg

**Nu förstår du hur systemet fungerar!** 🚀

