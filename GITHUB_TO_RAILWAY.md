# 🔗 GitHub → Railway Deployment (Snabbversion)

**Din repo:** `git@github.com:chgenberg/AIFM.git`  
**Tid:** ~15 minuter från start till production

---

## 🚀 Snabbstart

### 1. Commit & Push till GitHub
```bash
cd ~/Desktop/FINANS

git status
git add .
git commit -m "feat: OpenAI + Railway ready"
git push origin main
```

### 2. Gå till Railway.app
```
https://railway.app → Sign in with GitHub
```

### 3. Skapa Projekt från GitHub
```
Railway Dashboard → New Project → Deploy from GitHub
Välj: chgenberg/AIFM → Deploy Now
```

Railway gör nu automatiskt:
- Detekterar monorepo
- Installerar dependencies
- Bygger Next.js + Node.js
- Startar services

### 4. Lägg Till PostgreSQL
```
Railway Dashboard → New → Database → PostgreSQL
Databasen länkas automatiskt!
```

### 5. Sätt Environment-Variabler

**Hämta först:**
1. OpenAI API-nyckel: https://platform.openai.com/api/keys
2. OpenAI Org ID: https://platform.openai.com/account/org-settings

**Lägg in i Railway:**
```
Railway → Variables → Add New Variable
```

| Namn | Värde |
|------|-------|
| `OPENAI_API_KEY` | `sk-proj-xxx...` |
| `OPENAI_ORG_ID` | `org-xxx...` |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` |
| `NODE_ENV` | `production` |

### 6. Initiera Databas
```bash
# I Railway Terminal (eller lokalt):
npx prisma migrate deploy
npx prisma db seed
```

### 7. Testa!
```
https://xxx.railway.app
```

✅ Du är live med AI!

---

## 📋 Vad Händer Nu?

| Steg | Tid | Status |
|------|-----|--------|
| Commit & push | 1 min | ✅ Du gör detta |
| Railway setup | 3 min | ✅ Railway gör detta |
| PostgreSQL | 2 min | ✅ Railway skapar |
| Variabler | 2 min | ✅ Du konfigurerar |
| Database setup | 2 min | ✅ Du kör migrations |
| **Total** | **~15 min** | **🎉 LIVE** |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Build failed" | Kolla logs, commit fix, push igen |
| "DATABASE_URL not found" | Lägg till i Variables |
| "OpenAI key invalid" | Skapa ny nyckel på platform.openai.com |
| "Slow responses" | Upgrade OpenAI plan eller batch requests |

---

## 📊 Din Portal

- **Frontend:** `https://xxx.railway.app`
- **API:** `https://xxx.railway.app/api`
- **Admin:** Se logs i Railway dashboard

---

## ✨ Nästa Steg

1. Testa inloggning
2. Skapa test-task (BANK_RECON)
3. Verifiera AI processar det
4. Invite team members
5. Monitor kostnader

**🚀 Klart! Du har nu en production AI-portal!**
