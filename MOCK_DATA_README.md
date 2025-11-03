# Mock Data System

## Översikt

Systemet har nu stöd för mock data som fallback när riktiga API-kopplingar inte är tillgängliga eller när man vill demonstrera funktionaliteten utan externa tjänster.

## Aktivering

Mock data aktiveras automatiskt när:
- `USE_MOCK_DATA=true` i environment variabler
- `NODE_ENV=development` (automatiskt i development)

## Funktioner

### 1. Automatisk Fallback
- Systemet försöker först hämta riktig data från databasen
- Om databasen är tom eller query misslyckas → fallback till mock data
- Om external API:er (Fortnox, Nordigen) inte är tillgängliga → fallback till mock data

### 2. Realistisk Mock Data
Mock data innehåller:
- **3 klienter** (Nordic Tech Fund, Scandinavia Investment Partners, Baltic Capital Management)
- **5 uppgifter** (Tasks) med olika statusar och typer
- **4 dokument** med olika kategorier och statusar
- **3 compliance checks** med olika statusar
- **2 rapporter** i olika faser
- **Admin stats** med realistiska siffror

### 3. API Routes med Mock Support

Följande routes har stöd för mock data:
- `/api/admin/stats` - Admin dashboard statistik
- `/api/tasks` - Lista uppgifter
- `/api/documents` - Lista dokument
- `/api/compliance/checks` - Compliance checks
- `/api/compliance/summary` - Compliance sammanfattning

## Användning

### Aktivera Mock Data
```bash
# I .env.local eller production environment
USE_MOCK_DATA=true
```

### Testa med Mock Data
1. Starta applikationen
2. Mock data kommer automatiskt användas om:
   - Databasen är tom
   - External API:er saknas
   - `USE_MOCK_DATA=true` är satt

## Fördelar

✅ **Demo-ready**: Visar verkliga exempel på hur tjänsten fungerar  
✅ **Utveckling**: Funktioner testbara utan externa tjänster  
✅ **Fallback**: Systemet fungerar även när API:er är nere  
✅ **Smidig övergång**: Samma kod fungerar med både mock och riktig data  

## Mock Data Struktur

All mock data finns i `/apps/web/src/lib/mockData.ts` och kan enkelt utökas med fler exempel.

## Produktion

I produktion:
- Mock data används ENDAST om riktiga API:er misslyckas
- Systemet loggar när mock data används
- Användare ser fortfarande fungerande data även vid API-problem

