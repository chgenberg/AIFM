import { NextRequest, NextResponse } from 'next/server';
import { getAIModelForTask, buildAIMessages } from '@/lib/ai-knowledge';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Fallback prompts if no model found in database
 * These are migrated from the old hardcoded prompts
 */
const FALLBACK_PROMPTS: Record<string, string> = {
  BANK_RECON: `You are an expert in fund accounting and bank reconciliation. Your task is to:

1. Compare bank statements with ledger entries
2. Identify discrepancies and their causes
3. Classify deviations (critical, warnings, info)
4. Provide concrete recommendations for action

Always return a JSON object with this exact structure:
{
  "analysis": "Detailed analysis of discrepancies and their causes",
  "discrepancies": [
    {
      "type": "TIMING_DIFFERENCE|MISSING_TRANSACTION|INCORRECT_AMOUNT|OTHER",
      "amount": number,
      "date": "ISO-date",
      "explanation": "Explanation"
    }
  ],
  "recommendations": ["Action 1", "Action 2"],
  "flags": [
    {
      "severity": "error|warning|info",
      "message": "Message",
      "code": "CODE"
    }
  ]
}`,

  KYC_REVIEW: `You are a compliance officer and compliance expert. Your task is to review KYC documents:

1. Verify investor identity
2. Assess risk level (low, medium, high)
3. Check PEP status (politically exposed person)
4. Check sanctions lists
5. Analyze ownership structure (UBO)

Always return a JSON object:
{
  "approved": true|false,
  "riskLevel": "low|medium|high",
  "pepStatus": "clear|flagged",
  "sanctionStatus": "clear|flagged",
  "issues": ["Problem 1", "Problem 2"],
  "recommendedActions": ["Action 1", "Action 2"]
}`,

  REPORT_DRAFT: `You are a professional fund accounting report writer with 15 years of experience. Your task is to:

1. Summarize fund performance
2. Analyze portfolio holdings
3. Assess risks
4. Write a professional, readable report

Write report in Markdown format with clear structure.
Return JSON: { "report": "Markdown-text" }`,
};

const FALLBACK_EXAMPLES: Record<string, Array<{ user: string; assistant: string }>> = {
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
        analysis: 'Bank shows 125M SEK while ledger shows 124.95M SEK. Discrepancy of 50K SEK. Likely cause: management fee debited by bank 2024-01-16 but not yet posted in ledger.',
        discrepancies: [
          {
            type: 'TIMING_DIFFERENCE',
            amount: 50000,
            date: '2024-01-16',
            explanation: 'Management fee debited by bank but pending in ledger'
          }
        ],
        recommendations: [
          'Verify that 50K fee is correct',
          'Post in ledger to reconcile'
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

    if (!taskKind) {
      return NextResponse.json(
        { error: 'taskKind is required' },
        { status: 400 }
      );
    }

    // Try to get AI model from Knowledge Base
    let model = null;
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    try {
      model = await getAIModelForTask(taskKind as any);
      
      if (model) {
        // Use Knowledge Base model
        messages = buildAIMessages(model, context);
      } else {
        // Fallback to hardcoded prompts (backward compatibility)
        const systemPrompt = FALLBACK_PROMPTS[taskKind];
        const examples = FALLBACK_EXAMPLES[taskKind] || [];

        if (!systemPrompt) {
          return NextResponse.json(
            { error: `Invalid task kind: ${taskKind}` },
            { status: 400 }
          );
        }

        messages = [
          { role: 'system', content: systemPrompt },
        ];

        // Add few-shot examples
        for (const example of examples) {
          messages.push(
            { role: 'user', content: example.user },
            { role: 'assistant', content: example.assistant }
          );
        }

        // Add actual context
        messages.push({
          role: 'user',
          content: `Analyze this data: ${JSON.stringify(context)}`,
        });
      }
    } catch (error) {
      console.error('Error loading AI model:', error);
      // Fallback to hardcoded prompts
      const systemPrompt = FALLBACK_PROMPTS[taskKind];
      if (!systemPrompt) {
        return NextResponse.json(
          { error: `Invalid task kind: ${taskKind}` },
          { status: 400 }
        );
      }
      messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this data: ${JSON.stringify(context)}`,
        },
      ];
    }

    // Call OpenAI
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-5-mini';
    const isGPT5Mini = openaiModel === 'gpt-5-mini';
    
    const requestParams: any = {
      model: openaiModel,
      messages,
      response_format: { type: 'json_object' },
    };

    // GPT-5-mini specific parameters
    if (isGPT5Mini) {
      // Use settings from Knowledge Base if available
      const settings = model?.settings as any;
      requestParams.verbosity = settings?.verbosity || 'medium';
      // Map 'standard' to 'medium' if present (for backward compatibility)
      const reasoningEffort = settings?.reasoning_effort === 'standard' ? 'medium' : (settings?.reasoning_effort || 'medium');
      requestParams.reasoning_effort = reasoningEffort; // low, medium, high
    }

    const response = await openai.chat.completions.create(requestParams);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);

    // Track usage if using Knowledge Base model
    if (model && model.examples.length > 0) {
      // Find which example was most similar (simplified - could be improved with embeddings)
      // For now, just track that model was used
      // TODO: Implement proper example matching
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'AI processing failed', details: error?.message },
      { status: 500 }
    );
  }
}
