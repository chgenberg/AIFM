import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS: Record<string, string> = {
  BANK_RECON: `You are an expert fund accountant. Analyze bank reconciliation data and identify discrepancies. 
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
  
  KYC_REVIEW: `You are a compliance expert. Review KYC records and assess risk levels.
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
  
  REPORT_DRAFT: `You are a professional fund accounting report writer. Draft investment fund reports.
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
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

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Process this task: ${JSON.stringify(context)}`,
        },
      ],
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
