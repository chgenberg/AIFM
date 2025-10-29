# 🚀 Railway Deployment Guide - AIFM Portal
## Komplett steg-för-steg guide för att deploya till Railway

**GitHub Repo:** `git@github.com:chgenberg/AIFM.git`  
**Deploy Target:** Railway.app  
**Database:** PostgreSQL (managed by Railway)  
**API Provider:** OpenAI (GPT-4 Turbo)

---

## 📋 Checklist Innan Vi Börjar

- [ ] GitHub-konto (du har redan AIFM-repo)
- [ ] Railway.app-konto (gratis sign-up)
- [ ] OpenAI API-nyckel (från platform.openai.com)
- [ ] PostgreSQL-databas (Railway skapar denna)
- [ ] Env-variabler (jag visar exakt vilka)

---

## ✅ STEG 1: Forbered GitHub-Repo (2 min)

### 1.1 Se till att allt är committad

```bash
cd /Users/christophergenberg/Desktop/FINANS

# Kontrollera status
git status

# Om du har ändringar
git add .
git commit -m "feat: OpenAI integration + Railway deployment"
git push origin main
```

### 1.2 Kontrollera repo-struktur

Din repo bör ha denna struktur:

```
AIFM/
├── apps/
│   ├── web/          ← Next.js frontend
│   ├── api/          ← Next.js API routes
│   └── workers/      ← Node.js workers + Python AI
├── packages/
│   ├── shared/       ← Zod schemas
│   └── ai/           ← Python reconciliation
├── prisma/           ← Database schema
├── package.json      ← Monorepo root
├── .env.example      ← Environment template
└── docker-compose.yml
```

✅ **Du har redan detta!**

---

## ✅ STEG 2: Skapa Railway-Projekt (3 min)

### 2.1 Gå till Railway

1. Öppna https://railway.app
2. Klicka **"Login"** → Sign in med GitHub
3. Godkänn Railway-åtkomst till dina repos

### 2.2 Skapa nytt projekt

1. Klicka **"New Project"** (knapp i övre högra hörnet)
2. Välj **"Deploy from GitHub repo"**
3. Välj **chgenberg/AIFM** från listan
4. Klicka **"Deploy now"**

Railway kommer att:
- ✅ Detektera package.json
- ✅ Installera dependencies
- ✅ Bygga projektet
- ✅ Starta tjänsterna

**Första deployn tar ~2-3 min.**

---

## ✅ STEG 3: Lägg Till PostgreSQL-Databas (2 min)

### 3.1 Lägg till databas i Railway

I Railway dashboard:

1. Klicka **"New"** (knapp mittenst längs toppen)
2. Välj **"Database"** → **"PostgreSQL"**
3. Railway skapar databasen automatiskt
4. Du ser en **DATABASE_URL** automatiskt

**Exempel på DATABASE_URL:**
```
postgresql://postgres:password@railway.app:1234/finans
```

Railway länkar denna automatiskt! ✨

---

## ✅ STEG 4: Skapa OpenAI API-Nyckel (3 min)

### 4.1 Gå till OpenAI

1. Öppna https://platform.openai.com/api/keys
2. Klicka **"Create new secret key"**
3. Ge det ett namn (t.ex. "AIFM Production")
4. **KOPIERA NYCKELN** (du ser den bara en gång!)
5. Spara den någonstans säker

**Nyckel ser ut så här:**
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.2 Hämta Organization ID

1. Gå till https://platform.openai.com/account/org-settings
2. Kolla **"Organization ID"**
3. Kopiera det

**Org ID ser ut så här:**
```
org-xxxxxxxxxxxxx
```

---

## ✅ STEG 5: Ställ In Environment-Variabler (3 min)

### 5.1 I Railway Dashboard

I din Railway-projekt:

1. Klicka på **"Variables"** (vänster meny)
2. Klicka **"New Variable"** för var och en:

```env
# OpenAI Integration
OPENAI_API_KEY=sk-proj-din-nyckel-här
OPENAI_ORG_ID=org-din-org-id-här
OPENAI_MODEL=gpt-4-turbo-preview

# Node Environment
NODE_ENV=production
PORT=3000

# Database (Railway sätter detta automatiskt, 
# men du kan verifiera här)
DATABASE_URL=postgresql://...

# Optional: Logging
LOG_LEVEL=info
```

**Varje variabel:**
1. Klicka **"Add"**
2. Namn: `OPENAI_API_KEY`
3. Värde: `sk-proj-...`
4. Klicka **"Add Variable"**

### 5.2 Verifiera Database URL

Railway sätter DATABASE_URL automatiskt när du länkade PostgreSQL. Verifiera:

1. Gå till **"Variables"**
2. Sök efter `DATABASE_URL`
3. Den bör se ut så här: `postgresql://postgres:...`

Om den saknas:
1. Gå till **"PostgreSQL"** (i vänster meny)
2. Klicka på databasen
3. Kopiera **"DATABASE_URL"**
4. Lägg till i Variables

---

## ✅ STEG 6: Bygg & Deploy (5 min)

### 6.1 Railway bygger automatiskt

Railway detecterar automatiskt:
- ✅ Next.js app (frontend + API)
- ✅ Node.js workers (BullMQ jobs)
- ✅ Python-skript (AI reconciliation)

Processen:
```
1. npm install              (installera alla packages)
2. npm run build            (bygga Next.js)
3. npm run db:push          (Prisma migrations)
4. npm start                (starta serverna)
```

### 6.2 Övervaka Deploy

I Railway dashboard:
1. Klicka på **"Deployments"** (vänster meny)
2. Se den senaste deployn
3. Grön status = ✅ Framgång

**Du kan se loggar:**
- Klicka på deployment
- Scrolla ner för att se logs
- Sök efter `"Server running"` eller `"AI Orchestrator started"`

---

## ✅ STEG 7: Initiera Databas (3 min)

### 7.1 Kör Prisma-migrering

I Railway terminal (eller lokalt):

```bash
# Option A: I Railway terminal (rekommenderas)
# 1. Gå till din Railway-projekt
# 2. Klicka på "CLI" eller "Terminal"
# 3. Kör:

npx prisma migrate deploy

# Option B: Lokalt (om du är connected till Railway DB)
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 7.2 Seed Data (Test-data)

```bash
npx prisma db seed
```

**Detta skapar test-data:**
- 1 testclient (ABC Fund)
- 5 test-tasks
- 10 test-transaktioner
- Exempel-rapporter

---

## ✅ STEG 8: Testa Deployment (3 min)

### 8.1 Hämta din Portal URL

I Railway dashboard:
1. Klicka på **"Web"** (eller main app)
2. Kopiera **"Public URL"** (något som `xxx.railway.app`)

### 8.2 Öppna i webbläsare

```
https://xxx.railway.app
```

Du bör se:
- ✅ FINANS logo (dvarg)
- ✅ "AIFM Agent Portal" rubrik
- ✅ "Sign In" knapp
- ✅ "See How It Works" knapp

### 8.3 Testa Inloggning

1. Klicka **"Sign In"**
2. Logga in med Gmail/GitHub
3. Du omdirigeras till din rol-dashboard
4. Som Admin: Du ser **"Admin Dashboard"**
5. Prova att skapa en test-task

---

## ✅ STEG 9: Kontrollera AI-Integration (2 min)

### 9.1 Kontrollera AI Orchestrator är Aktiv

I Railway logs:
```bash
# Sök efter en av dessa meldinger:
"AI Orchestrator initialized"
"OpenAI client connected"
"Function definitions loaded"
```

### 9.2 Testa en Reconciliation-Task

1. Logga in som Admin
2. Gå till **Admin Dashboard**
3. Skapa ny task:
   - Type: `BANK_RECON`
   - Client: välj någon
   - Klicka **"Create Task"**
4. AI bör bearbeta den inom ~5 sekunder
5. Status ändras till `NEEDS_REVIEW`

**Se logg för detaljer:**
```
Railway Logs → Sök "BANK_RECON"
```

---

## ✅ STEG 10: Säkerhetskontroll (2 min)

### 10.1 Slå på Railway Secret-skydd

I Railway dashboard:
1. Gå till **"Settings"** → **"Environment"**
2. Se till att dessa är **"Secret":**
   - [ ] `OPENAI_API_KEY` ← **MÅSTE vara Secret!**
   - [ ] `DATABASE_URL` ← **MÅSTE vara Secret!**

**Hur man gör det:**
1. Klicka på en variabel
2. Klicka på **"eye"**-ikonen för att göra den hemlig
3. Den blir nu maskerad i logs och UI

### 10.2 Aktivera HTTPS

Railway gör detta automatiskt! 
- Din URL: `https://xxx.railway.app` (notera **https**)

---

## 📊 Din Deployment-URL

**Frontend:** `https://xxx.railway.app`  
**API:** `https://xxx.railway.app/api/...`  
**Workers:** Körs internt (inte exponerad)

---

## 🔍 Monitoring Efter Deploy

### Daglig Check

```bash
# Logga in på Railway dashboard
1. Se till alla tjänster är "Running" (grön)
2. Kolla senaste logg-linjerna för errors
3. Verifiera OpenAI API-svar är snabb

# En gång i veckan
1. Kontrollera OpenAI-kostnader (platform.openai.com)
2. Se loggarna för varningar
3. Verifiera databas-storlek växer normalt
```

### Vanliga Loggar Du Kommer Att Se

```
✅ "[INFO] Server running on port 3000"
✅ "[INFO] Database connected"
✅ "[INFO] AI Orchestrator ready"
✅ "[INFO] Task processed: BANK_RECON"

❌ "[ERROR] OpenAI API rate limit exceeded"
   → Vänta 60 sekunder, prova igen

❌ "[ERROR] DATABASE_URL not found"
   → Lägg till i Variables
```

---

## 🆘 Troubleshooting

### Problem: "Build failed"

**Lösning:**
```bash
# Lokalt: Verifiera build fungerar
npm run build

# Checka för TypeScript-fel
npm run type-check

# Commit fix
git add . && git commit -m "fix: build error"
git push origin main
```

### Problem: "DATABASE_URL not found"

**Lösning:**
1. Railway → Variables → Lägg till `DATABASE_URL`
2. Hämta från PostgreSQL-instansen
3. Deploy igen

### Problem: "OpenAI API key invalid"

**Lösning:**
1. Gå till https://platform.openai.com/api/keys
2. Skapa ny nyckel
3. Railway → Variables → Uppdatera `OPENAI_API_KEY`
4. Deploy igen

### Problem: "Slow responses"

**Lösning:**
1. Kolla OpenAI dashboard för rate limits
2. Upgrade till betald OpenAI-plan om nödvändigt
3. Lägg till caching i API-endpoints

---

## 💰 Kostnader

| Service | Kostnad | Notes |
|---------|---------|-------|
| Railway Compute | ~$5/mth | Sedan gratis, pay-as-you-go |
| Railway PostgreSQL | Gratis | 5GB gratis tier |
| OpenAI API | ~$70/mth | För 10+ reconciliations/dag |
| **Total** | **~$75/mth** | Small-medium production |

**Cost-sparande tips:**
- Använd `gpt-3.5-turbo` för enkla tasks
- Batch-kör tasks istället för individuell
- Monitora token-användning

---

## 🎉 Det Du Nu Har

```
✅ Frontend Portal              (Next.js 15)
✅ API Backend                  (Next.js API)
✅ ETL Workers                  (BullMQ + Redis)
✅ AI Processing                (OpenAI GPT-4)
✅ Database                     (PostgreSQL)
✅ Automatic Deployment         (GitHub → Railway)
✅ SSL/HTTPS                    (Automatisk)
✅ Monitoring                   (Railway Dashboard)
✅ Scaling                      (På demand)
```

---

## 📞 Support

| Problem | Lösning |
|---------|---------|
| Railway-specifikt | Besök https://docs.railway.app |
| OpenAI-specifikt | https://platform.openai.com/docs |
| Prisma-specifikt | https://www.prisma.io/docs |
| Din kod | Se logs i Railway dashboard |

---

## ✨ Nästa Steg

1. **Verifiera deployment funkar:** Öppna `https://xxx.railway.app`
2. **Testa AI-funktioner:** Skapa test-task
3. **Monitorera kostnader:** OpenAI dashboard
4. **Invite team:** Railway → Settings → Members
5. **Säkerhetskopia:** Railway → Backups

---

**🚀 Lycka till med deployn! Du har nu en production-ready AI-portal!**

**Frågor?** Kolla Railway logs först - ofta finns svaret där!
