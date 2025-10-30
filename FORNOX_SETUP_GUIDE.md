# 🔌 Fortnox-koppling: Setup Guide för Redovisningskonsulter

## Översikt

Detta dokument beskriver hur enkelt det är att sätta upp en Fortnox-koppling för en kund när en redovisningskonsult har tillgång till företagets Fortnox-konto.

## ✅ Vad som redan finns i systemet

### 1. Fortnox ETL Worker ✅
- **Implementerad:** `apps/workers/src/workers/etl.fortnox.ts`
- **Status:** PRODUCTION READY
- **Funktionalitet:**
  - Hämtar vouchers (verifikationer) från Fortnox API
  - Normaliserar till `LedgerEntry` i databasen
  - Körs automatiskt dagligen kl 02:00

### 2. Admin UI för DataFeed-konfiguration ✅
- **Sida:** `/admin/datafeeds`
- **Funktionalitet:**
  - Skapa/uppdatera Fortnox-koppling per kund
  - Ange API-nyckel
  - Testa synkronisering manuellt
  - Se status och senaste synkronisering

### 3. API Endpoints ✅
- `POST /api/datafeeds` - Skapa/uppdatera DataFeed
- `POST /api/datafeeds/sync` - Trigger manuell synkronisering

---

## 🎯 Setup-process (5 minuter)

### Steg 1: Hämta API-nyckel från Fortnox (2 min)

**För redovisningskonsulten:**
1. Logga in i Fortnox för kundens företag
2. Gå till **Inställningar** → **API**
3. Skapa en ny API-nyckel:
   - Klicka på "Skapa ny API-nyckel"
   - Kopiera API-nyckeln (ser ut som: `xxx-yyy-zzz-aaa-bbb`)
   - **Viktigt:** API-nyckeln är kopplad till specifikt företag i Fortnox

**Alternativt:** Om kunden redan har en API-nyckel
- Be kunden logga in och hämta API-nyckeln
- Eller använd befintlig API-nyckel om den redan finns

### Steg 2: Konfigurera i AIFM Portal (1 min)

**I Admin Dashboard:**
1. Gå till `/admin/datafeeds`
2. Klicka på "Add DataFeed"
3. Fyll i formuläret:
   - **Client:** Välj kund från listan
   - **Source:** Fortnox
   - **API Key:** Klistra in API-nyckeln från Fortnox
4. Klicka på "Create DataFeed"

### Steg 3: Testa kopplingen (1 min)

1. Klicka på "Sync Now" för den nya DataFeeden
2. Vänta några sekunder
3. Kontrollera att synkroniseringen lyckades:
   - Status ska vara "ACTIVE"
   - "Last sync" ska visa aktuell tid
   - Kontrollera att data finns i databasen

### Steg 4: Verifiera att data synkas (1 min)

**I Admin Dashboard:**
1. Gå till `/admin/dashboard` eller `/coordinator/inbox`
2. Skapa en "Bank Reconciliation"-task för kunden
3. AI:n kommer automatiskt att:
   - Hämta data från Fortnox
   - Jämföra med bankdata
   - Identifiera avvikelser

---

## 🔐 Säkerhet & Autentisering

### Hur Fortnox-autentisering fungerar:

```typescript
// Systemet använder API-nyckel i HTTP-header
headers: {
  'X-API-Access-Token': apiKey,  // Från kundens Fortnox-konto
  'Content-Type': 'application/json'
}
```

### Datasäkerhet:

1. **API-nyckeln lagras säkert:**
   - Krypterad i `DataFeed.configJson`
   - Sänds aldrig till frontend
   - Används endast av backend ETL workers

2. **Per-kund isolation:**
   - Varje kund har sin egen `DataFeed`-instans
   - API-nyckeln är kopplad till specifik `clientId`
   - Data är helt isolerad per kund

3. **Rollbaserad åtkomst:**
   - Endast ADMIN och COORDINATOR kan se/konfigurera DataFeeds
   - CLIENT-roll kan inte se API-nycklar

---

## 📋 Krav för att sätta upp Fortnox-koppling

### För redovisningskonsulten:
✅ **Tillgång till kundens Fortnox-konto**
   - Antingen via egen inloggning
   - Eller be kunden skapa API-nyckel

✅ **API-nyckel från Fortnox**
   - Skapas i Fortnox → Inställningar → API
   - En API-nyckel per företag

✅ **Admin-åtkomst i AIFM Portal**
   - Roll: ADMIN eller COORDINATOR

### För kunden:
✅ **Fortnox-konto**
   - Aktiverat för företaget
   - API-funktionalitet aktiverad (vanligtvis standard)

---

## 🚀 Automatisk synkronisering

Efter setup kommer systemet automatiskt att:

1. **Daglig synkronisering:** Kl 02:00 varje natt
2. **Hämta vouchers:** Från Fortnox för aktuell period
3. **Normalisera data:** Konvertera till `LedgerEntry`-format
4. **Lagras i databas:** Isolerad per kund (`clientId`)

### Manuell synkronisering:

Redovisningskonsulten kan när som helst:
- Klicka på "Sync Now" i `/admin/datafeeds`
- Välja period att synka
- Se status i realtid

---

## 💡 Exempel: Setup för ny kund

```typescript
// 1. Redovisningskonsulten loggar in i Fortnox för kundens företag
// 2. Hämtar API-nyckel: "abc123-def456-ghi789"

// 3. I AIFM Portal:
POST /api/datafeeds
{
  "clientId": "clx1234567890",
  "source": "FORTNOX",
  "configJson": {
    "apiKey": "abc123-def456-ghi789"
  }
}

// 4. Systemet skapar DataFeed och börjar synka automatiskt
// 5. Data synkas dagligen kl 02:00
```

---

## ⚠️ Vanliga problem & lösningar

### Problem 1: "API key not configured"
**Lösning:** Se till att API-nyckeln är korrekt klistrad in i formuläret

### Problem 2: "Fortnox API error: 401 Unauthorized"
**Lösning:** 
- API-nyckeln är felaktig eller utgången
- Skapa en ny API-nyckel i Fortnox
- Uppdatera DataFeed med ny nyckel

### Problem 3: "Rate limit exceeded"
**Lösning:**
- Fortnox har rate limit: 200 requests/minute
- Systemet använder exponential backoff
- Vänta några minuter och försök igen

### Problem 4: "No data synced"
**Lösning:**
- Kontrollera att kundens Fortnox-konto har data
- Verifiera att API-nyckeln har rätt behörigheter
- Testa manuell synkronisering

---

## 📊 Data som synkas från Fortnox

### Vouchers (Verifikationer):
- Bokföringsdatum
- Kontonummer
- Belopp
- Valuta
- Beskrivning
- Metadata (fakturanummer, etc.)

### Normaliseras till:
```typescript
LedgerEntry {
  clientId: string
  source: "FORTNOX"
  bookingDate: Date
  account: string
  amount: Decimal
  currency: string
  description: string
  meta: JSON
}
```

---

## 🎯 Sammanfattning: Är det enkelt?

### ✅ JA - Det är mycket enkelt!

**Tid:** ~5 minuter totalt
1. Hämta API-nyckel från Fortnox (2 min)
2. Konfigurera i AIFM Portal (1 min)
3. Testa synkronisering (1 min)
4. Verifiera data (1 min)

**Tekniska kunskaper krävs:**
- ❌ Ingen kodning
- ❌ Ingen server-konfiguration
- ✅ Bara kopiera/klistra API-nyckel
- ✅ Klicka på knappar i UI

**För redovisningskonsulten:**
- Om de redan har tillgång till kundens Fortnox → **Super enkelt!**
- Om de behöver be kunden om API-nyckel → **Fortfarande enkelt!**

---

## 🔄 Nästa steg efter setup

1. **Vänta på första synkronisering** (daglig kl 02:00)
2. **Skapa Bank Reconciliation-task** för att testa AI-funktionalitet
3. **Konfigurera andra data sources** (Bank via Nordigen, etc.)
4. **Träna AI:n** på specifika redovisningsuppgifter

---

## 📞 Support

Om det uppstår problem:
1. Kontrollera API-nyckeln i Fortnox
2. Verifiera att DataFeed-status är "ACTIVE"
3. Kontrollera senaste synkronisering
4. Kolla felmeddelanden i `/admin/datafeeds`

---

## 💰 Kostnad

### Fortnox API:
- **Kostnad:** Ingår i Fortnox-prenumeration
- **Vanligtvis:** 0 kr extra (ingår i standard-paket)

### AIFM Portal:
- **Kostnad:** Enligt prenumeration
- **Ingår:** Fortnox-integration ingår standard

---

## ✅ Checklista för setup

- [ ] Redovisningskonsult har tillgång till Fortnox-konto
- [ ] API-nyckel skapad i Fortnox
- [ ] Kund skapad i AIFM Portal
- [ ] DataFeed konfigurerad med API-nyckel
- [ ] Test-synkronisering lyckades
- [ ] Automatisk synkronisering aktiverad (standard)

**Total tid:** ~5 minuter ⏱️

