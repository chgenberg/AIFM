# 🔧 Analys: Vad kan byggas utan externa kopplingar?

## Översikt

Detta dokument analyserar vad som kan byggas lokalt/utan externa kopplingar vs vad som absolut kräver externa tjänster. Fokus på att förbereda strukturen och mocka integrationerna.

---

## ✅ Vad som kan byggas HELT lokalt (utan externa kopplingar)

### 1. INGEST-FLÖDE

#### ✅ Upload/API (Lokal filhantering)
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Upload API endpoint (`POST /api/documents/upload`)
- Filvalidering (typ, storlek)
- Lokal filhantering (tillfälligt i `/uploads` eller liknande)
- Metadata-extraktion från filer
- Databasstruktur för dokument

**Mock S3 med:**
```typescript
// Interface för storage (kan bytas till S3 senare)
interface StorageAdapter {
  upload(key: string, file: Buffer): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// Lokal implementation nu
class LocalStorageAdapter implements StorageAdapter {
  async upload(key: string, file: Buffer): Promise<string> {
    // Spara lokalt i /uploads
    const path = `/uploads/${key}`;
    await fs.writeFile(path, file);
    return `/api/files/${key}`; // Returnera lokal URL
  }
}

// Senare: AWS S3 adapter
class S3StorageAdapter implements StorageAdapter {
  // ... S3 implementation
}
```

**Arbetsmängd:** 8-12h (samma som med S3)
**Fördel:** Ingen extern koppling behövs, kan bytas till S3 senare enkelt

#### ✅ Klassificering + extraktion
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Filtyp-detektion (mime-type)
- Metadata-extraktion (datum, version från filnamn/metadata)
- AI-baserad klassificering (använd OpenAI embeddings, inte extern service)
- Versionshantering i databas

**Arbetsmängd:** 20-30h (samma som original)
**Fördel:** Allt kan göras lokalt eller med OpenAI API (som redan finns)

#### ✅ Vector indexering (PostgreSQL med pgvector)
**Status:** Kan byggas lokalt med PostgreSQL
**Vad behöver byggas:**
- Installera pgvector extension i PostgreSQL
- Skapa vector-kolumn i databas
- Embedding generation (OpenAI API - redan finns)
- Vector search i PostgreSQL

**Mock med:**
```typescript
// Använd PostgreSQL med pgvector istället för extern vector DB
// pgvector är en PostgreSQL extension - ingen extern tjänst!

// Prisma schema
model Document {
  id        String   @id @default(cuid())
  content   String
  embedding Unsupported("vector(1536)") // pgvector type
  // ...
}

// Vector search query
const results = await prisma.$queryRaw`
  SELECT id, content, 
    embedding <-> ${queryEmbedding}::vector AS distance
  FROM Document
  ORDER BY distance
  LIMIT 10
`;
```

**Arbetsmängd:** 16-20h (mindre än Pinecone/Weaviate eftersom samma databas)
**Fördel:** Ingen extern tjänst, använder samma PostgreSQL

#### ✅ Policykontroll
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Policy-definition i databas
- Regel-engine (pure TypeScript)
- Automatisk kontroll mot policyer
- Gap-analys logic

**Arbetsmängd:** 40-60h (samma som original)
**Fördel:** Allt är lokalt, inga externa beroenden

---

### 2. FRÅGOR & ORKESTRERING

#### ✅ Retrieval-lager (PostgreSQL med pgvector)
**Status:** Kan byggas lokalt med PostgreSQL
**Vad behöver byggas:**
- Vector search queries i PostgreSQL
- Semantic search med embeddings
- Hybrid search (text + vector)
- Relevans-ranking

**Arbetsmängd:** 12-16h (mindre än extern vector DB)
**Fördel:** Använder samma PostgreSQL, ingen extern tjänst

#### ✅ Dokumentlager (Lokal filhantering)
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Dokumenthantering UI
- Filhantering lokalt
- Dokumentpreview (PDF.js för PDF)
- Versionshantering i databas

**Storage abstraction:**
```typescript
// apps/web/src/lib/storage.ts
export interface StorageAdapter {
  upload(key: string, file: Buffer, metadata?: any): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Lokal implementation (nu)
export class LocalStorageAdapter implements StorageAdapter {
  private basePath = './uploads';
  
  async upload(key: string, file: Buffer): Promise<string> {
    const fullPath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file);
    return `/api/files/${key}`;
  }
  
  // ... andra metoder
}

// S3 adapter (senare)
export class S3StorageAdapter implements StorageAdapter {
  // ... S3 implementation
}

// Factory
export function getStorage(): StorageAdapter {
  if (process.env.STORAGE_TYPE === 's3') {
    return new S3StorageAdapter();
  }
  return new LocalStorageAdapter(); // Default: lokal
}
```

**Arbetsmängd:** 10-14h (lite mindre än med S3)
**Fördel:** Fungerar direkt, enkelt att byta till S3 senare

#### ✅ Parser/OCR (Lokal OCR)
**Status:** Kan byggas lokalt med Tesseract
**Vad behöver byggas:**
- PDF-parser (pdf-parse bibliotek)
- OCR med Tesseract.js (lokalt)
- Text-extraktion från olika format
- Bildhantering

**Alternativ:**
```typescript
// Lokal OCR med Tesseract.js (gratis, open source)
import Tesseract from 'tesseract.js';

async function extractText(imageBuffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'swe+eng');
  return text;
}

// PDF parser (lokalt bibliotek)
import pdfParse from 'pdf-parse';

async function extractFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await pdfParse(pdfBuffer);
  return data.text;
}
```

**Arbetsmängd:** 18-24h (lite mer än cloud OCR men ingen kostnad)
**Fördel:** Ingen extern tjänst, ingen kostnad, fungerar offline

#### ✅ Compliance Policy Engine
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Policy-definition i databas
- Regel-engine (pure TypeScript)
- Kravlista-hantering
- Compliance-status tracking

**Arbetsmängd:** 40-60h (samma som original)
**Fördel:** Allt är lokalt, inga externa beroenden

#### ✅ Master Lagar/Regler
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Datastruktur för lagar/regler
- Versionering
- Länk-hantering
- Manuell indexering (eller automatisk från PDF)

**Arbetsmängd:** 16-24h (samma som original)
**Fördel:** Allt är lokalt, inga externa beroenden

---

### 3. ANALYS & SVARSGENERERING

#### ✅ GAP-analys
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Gap-analys logic (pure TypeScript)
- Jämförelse mot policyer
- Task-generering
- Prioritering

**Arbetsmängd:** 24-32h (samma som original)
**Fördel:** Allt är lokalt, inga externa beroenden

#### ✅ Svarsgenerator (RAG)
**Status:** Kan byggas lokalt med OpenAI API (som redan finns)
**Vad behöver byggas:**
- RAG-implementation med OpenAI
- Vector retrieval från PostgreSQL
- Citat-hantering
- Source attribution

**Arbetsmängd:** 32-40h (samma som original)
**Fördel:** Använder OpenAI API som redan finns i systemet

#### ✅ PDF/Word-export
**Status:** Kan byggas lokalt med bibliotek
**Vad behöver byggas:**
- PDF-export (pdfkit eller puppeteer)
- Word-export (docx bibliotek)
- Formaterad leverans
- Citat-inkludering

**Bibliotek:**
```typescript
// PDF export (lokalt)
import PDFDocument from 'pdfkit';
import { Document } from 'docx';

// Word export (lokalt)
import { Document, Packer, Paragraph } from 'docx';
```

**Arbetsmängd:** 16-24h (samma som original)
**Fördel:** Alla bibliotek är lokala, inga externa tjänster

---

### 4. AUDIT & SPÅRBARHET

#### ✅ Förbättrad audit
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- AI-frågor/svar logging
- Dokument-access logging
- Policy-kontroll logging

**Arbetsmängd:** 8-12h (samma som original)
**Fördel:** Allt är lokalt, använder befintlig AuditLog

---

### 5. MYNDIGHET & HUMAN-IN-THE-LOOP

#### ✅ Myndighet-portal
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Myndighet-portal UI
- API för myndighetsfrågor
- Autentisering (använd NextAuth)
- Access control

**Arbetsmängd:** 24-32h (samma som original)
**Fördel:** Allt är lokalt, använder befintlig autentisering

#### ✅ Human-in-the-loop
**Status:** Kan byggas 100% lokalt
**Vad behöver byggas:**
- Eskalering-logic
- Human review-flöde
- Notifikationer (email kan mockas)
- Approval workflow

**Arbetsmängd:** 16-24h (samma som original)
**Fördel:** Allt är lokalt, email kan mockas eller använda lokalt SMTP

---

## ❌ Vad som ABSOLUT kräver externa kopplingar

### 1. Production S3-integration
**Varför:** När systemet går live behövs S3 för skalbarhet och säkerhet.
**Men:** Kan mockas lokalt för development
**När:** Efter Fas 1-2 när systemet är redo för production

### 2. Cloud OCR (valfritt)
**Varför:** Cloud OCR är mer exakt än Tesseract
**Alternativ:** Använd Tesseract.js lokalt (gratis men sämre kvalitet)
**När:** Om lokal OCR inte räcker

### 3. External Vector DB (valfritt)
**Varför:** Pinecone/Weaviate är snabbare för stora volymer
**Alternativ:** PostgreSQL med pgvector fungerar bra för mindre volymer
**När:** Om PostgreSQL blir för långsam (vid 100k+ dokument)

---

## 📊 REVISERAD ARBETSMÄNGD (utan externa kopplingar)

### Vad som kan byggas HELT lokalt:

| Komponent | Original | Lokalt | Skillnad |
|-----------|----------|--------|----------|
| **1. INGEST-FLÖDE** | | | |
| Upload/API | 8-12h | 8-12h | 0h (mock S3) |
| Klassificering | 20-30h | 20-30h | 0h |
| Vector indexering | 24-32h | 16-20h | -8h (pgvector enklare) |
| Policykontroll | 40-60h | 40-60h | 0h |
| **Subtotalt 1** | **92-134h** | **84-122h** | **-8h** |
| | | | |
| **2. FRÅGOR & ORKESTRERING** | | | |
| Retrieval-lager | 16-24h | 12-16h | -4h (pgvector) |
| Dokumentlager | 12-16h | 10-14h | -2h (lokal fil) |
| Parser/OCR | 20-30h | 18-24h | -2h (Tesseract) |
| Compliance Engine | 40-60h | 40-60h | 0h |
| Master Lagar/Regler | 16-24h | 16-24h | 0h |
| **Subtotalt 2** | **104-154h** | **96-134h** | **-8h** |
| | | | |
| **3. ANALYS & SVARSGENERERING** | | | |
| GAP-analys | 24-32h | 24-32h | 0h |
| RAG | 32-40h | 32-40h | 0h |
| PDF/Word-export | 16-24h | 16-24h | 0h |
| **Subtotalt 3** | **72-96h** | **72-96h** | **0h** |
| | | | |
| **4. AUDIT** | **8-12h** | **8-12h** | **0h** |
| | | | |
| **5. MYNDIGHET & HUMAN-IN-THE-LOOP** | **40-56h** | **40-56h** | **0h** |
| | | | |
| **TOTALT** | **316-452h** | **300-420h** | **-16h** |

---

## 🎯 Fördelar med lokal implementation

### 1. Snabbare utveckling
- ✅ Ingen setup av externa tjänster
- ✅ Fungerar direkt lokalt
- ✅ Enklare att testa

### 2. Lägre kostnad
- ✅ Ingen kostnad för S3/Pinecone under utveckling
- ✅ Ingen kostnad för OCR-tjänster
- ✅ Allt är gratis lokalt

### 3. Enklare att byta senare
- ✅ Storage abstraction layer gör det enkelt att byta till S3
- ✅ Vector search kan bytas till Pinecone senare
- ✅ OCR kan bytas till cloud OCR senare

### 4. Bättre för utveckling
- ✅ Fungerar offline
- ✅ Snabbare iterationer
- ✅ Enklare debugging

---

## 📋 Implementation Strategy

### Steg 1: Bygg abstraktionslager (4-6h)

**Storage abstraction:**
```typescript
// apps/web/src/lib/storage.ts
export interface StorageAdapter {
  upload(key: string, file: Buffer): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter { /* ... */ }
export class S3StorageAdapter implements StorageAdapter { /* ... */ }

export function getStorage(): StorageAdapter {
  return process.env.STORAGE_TYPE === 's3' 
    ? new S3StorageAdapter() 
    : new LocalStorageAdapter();
}
```

**Vector search abstraction:**
```typescript
// apps/web/src/lib/vector-search.ts
export interface VectorSearchAdapter {
  indexDocument(id: string, embedding: number[], metadata: any): Promise<void>;
  search(queryEmbedding: number[], limit: number): Promise<SearchResult[]>;
}

export class PgVectorAdapter implements VectorSearchAdapter { /* ... */ }
export class PineconeAdapter implements VectorSearchAdapter { /* ... */ }
```

### Steg 2: Implementera lokalt först (300-420h)

**Alla komponenter kan byggas lokalt:**
- ✅ Upload med lokal filhantering
- ✅ Vector search med pgvector
- ✅ OCR med Tesseract.js
- ✅ PDF/Word export med lokala bibliotek
- ✅ Allt annat är pure TypeScript

### Steg 3: Byt till externa tjänster senare (16-24h)

**När systemet är redo för production:**
- Byt LocalStorageAdapter → S3StorageAdapter (2-4h)
- Byt PgVectorAdapter → PineconeAdapter (valfritt, 8-12h)
- Byt Tesseract → Cloud OCR (valfritt, 4-8h)

**Total tid för att byta:** 14-24h (mycket mindre än att bygga från scratch)

---

## ✅ Slutsats

### Totalt arbete utan externa kopplingar: **300-420 timmar**

**Detta är:**
- **~16 timmar mindre** än med externa kopplingar från start
- **~7-10 veckor** för en utvecklare
- **~3-5 veckor** för två utvecklare

### Vad som kan byggas lokalt: **~95%**

**Enda skillnaden:**
- Lokal filhantering istället för S3 (kan bytas senare)
- pgvector istället för Pinecone (kan bytas senare)
- Tesseract istället för cloud OCR (kan bytas senare)

### Fördelar:
1. ✅ **Snabbare utveckling** - Ingen setup av externa tjänster
2. ✅ **Lägre kostnad** - Allt är gratis lokalt
3. ✅ **Enklare att testa** - Fungerar direkt
4. ✅ **Enkelt att byta senare** - Abstraction layers gör det enkelt

### Rekommendation:
**Bygg lokalt först** med abstraction layers, sedan byt till externa tjänster när systemet är redo för production. Detta ger:
- Snabbare utveckling
- Lägre kostnad under utveckling
- Flexibilitet att byta senare
- Samma funktionalitet

**Tid att byta till externa tjänster senare:** 14-24h (mycket mindre än att bygga från scratch)

