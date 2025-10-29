'use client';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for demo - use backend in production
});

export interface AITaskPayload {
  clientId: string;
  taskKind: 'BANK_RECON' | 'KYC_REVIEW' | 'REPORT_DRAFT';
  context: Record<string, any>;
}

export interface AIResponse {
  analysis: string;
  recommendations: string[];
  flags: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    code: string;
  }>;
}

const SYSTEM_PROMPTS = {
  BANK_RECON: `You are an expert fund accountant. Analyze bank reconciliation data and identify discrepancies. 
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
  
  KYC_REVIEW: `You are a compliance expert. Review KYC records and assess risk levels.
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
  
  REPORT_DRAFT: `You are a professional fund accounting report writer. Draft investment fund reports.
    Return a JSON object with: analysis, recommendations (array), and flags (array of {severity, message, code}).`,
};

export async function processAITask(payload: AITaskPayload): Promise<AIResponse> {
  try {
    const systemPrompt = SYSTEM_PROMPTS[payload.taskKind];
    
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Process this task: ${JSON.stringify(payload.context)}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return JSON.parse(content) as AIResponse;
  } catch (error) {
    console.error('OpenAI processing error:', error);
    throw error;
  }
}

export async function generateReport(
  clientName: string,
  reportType: string,
  data: Record<string, any>
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional fund accounting report writer. Generate professional, accurate reports.`,
        },
        {
          role: 'user',
          content: `Generate a ${reportType} report for ${clientName}. Data: ${JSON.stringify(data)}`,
        },
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}
