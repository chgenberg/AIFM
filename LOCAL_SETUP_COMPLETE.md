# 🚀 COMPLETE LOCAL SETUP GUIDE

**Status:** Ready for full local development  
**Last Updated:** October 28, 2025

---

## 📋 Pre-requisites

You need:
- Node.js 18+ 
- npm or yarn
- Docker + Docker Compose
- Git

Check versions:
```bash
node --version   # Should be 18+
npm --version    # Should be 8+
docker --version
```

---

## 🎯 STEP-BY-STEP SETUP

### 1️⃣ Clone & Install (5 min)

```bash
# Navigate to project
cd /Users/christophergenberg/Desktop/FINANS

# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### 2️⃣ Environment Setup (5 min)

```bash
# Copy env template
cp .env.example .env.local

# Edit .env.local and fill in:
# DATABASE_URL=postgresql://user:password@localhost:5432/aifm
# REDIS_URL=redis://localhost:6379
# CLERK_SECRET_KEY=sk_test_xxx (from Clerk dashboard)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

**Get Clerk Keys (Free):**
1. Go to https://dashboard.clerk.com
2. Create new app
3. Copy keys to .env.local

### 3️⃣ Start Services (10 min)

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Verify services started
docker-compose ps
# Should show: postgres (Up), redis (Up)

# Check they're ready
docker-compose logs postgres  # Wait for "database system is ready"
docker-compose logs redis     # Wait for "Ready to accept connections"
```

### 4️⃣ Database Setup (5 min)

```bash
# Terminal 2: Run migrations
npm run db:push

# Expected output:
# ✓ Create `Client` table
# ✓ Create `Subscription` table
# ... (all 15+ tables)
# ✅ Database synchronized
```

### 5️⃣ Seed Test Data (2 min)

```bash
# Add test data for development
npm run db:seed

# Expected output:
# 🌱 Starting database seed...
# ✅ Created client: Test Fund AB
# ✅ Created users: Coordinator, Specialist, Client
# ✅ Created data feeds
# ✅ Created test task
# ✅ Created test report
# ✨ Database seed completed!
```

### 6️⃣ Start Portal (in new terminal)

```bash
# Terminal 3: Start Portal
npm run dev -w apps/web

# Expected output:
# ▲ Next.js 15.0.0
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 7️⃣ Start Workers (optional, in new terminal)

```bash
# Terminal 4: Start Workers (for ETL/AI)
npm run dev -w apps/workers

# Expected output:
# Starting ETL workers...
# ✅ Fortnox worker ready
# ✅ Bank worker ready
# ✅ Data Quality worker ready
```

### 8️⃣ Open Portal

```bash
# Open in browser
http://localhost:3000

# You should see:
# AIFM Agent Portal home page
# Clerk sign-in button (Sign in / Sign up)
```

---

## 🔐 LOGIN & TEST

### Sign Up as Test User

1. Click "Sign up"
2. Enter:
   - Email: `coordinator@test.com`
   - Password: anything (Clerk handles)
   - Name: Test Coordinator

3. You'll be redirected to `/` (home page)
4. Should auto-redirect to `/coordinator/inbox`

### Navigate Portal

**Coordinator:**
- Login → See QC Inbox
- View test QC_CHECK task
- Try "Approve" button
- See modal confirmation
- Approve → See toast "Task approved"
- Export to CSV

**Specialist:**
- Logout → Login as different user
- Can access `/specialist/board`
- See test INVESTOR_LETTER report
- Click to edit
- Save draft

**Admin:**
- Can access `/admin/dashboard`
- See health check status
- See queue statistics

---

## ✅ VERIFICATION CHECKLIST

- [ ] Docker services running (`docker-compose ps`)
- [ ] Database migrated (`npm run db:status`)
- [ ] Seed data created (`SELECT COUNT(*) FROM "Client"` shows 1)
- [ ] Portal loads (`http://localhost:3000`)
- [ ] Can login with Clerk
- [ ] See navigation sidebar
- [ ] Can navigate between pages
- [ ] Toast notifications work
- [ ] Modal dialogs work
- [ ] Search/Filter works
- [ ] CSV export works

---

## 🧪 TEST WORKFLOWS

### Workflow 1: Coordinator QC

```
1. Login as coordinator
2. Go to /coordinator/inbox
3. See QC task with flags
4. Click "Approve" button
5. Modal appears
6. Confirm approval
7. See toast: "Task approved"
8. Task disappears from list
9. Click "Export CSV"
10. tasks.csv downloads
```

### Workflow 2: Specialist Report

```
1. Login as specialist
2. Go to /specialist/board
3. See report in DRAFT column
4. Click report card
5. Edit text
6. Click "Save Draft"
7. See toast: "Draft saved"
8. Move card to next column (QC)
9. Navigate to report
10. Sign & Publish
```

### Workflow 3: Admin Monitoring

```
1. Login as admin
2. Go to /admin/dashboard
3. See health check (✅ Database healthy)
4. See queue status
5. Click "Refresh"
6. Updated timestamps
```

---

## 🛠️ USEFUL COMMANDS

### Database
```bash
npm run db:status           # Check migration status
npm run db:push             # Apply migrations
npm run db:seed             # Add test data
npm run db:reset            # Reset DB (⚠️ deletes data)
npx prisma studio          # Visual database explorer
```

### Development
```bash
npm run dev                 # Start all services
npm run dev -w apps/web    # Portal only
npm run dev -w apps/workers # Workers only
npm run type-check          # Check TypeScript
npm run lint               # Run linter
```

### Testing
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:headed    # See browser
npm run test:e2e:report    # View report
```

### Docker
```bash
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose ps          # Check status
docker-compose logs -f     # View logs
```

---

## 🐛 TROUBLESHOOTING

### Portal won't load

**Problem:** `http://localhost:3000` times out

**Solution:**
```bash
# Check if Next.js started
lsof -i :3000
# If empty, restart:
npm run dev -w apps/web

# Check for errors
# Look for TypeScript errors in terminal
npm run type-check
```

### Can't login with Clerk

**Problem:** "Invalid API key" or sign-in doesn't work

**Solution:**
```bash
# Verify Clerk keys in .env.local
cat apps/web/.env.local | grep CLERK

# Make sure keys are from your Clerk app (not another app)
# Test endpoint: curl http://localhost:3000/api/auth/hello
```

### Database won't migrate

**Problem:** `npm run db:push` fails

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# Should show: UP

# Check logs
docker-compose logs postgres

# If not running:
docker-compose down
docker-compose up -d postgres
docker-compose up -d redis

# Try again
npm run db:push

# If still fails:
npm run db:reset  # ⚠️ Deletes data, recreates
```

### Redis not connecting

**Problem:** Workers fail to start

**Solution:**
```bash
# Check Redis is running
docker-compose ps redis

# Check connection
redis-cli PING
# Should respond: PONG

# If not running:
docker-compose up -d redis
```

### Seed script fails

**Problem:** `npm run db:seed` returns error

**Solution:**
```bash
# Check database is migrated first
npm run db:push

# Make sure no TypeScript errors
npm run type-check

# Try seed again
npm run db:seed

# If still fails, check dependencies
npm install
npm run db:seed
```

---

## 🚀 READY FOR GITHUB?

Before you push to GitHub, verify:

✅ Local development works
✅ All tests pass (`npm run test:e2e`)
✅ No TypeScript errors (`npm run type-check`)
✅ Code formatted (`npm run format`)
✅ .env.local NOT committed
✅ .gitignore includes .env.local

Then:
```bash
git add .
git commit -m "feat: Complete local setup with all features"
git push origin main
```

Railway will auto-deploy! ✨

---

## 📞 IF SOMETHING GOES WRONG

**Check in this order:**
1. Read error message carefully
2. Check troubleshooting above
3. Check logs: `docker-compose logs`
4. Check `.env.local` has all required vars
5. Try `npm run db:reset` (nuclear option)
6. Delete `node_modules` + `npm install`

---

## ✨ YOU'RE READY!

```
✅ Portal runs locally
✅ Database populated with test data
✅ Can login and navigate
✅ Can test all workflows
✅ Can run E2E tests
✅ Can push to GitHub
✅ Ready for Railway deployment
```

**Next step:** 
```bash
git push origin main
# Watch Railway deploy in real-time
```

---

**Built with ❤️ for local development**

**Status: 🟢 READY FOR LOCAL TESTING**

