'use client';

// This service calls a backend API route instead of using OpenAI directly
// This keeps the API key secure on the backend

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

export async function processAITask(payload: AITaskPayload): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI processing failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
}

export async function generateReport(
  clientName: string,
  reportType: string,
  data: Record<string, any>
): Promise<string> {
  try {
    const response = await fetch('/api/ai/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, reportType, data }),
    });

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.content || '';
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}
