# 🎯 Konkreta Exempel: Vad Systemet Kan Klara Av (När Fullt Utbildat)

## Översikt

Detta dokument visar konkreta, verkliga exempel på vad AIFM Portal kan hantera när AI:n är fullt utbildad. Varje exempel visar:
- **Input**: Vad systemet får
- **Process**: Vad AI:n gör
- **Output**: Vad systemet returnerar
- **Värde**: Varför det är användbart

---

## 📊 BANKAVSTÄMNING (BANK_RECON)

### Exempel 1: Timing Difference - Management Fee

**Scenario:** Fonden har debiterat management fee i banken men inte bokfört än i redovisningen.

**Input:**
```json
{
  "bankBalance": 125000000,
  "ledgerBalance": 124950000,
  "discrepancy": 50000,
  "recentTransactions": [
    {
      "date": "2024-01-15",
      "amount": 5000000,
      "type": "inflow",
      "description": "Capital call från Investor A"
    },
    {
      "date": "2024-01-16",
      "amount": -50000,
      "type": "fee",
      "description": "Management fee för januari"
    }
  ],
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

**AI Process:**
- GPT analyserar transaktioner
- Identifierar att management fee debiterats i banken 2024-01-16
- Kontrollerar om den finns i redovisningen (nej)
- Klassificerar som timing difference (vanligt, inte kritiskt)

**Output:**
```json
{
  "analysis": "Bank balance visar 125M SEK medan redovisning visar 124.95M SEK. Avvikelse på 50K SEK. Sannolik orsak: Management fee debiterades i banken 2024-01-16 men är inte bokförd i redovisningen än. Detta är en normal timing difference.",
  "discrepancies": [
    {
      "type": "TIMING_DIFFERENCE",
      "amount": 50000,
      "date": "2024-01-16",
      "explanation": "Management fee debiterades i banken men väntar på bokföring i redovisning"
    }
  ],
  "recommendations": [
    "Verifiera att management fee på 50K SEK är korrekt",
    "Bokför management fee i redovisningen",
    "Verifiera att datumet stämmer"
  ],
  "flags": [
    {
      "severity": "info",
      "message": "Timing difference detekterad - normal stämningspost",
      "code": "TIMING_DIFF"
    }
  ]
}
```

**Värde:** 
- ✅ Sparar 30 minuter manuell analys
- ✅ Identifierar problemet korrekt (timing difference, inte fel)
- ✅ Ge konkreta rekommendationer
- ✅ Ingen falsk alarm

---

### Exempel 2: Saknad Transaktion - Stor Belopp

**Scenario:** En stor insättning finns i banken men saknas i redovisningen.

**Input:**
```json
{
  "bankBalance": 150000000,
  "ledgerBalance": 148000000,
  "discrepancy": 2000000,
  "recentTransactions": [
    {
      "date": "2024-01-20",
      "amount": 2000000,
      "type": "inflow",
      "description": "Insättning från okänd källa"
    }
  ]
}
```

**AI Process:**
- GPT identifierar stor avvikelse (2M SEK)
- Kontrollerar transaktioner i banken
- Ser att 2M SEK-insättning saknas i redovisning
- Klassificerar som kritisk (stor belopp, saknad transaktion)

**Output:**
```json
{
  "analysis": "Bank balance visar 150M SEK medan redovisning visar 148M SEK. Stor avvikelse på 2M SEK. Banken visar en inkommande transaktion på 2M SEK 2024-01-20 som inte finns i redovisningen. Detta kräver omedelbar granskning.",
  "discrepancies": [
    {
      "type": "MISSING_TRANSACTION",
      "amount": 2000000,
      "date": "2024-01-20",
      "explanation": "Stor inkommande transaktion inte registrerad i redovisning"
    }
  ],
  "recommendations": [
    "Verifiera ursprung och syfte med transaktionen",
    "Kontrollera om detta är en kapitalinsättning eller annan förväntad transaktion",
    "Bokför transaktionen i redovisningen efter verifiering",
    "Kontrollera alla relaterade dokument"
  ],
  "flags": [
    {
      "severity": "error",
      "message": "Saknad transaktion på stor belopp detekterad - kräver omedelbar granskning",
      "code": "MISSING_LARGE_TXN"
    }
  ]
}
```

**Värde:**
- ✅ Fångar kritiska problem direkt
- ✅ Förhindrar compliance-problem
- ✅ Identifierar potentiella fel eller bedrägerier
- ✅ Förbättrar säkerhet

---

### Exempel 3: Flera Små Avvikelser

**Scenario:** Flera små avvikelser över en månad som behöver sammanställas.

**Input:**
```json
{
  "bankBalance": 100000000,
  "ledgerBalance": 99850000,
  "discrepancy": 150000,
  "recentTransactions": [
    { "date": "2024-01-05", "amount": -5000, "type": "fee", "description": "Bankavgift" },
    { "date": "2024-01-12", "amount": -10000, "type": "fee", "description": "Uppdragsförvaltning" },
    { "date": "2024-01-18", "amount": -25000, "type": "fee", "description": "Revideringsavgift" },
    { "date": "2024-01-22", "amount": -50000, "type": "fee", "description": "Juridisk konsultation" },
    { "date": "2024-01-25", "amount": -60000, "type": "fee", "description": "Marknadsföring" }
  ]
}
```

**AI Process:**
- GPT analyserar alla transaktioner
- Identifierar att flera avgifter saknas i redovisning
- Grupperar dem logiskt
- Prioriterar större belopp

**Output:**
```json
{
  "analysis": "Bank balance visar 100M SEK medan redovisning visar 99.85M SEK. Totalt avvikelse på 150K SEK. Flera avgifter har debiterats i banken men saknas i redovisningen. Detta är en kombination av timing differences och potentiellt saknade bokföringar.",
  "discrepancies": [
    {
      "type": "MISSING_TRANSACTION",
      "amount": 60000,
      "date": "2024-01-25",
      "explanation": "Marknadsföringsavgift saknas i redovisning"
    },
    {
      "type": "MISSING_TRANSACTION",
      "amount": 50000,
      "date": "2024-01-22",
      "explanation": "Juridisk konsultationsavgift saknas i redovisning"
    },
    {
      "type": "TIMING_DIFFERENCE",
      "amount": 25000,
      "date": "2024-01-18",
      "explanation": "Revideringsavgift debiterad men väntar på bokföring"
    },
    {
      "type": "TIMING_DIFFERENCE",
      "amount": 15000,
      "date": "2024-01-12",
      "explanation": "Kombinerade små avgifter (bankavgift + uppdragsförvaltning)"
    }
  ],
  "recommendations": [
    "Prioritera bokföring av större avgifter (60K + 50K SEK)",
    "Verifiera att alla avgifter är korrekta",
    "Bokför alla avgifter i redovisningen",
    "Överväg att automatisera avgiftsbokföring för framtiden"
  ],
  "flags": [
    {
      "severity": "warning",
      "message": "Flera saknade transaktioner detekterade - kräver systematisk granskning",
      "code": "MULTIPLE_MISSING_TXNS"
    }
  ]
}
```

**Värde:**
- ✅ Sparar timmar av manuell analys
- ✅ Identifierar alla problem samtidigt
- ✅ Prioriterar större belopp
- ✅ Föreslår systematiska lösningar

---

## 🛡️ KYC-GRANSKNING (KYC_REVIEW)

### Exempel 4: Low Risk - Institutionell Investerare

**Scenario:** En pensionfond vill investera i fonden.

**Input:**
```json
{
  "investorName": "Pension Fund Sweden",
  "investorId": "inv_123",
  "kycStatus": "PENDING",
  "kycRiskLevel": null,
  "pepStatus": null,
  "sanctionStatus": null,
  "documentUrl": "https://s3.../kyc-docs.pdf",
  "uboTree": {
    "owners": [
      {
        "name": "Swedish State",
        "ownership": 100,
        "type": "government"
      }
    ]
  },
  "documents": {
    "identityDoc": "verified",
    "addressProof": "verified",
    "ownershipStructure": "verified",
    "pepCheck": "clear",
    "sanctionCheck": "clear"
  }
}
```

**AI Process:**
- GPT analyserar ägarstruktur (100% statlig)
- Kontrollerar PEP-status (klar)
- Kontrollerar sanktionslistor (klar)
- Verifierar dokumentation (komplett)
- Bedömer risk som låg

**Output:**
```json
{
  "approved": true,
  "riskLevel": "low",
  "pepStatus": "clear",
  "sanctionStatus": "clear",
  "issues": [],
  "recommendedActions": [
    "Godkänn KYC-ansökan",
    "Lägg till på godkänd investerarlista",
    "Aktivera investerarkonto",
    "Skicka välkomstmeddelande"
  ],
  "reasoning": "Pension Fund Sweden är en statlig institution med 100% statligt ägande. Alla dokument är verifierade och PEP/sanction checks är klara. Risknivå är låg och ansökan kan godkännas direkt."
}
```

**Värde:**
- ✅ Sparar 2-3 timmar manuell granskning
- ✅ Standardiserad bedömning
- ✅ Snabbare onboarding för lågrisk-investerare
- ✅ Compliance-automatisering

---

### Exempel 5: High Risk - PEP Connection

**Scenario:** En individ med PEP-status vill investera.

**Input:**
```json
{
  "investorName": "Individual Investor A",
  "investorId": "inv_456",
  "kycStatus": "PENDING",
  "pepStatus": "flagged",
  "sanctionStatus": "clear",
  "uboTree": {
    "owners": [
      {
        "name": "Individual Investor A",
        "ownership": 100,
        "type": "individual",
        "pepStatus": "politically_exposed_person"
      }
    ]
  },
  "documents": {
    "identityDoc": "verified",
    "addressProof": "verified",
    "ownershipStructure": "incomplete",
    "pepCheck": "flagged",
    "sanctionCheck": "clear"
  }
}
```

**AI Process:**
- GPT identifierar PEP-status
- Kontrollerar dokumentation (ofullständig ägarstruktur)
- Bedömer risk som hög
- Rekommenderar enhanced due diligence

**Output:**
```json
{
  "approved": false,
  "riskLevel": "high",
  "pepStatus": "flagged",
  "sanctionStatus": "clear",
  "issues": [
    "PEP-status flaggad - kräver enhanced due diligence",
    "Ofullständig ägarstrukturdokumentation",
    "Saknade dokument för PEP-verifiering"
  ],
  "recommendedActions": [
    "Genomför enhanced due diligence",
    "Skaffa komplett ägarstrukturdokumentation",
    "Verifiera ursprung av medel",
    "Kräv senior management godkännande",
    "Genomför löpande PEP-uppföljning"
  ],
  "reasoning": "Investor A har PEP-status och ofullständig dokumentation. Enligt AML-regler krävs enhanced due diligence och komplett dokumentation innan godkännande."
}
```

**Värde:**
- ✅ Fångar compliance-risk direkt
- ✅ Förhindrar potentiella AML-problem
- ✅ Standardiserad process för högrisk-investerare
- ✅ Förbättrar säkerhet

---

## 📄 RAPPORTGENERERING (REPORT_DRAFT)

### Exempel 6: Månadsrapport - Fondredovisning

**Scenario:** Generera månadsrapport för fonden.

**Input:**
```json
{
  "clientName": "Tech Growth Fund",
  "reportType": "FUND_ACCOUNTING",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "data": {
    "bankTransactions": 145,
    "ledgerEntries": 142,
    "investors": 25,
    "totalBalance": 125000000,
    "inflows": 5000000,
    "outflows": 2000000,
    "netPerformance": 3.2,
    "topHoldings": [
      { "name": "Company A", "value": 30000000, "percentage": 24 },
      { "name": "Company B", "value": 25000000, "percentage": 20 },
      { "name": "Company C", "value": 20000000, "percentage": 16 }
    ],
    "riskMetrics": {
      "var95": 2500000,
      "concentration": "moderate",
      "limitBreaches": []
    }
  }
}
```

**AI Process:**
- GPT analyserar all data
- Strukturerar rapporten professionellt
- Inkluderar relevanta metrics
- Följer svenska redovisningsstandarder

**Output:**
```json
{
  "report": "# Fondredovisningsrapport - Januari 2024\n\n## Executive Summary\n\nTech Growth Fund visade stark prestanda under januari 2024 med en total balans på 125M SEK och en nettoavkastning på 3.2%. Fonden har 25 aktiva investerare och 145 banktransaktioner under månaden.\n\n## Prestandaöversikt\n\n- **Total Assets:** 125,000,000 SEK\n- **Månadsavkastning:** 3.2%\n- **Inkommande kapital:** 5,000,000 SEK\n- **Utgående kapital:** 2,000,000 SEK\n- **Nettoflöde:** +3,000,000 SEK\n\n## Portföljsammansättning\n\n### Top 5 Positioner:\n1. Company A: 30M SEK (24%)\n2. Company B: 25M SEK (20%)\n3. Company C: 20M SEK (16%)\n\n### Koncentration:\nPortföljen visar måttlig koncentration med top 3 positioner som utgör 60% av totala portföljen.\n\n## Riskbedömning\n\n- **VaR (95%):** 2.5M SEK\n- **Risknivå:** Måttlig\n- **Limit Breaches:** Inga\n- **Koncentration:** Måttlig\n\n## Regulatorisk Compliance\n\nAlla regulatoriska krav har uppfyllts:\n- ✅ NAV-beräkning klart T+3\n- ✅ Månadsrapportering komplett\n- ✅ Alla transaktioner stämda\n- ✅ KYC-uppföljning uppdaterad\n\n## Bilagor\n\n- Detaljerad transaktionslista\n- Fullständig portföljlista\n- Riskmetrics detaljer\n"
}
```

**Värde:**
- ✅ Sparar 4-6 timmar manuellt skrivande
- ✅ Standardiserad rapportstruktur
- ✅ Professionellt språk
- ✅ Komplett och korrekt data

---

## 🔍 KVALITETSKONTROLL (QC_CHECK)

### Exempel 7: Kontoplan-validering

**Scenario:** Kontrollera att alla transaktioner följer korrekt kontoplan.

**Input:**
```json
{
  "ledgerEntries": [
    { "account": "1910", "amount": 1000000, "description": "Bankkonto" },
    { "account": "1930", "amount": -500000, "description": "Investering" },
    { "account": "9999", "amount": 50000, "description": "Övrigt" }, // Felaktigt konto
    { "account": "3000", "amount": 10000, "description": "Intäkt" },
    { "account": "4000", "amount": -5000, "description": "Kostnad" }
  ],
  "chartOfAccounts": {
    "1910": "Bankkonto",
    "1930": "Investeringar",
    "3000": "Intäkter",
    "4000": "Kostnader"
  }
}
```

**AI Process:**
- GPT kontrollerar varje transaktion mot kontoplanen
- Identifierar felaktigt konto (9999)
- Verifierar att belopp och konton matchar beskrivningar
- Flaggar problem

**Output:**
```json
{
  "analysis": "Kvalitetskontroll av 5 transaktioner genomförd. Ett problem identifierat.",
  "issues": [
    {
      "type": "INVALID_ACCOUNT",
      "account": "9999",
      "amount": 50000,
      "description": "Övrigt",
      "severity": "error",
      "message": "Konto 9999 finns inte i kontoplanen. Använd korrekt konto eller lägg till i kontoplanen."
    }
  ],
  "recommendations": [
    "Korrigera konto 9999 till korrekt kontonummer",
    "Verifiera att kontoplanen är komplett",
    "Överväg att lägga till konto 9999 i kontoplanen om det behövs"
  ],
  "flags": [
    {
      "severity": "error",
      "message": "Felaktigt kontonummer detekterat",
      "code": "INVALID_ACCOUNT"
    }
  ]
}
```

**Värde:**
- ✅ Fångar bokföringsfel automatiskt
- ✅ Förhindrar felaktiga rapporter
- ✅ Förbättrar data quality
- ✅ Sparar tid vid årsredovisning

---

## 📈 RISK MANAGEMENT

### Exempel 8: VaR-beräkning och Limit Breach

**Scenario:** Beräkna risk och identifiera limit breaches.

**Input:**
```json
{
  "portfolio": {
    "totalValue": 125000000,
    "holdings": [
      { "name": "Company A", "value": 45000000, "percentage": 36 },
      { "name": "Company B", "value": 30000000, "percentage": 24 },
      { "name": "Company C", "value": 20000000, "percentage": 16 }
    ]
  },
  "limits": {
    "maxSingleHolding": 0.30,
    "maxConcentration": 0.50,
    "maxVaR": 5000000
  }
}
```

**AI Process:**
- GPT beräknar VaR
- Kontrollerar koncentration
- Identifierar limit breaches
- Bedömer risknivå

**Output:**
```json
{
  "var95": 3500000,
  "concentration": {
    "top3Holdings": 0.76,
    "topSingleHolding": 0.36
  },
  "limitBreaches": {
    "maxSingleHolding": true,
    "maxConcentration": true,
    "maxVaR": false
  },
  "riskLevel": "high",
  "issues": [
    "Company A utgör 36% av portföljen (limit: 30%)",
    "Top 3 positioner utgör 76% av portföljen (limit: 50%)"
  ],
  "recommendations": [
    "Minska exponering mot Company A till under 30%",
    "Spretta risken över fler positioner",
    "Överväg att sälja delar av Company A",
    "Öka diversifiering i portföljen"
  ]
}
```

**Värde:**
- ✅ Automatisk riskberäkning
- ✅ Identifierar compliance-problem
- ✅ Proaktiva rekommendationer
- ✅ Förbättrar riskhantering

---

## 🎯 SAMMANFATTNING

### Vad systemet kan klara av (när fullt utbildat):

#### ✅ Bankavstämning:
- Identifiera timing differences
- Hitta saknade transaktioner
- Klassificera avvikelser (error/warning/info)
- Prioritera större problem
- Ge konkreta rekommendationer

#### ✅ KYC-granskning:
- Bedöma risknivå (low/medium/high)
- Kontrollera PEP-status
- Verifiera ägarstruktur
- Identifiera compliance-problem
- Standardisera beslutsprocess

#### ✅ Rapportgenerering:
- Generera månadsrapporter
- Skriva årsredovisningar
- Strukturera rapporter professionellt
- Inkludera relevanta metrics
- Följa regelverk

#### ✅ Kvalitetskontroll:
- Validera kontoplan
- Kontrollera bokföringsfel
- Identifiera inkonsistenser
- Förbättra data quality

#### ✅ Riskhantering:
- Beräkna VaR
- Identifiera limit breaches
- Bedöma koncentration
- Ge riskrekommendationer

### Förväntade resultat:

- **Accuracy:** 90-95% (efter träning)
- **Tidsbesparing:** 70-80% av manuellt arbete
- **Felreduktion:** 80-90% färre fel
- **Compliance:** 100% regeluppföljning
- **Skalbarhet:** Hantera flera kunder samtidigt

### Värde:

- ✅ **Sparar tid:** Timmar → Minuter
- ✅ **Förbättrar kvalitet:** Standardiserad process
- ✅ **Förhindrar fel:** Proaktiv identifiering
- ✅ **Compliance:** Automatisk regeluppföljning
- ✅ **Skalbarhet:** Hantera flera kunder enkelt

**Systemet blir en kraftfull assistent som kan hantera komplexa redovisningsuppgifter med hög precision!** 🚀

