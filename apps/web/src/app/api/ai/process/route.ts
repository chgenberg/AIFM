import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎓 System prompts för att "utbilda" GPT
const SYSTEM_PROMPTS: Record<string, string> = {
  BANK_RECON: `Du är en expert på fondredovisning och bankavstämning. Din uppgift är att:

1. Jämföra bankutdrag med redovisningen
2. Identifiera diskrepanser och deras orsaker
3. Klassificera avvikelser (kritiska, varningar, info)
4. Ge konkreta rekommendationer för åtgärd

Returnera alltid ett JSON-objekt med denna exakta struktur:
{
  "analysis": "Detaljerad analys av avvikelserna och deras orsaker",
  "discrepancies": [
    {
      "type": "TIMING_DIFFERENCE|MISSING_TRANSACTION|INCORRECT_AMOUNT|OTHER",
      "amount": tal,
      "date": "ISO-datum",
      "explanation": "Förklaring"
    }
  ],
  "recommendations": ["Åtgärd 1", "Åtgärd 2"],
  "flags": [
    {
      "severity": "error|warning|info",
      "message": "Meddelande",
      "code": "KOD"
    }
  ]
}`,

  KYC_REVIEW: `Du är en compliance officer och compliance expert. Din uppgift är att granska KYC-dokument:

1. Verifiera investerares identitet
2. Bedöm risknivå (low, medium, high)
3. Kontrollera PEP-status (politically exposed person)
4. Kontrollera sanktionslister
5. Analysera ägarstrukturen (UBO)

Returnera alltid ett JSON-objekt:
{
  "approved": true|false,
  "riskLevel": "low|medium|high",
  "pepStatus": "clear|flagged",
  "sanctionStatus": "clear|flagged",
  "issues": ["Problem 1", "Problem 2"],
  "recommendedActions": ["Åtgärd 1", "Åtgärd 2"]
}`,

  REPORT_DRAFT: `Du är en professionell fondredovisningsrapportskrivare med 15 års erfarenhet. Din uppgift är att:

1. Sammanfatta fondens prestanda
2. Analysera portföljhållningar
3. Bedöma risker
4. Skriva en professionell, läsbar rapport

Skriva rapport i Markdown format med tydlig struktur.
Returnera JSON: { "report": "Markdown-text" }`,
};

// 📚 Few-shot examples för att träna GPT bättre
const FEW_SHOT_EXAMPLES: Record<string, Array<{ user: string; assistant: string }>> = {
  BANK_RECON: [
    {
      user: JSON.stringify({
        bankBalance: 125000000,
        ledgerBalance: 124950000,
        discrepancy: 50000,
        recentTransactions: [
          { date: '2024-01-15', amount: 5000000, type: 'inflow', description: 'Capital call' },
          { date: '2024-01-16', amount: -50000, type: 'fee', description: 'Management fee' }
        ]
      }),
      assistant: JSON.stringify({
        analysis: 'Bank visar 125M SEK medan redovisningen visar 124.95M SEK. Diskrepans på 50K SEK. Trolig orsak: management fee debited av bank 2024-01-16 men ännu inte bokförd i redovisningen.',
        discrepancies: [
          {
            type: 'TIMING_DIFFERENCE',
            amount: 50000,
            date: '2024-01-16',
            explanation: 'Management fee debited by bank but pending in ledger'
          }
        ],
        recommendations: [
          'Verifiera att 50K fee är korrekt',
          'Bokför i redovisningen för att stämma av'
        ],
        flags: [
          {
            severity: 'info',
            message: 'Timing difference detected - normal reconciliation item',
            code: 'TIMING_DIFF'
          }
        ]
      })
    }
  ],
  KYC_REVIEW: [
    {
      user: JSON.stringify({
        investorName: 'Pension Fund Sweden',
        documentSet: {
          identityDoc: 'verified',
          addressProof: 'verified',
          ownershipStructure: '100% Swedish State',
          pepCheck: 'clear',
          sanctionCheck: 'clear'
        }
      }),
      assistant: JSON.stringify({
        approved: true,
        riskLevel: 'low',
        pepStatus: 'clear',
        sanctionStatus: 'clear',
        issues: [],
        recommendedActions: ['Approve KYC application', 'Add to approved investor list']
      })
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const { taskKind, context } = await request.json();

    if (!taskKind || !SYSTEM_PROMPTS[taskKind]) {
      return NextResponse.json(
        { error: 'Invalid task kind' },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[taskKind];
    const examples = FEW_SHOT_EXAMPLES[taskKind] || [];

    // 🧠 Bygga messages: system + few-shot examples + user context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Lägg till few-shot examples
    for (const example of examples) {
      messages.push(
        { role: 'user', content: example.user },
        { role: 'assistant', content: example.assistant }
      );
    }

    // Lägg till actual context
    messages.push({
      role: 'user',
      content: `Analysera denna data: ${JSON.stringify(context)}`
    });

    // 🚀 Anropa GPT med tränade prompts
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      messages,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
}
