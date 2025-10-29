# 🎯 SÅ ANVÄNDER DU SYSTEMET - SNABB GUIDE

## 🚀 STEG-FÖR-STEG

### **1. Logga in**
```
URL: https://aifm-production.up.railway.app
Email: admin@aifm.com
Password: Password1!
```

### **2. Konfigurera API-nycklar (Fortnox/Bank)**

**Via Admin Dashboard:**
1. Gå till **Admin Dashboard** → Klicka på **"Data Feeds"**
2. Klicka **"Add DataFeed"**
3. Välj Client (t.ex. "Nordic Growth Fund")
4. Välj Source: **FORTNOX** eller **BANK**
5. Fyll i API-nyckel:
   - **Fortnox**: API Key, Access Token (optional), Company ID (optional)
   - **Bank**: Requisition ID, Account ID
6. Klicka **"Create DataFeed"**

**Via Railway (för hela systemet):**
1. Gå till Railway Dashboard
2. Välj ditt projekt
3. Gå till **Variables**
4. Lägg till:
   ```
   FORTNOX_API_KEY=din-nyckel
   FORTNOX_ACCESS_TOKEN=din-token
   NORDIGEN_SECRET_ID=din-id
   NORDIGEN_SECRET_KEY=din-nyckel
   ```

### **3. Hämta data från Fortnox/Bank**

**Via UI:**
1. Gå till **Admin Dashboard** → **Data Feeds**
2. Hitta din DataFeed
3. Klicka **"Sync Now"**
4. Vänta på att workers hämtar data

**Via API:**
```bash
POST /api/datafeeds/sync
{
  "clientId": "nordic-growth-fund-id",
  "source": "FORTNOX",
  "period": {
    "start": "2024-10-01",
    "end": "2024-10-31"
  }
}
```

### **4. Trigga AI-analys**

**Via UI:**
1. Gå till **Admin Dashboard** → **Data Feeds**
2. Under varje client finns knappar:
   - **"Bank Reconciliation"** - Analyserar bankdata vs redovisning
   - **"KYC Review"** - Granskar investor compliance
   - **"Report Draft"** - Genererar rapport
3. Klicka på önskad knapp
4. Vänta 10-30 sekunder på AI-analys
5. Task skapas automatiskt!

**Via API:**
```bash
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

### **5. Granska resultat**

**Som Coordinator:**
1. Gå till **Coordinator Inbox**
2. Se alla tasks som behöver granskas
3. Klicka på en task för att se detaljer
4. Klicka **"APPROVE"** om allt stämmer
5. Klicka **"REJECT"** om det behöver ändras

**Som Specialist:**
1. Gå till **Specialist Board**
2. Se rapporter i olika stadier
3. Redigera rapporter med penna-ikonen
4. Flytta till nästa steg med check-ikonen

---

## 🔑 VAR FINNS API-NYCKLAR?

### **Fortnox:**
1. Logga in på Fortnox: https://www.fortnox.se
2. Gå till **Inställningar** → **API**
3. Skapa ny API-nyckel
4. Kopiera **API Key** och **Access Token**

### **Nordigen (Bank):**
1. Registrera dig på Nordigen: https://nordigen.com
2. Skapa Application
3. Hämta **Secret ID** och **Secret Key**
4. Skapa Requisition för ditt bankkonto

---

## 📊 EXEMPEL: Bankavstämning oktober 2024

### **Steg 1: Konfigurera Bank API**
```
1. Gå till Admin → Data Feeds
2. Klicka "Add DataFeed"
3. Välj Client: "Nordic Growth Fund"
4. Source: "BANK"
5. Fyll i Nordigen-uppgifter
6. Klicka "Create"
```

### **Steg 2: Hämta bankdata**
```
1. Under DataFeed, klicka "Sync Now"
2. Workers hämtar transaktioner från banken
3. Data sparas i databasen
```

### **Steg 3: Trigga AI-analys**
```
1. Under Client, klicka "Bank Reconciliation"
2. Systemet hämtar bankdata och ledgerdata
3. AI analyserar diskrepanser
4. Task skapas med flags
```

### **Steg 4: Granska**
```
1. Coordinator går till Inbox
2. Ser task med analys
3. Godkänner om allt stämmer
```

---

## 💻 API-ANROP DU KAN GÖRA

### **1. Skapa DataFeed**
```bash
curl -X POST https://din-app.railway.app/api/datafeeds \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=din-session" \
  -d '{
    "clientId": "client-id",
    "source": "FORTNOX",
    "configJson": {
      "apiKey": "din-fortnox-nyckel",
      "accessToken": "din-token"
    }
  }'
```

### **2. Trigger Sync**
```bash
curl -X POST https://din-app.railway.app/api/datafeeds/sync \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-id",
    "source": "FORTNOX",
    "period": {
      "start": "2024-10-01",
      "end": "2024-10-31"
    }
  }'
```

### **3. Skapa Task**
```bash
curl -X POST https://din-app.railway.app/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-id",
    "kind": "BANK_RECON",
    "payload": {
      "periodStart": "2024-10-01",
      "periodEnd": "2024-10-31"
    }
  }'
```

---

## 🎬 KOMPLETT FLÖDE I UI

### **Scenario: Månadsavstämning**

1. **Admin Dashboard** → **Data Feeds**
2. **Add DataFeed** → Välj Client → Fortnox → Fyll i API-nyckel → **Create**
3. **Sync Now** → Vänta på att data hämtas
4. Under Client → **Bank Reconciliation** → Vänta på AI-analys
5. **Coordinator Inbox** → Se task → **APPROVE**
6. **Specialist Board** → Se rapport → Redigera → Publicera

---

## 🔍 VAR ÄR ALLT?

- **API-nycklar**: Railway Variables ELLER DataFeed.configJson
- **Data**: `BankTransaction`, `LedgerEntry` tabeller i PostgreSQL
- **Tasks**: `Task` tabell med status och flags
- **AI-analys**: `/api/ai/process` med system prompts
- **Workers**: Körs på Railway (separat service)

---

**Nu kan du använda systemet på riktigt!** 🚀

För mer detaljer, se `HOW_TO_USE_FOR_REAL.md`

