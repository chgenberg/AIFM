# AIFM Agent Portal - Setup Guide

Denna guide hjälper dig att komma igång med utveckling av AIFM Agent Portal lokalt.

## Prerequisites

- Node.js 18+ (https://nodejs.org/)
- npm eller yarn
- Docker & Docker Compose (https://www.docker.com/)
- Python 3.10+ (för framtida AI workers)

## Steg 1: Clone & Install

```bash
cd /Users/christophergenberg/Desktop/FINANS
npm install
```

## Steg 2: Starta Services (Docker)

```bash
docker-compose up -d
```

Verifiera att allt är uppe:
```bash
docker-compose ps
```

Du bör se `postgres` och `redis` kör.

## Steg 3: Konfigurera Environment

Kopiera `.env.example` till `.env.local`:

```bash
cp .env.example .env.local
```

Redigera `.env.local` med dina värden (för dev kan du lämna placeholders):

```
DATABASE_URL="postgresql://aifm:aifm_dev_pass@localhost:5432/aifm_dev"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

## Steg 4: Sätt upp Database

```bash
npm run db:push
# eller för migrations:
npm run db:setup
```

## Steg 5: Starta Development Servers

I en terminal:
```bash
npm run dev
```

Eller i separata terminals för fler detaljer:

Terminal 1 (Frontend):
```bash
npm run dev -w apps/web
```

Terminal 2 (API):
```bash
npm run dev -w apps/api
```

Terminal 3 (Workers):
```bash
npm run dev -w apps/workers
```

## Steg 6: Verifiera Setup

- Frontend: http://localhost:3000
- API: http://localhost:3000/api/health
- Redis CLI: `docker exec -it aifm-redis redis-cli`
- Postgres CLI: `docker exec -it aifm-postgres psql -U aifm -d aifm_dev`

## Troubleshooting

### Redis Connection Error
```bash
# Kontrollera om Redis kör
docker-compose logs redis

# Starta om Redis
docker-compose restart redis
```

### Database Connection Error
```bash
# Kontrollera Postgres
docker-compose logs postgres

# Se om migration krävs
npm run db:push

# Starta om Postgres
docker-compose restart postgres
```

### Workers Not Running
```bash
# Verifiera Redis är tillgänglig
npm run dev -w apps/workers

# Se logs
tail -f ./.logs/workers.log
```

## Nästa Steg

1. Implementera Portal UI (Clerk auth, client dashboard)
2. Lägg till API endpoints för CRUD operations
3. Konfigurera Fortnox/Bank API credentials
4. Starta en ETL sync för test-data
5. Bygga QC-inbox UI

Se README.md för arkitektur-överblick.
