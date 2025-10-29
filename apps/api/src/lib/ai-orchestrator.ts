/**
 * AI Orchestrator
 * 
 * Coordinates AI-driven task execution with human oversight.
 * Handles reconciliation, report generation, and KYC processing.
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { logger } from '@/../../../libs/logger';
import { reconcile_transactions } from '@/../../packages/ai/src/reconciliation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const BANK_RECONCILIATION_PROMPT = `You are an expert fund accountant AI assistant.
Your job is to analyze bank transactions and ledger entries to reconcile them.

When given transaction data:
1. Identify matches between bank and ledger entries
2. Flag any mismatches with severity (error, warning, info)
3. Calculate totals and variances
4. Generate a reconciliation summary
5. Recommend next steps

Be thorough and flag edge cases. Always include confidence scores.`;

const KYC_REVIEW_PROMPT = `You are a compliance expert reviewing KYC (Know Your Customer) records.

When reviewing KYC data:
1. Check for required fields and documentation
2. Identify any red flags (PEP status, sanctions, UBO concerns)
3. Assess risk level (low, medium, high)
4. Recommend approval or rejection with reasoning
5. Flag any items requiring escalation

Be conservative - flag uncertain items for human review.`;

const REPORT_GENERATION_PROMPT = `You are a professional fund accounting report writer.

When generating reports:
1. Structure clearly with sections: Executive Summary, Fund Performance, Risk Analysis, Compliance
2. Use precise financial language
3. Include all required metrics and calculations
4. Highlight any variances or concerns
5. Provide clear, actionable insights for fund managers and investors

Format output as clean Markdown suitable for PDF conversion.`;

// ============================================================================
// TASK PROCESSORS
// ============================================================================

export async function processBankReconciliation(taskId: string, payload: any) {
  logger.info(`Processing bank reconciliation task: ${taskId}`);

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const { clientId, startDate, endDate } = payload;

    // Get bank and ledger data
    const [bankData, ledgerData] = await Promise.all([
      getBankTransactionData(clientId, startDate, endDate),
      getLedgerData(clientId, startDate, endDate),
    ]);

    // Run reconciliation algorithm
    const result = reconcile_transactions(bankData, ledgerData);

    // Generate AI analysis
    const analysis = await generateReconciliationAnalysis(result, bankData, ledgerData);

    // Create flags for issues
    await createFlagsFromReconciliation(taskId, result);

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'NEEDS_REVIEW',
        payload: {
          ...payload,
          result,
          analysis,
          processedAt: new Date().toISOString(),
        },
      },
    });

    logger.info(`Bank reconciliation completed for task ${taskId}`);
    return { success: true, taskId, analysis };
  } catch (error) {
    logger.error(`Bank reconciliation failed: ${taskId}`, { error });

    // Create error flag
    await prisma.flag.create({
      data: {
        taskId,
        severity: 'error',
        message: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'PROCESSING_ERROR',
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'BLOCKED' },
    });

    throw error;
  }
}

export async function processKYCReview(taskId: string, payload: any) {
  logger.info(`Processing KYC review task: ${taskId}`);

  try {
    const { clientId, investorId } = payload;

    // Get KYC record
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { id: payload.kycRecordId },
      include: { investor: true },
    });

    if (!kycRecord) {
      throw new Error('KYC record not found');
    }

    // Generate AI compliance analysis
    const analysis = await generateKYCAnalysis(kycRecord);

    // Create flags based on analysis
    if (analysis.flags && analysis.flags.length > 0) {
      for (const flag of analysis.flags) {
        await prisma.flag.create({
          data: {
            taskId,
            severity: flag.severity,
            message: flag.message,
            code: flag.code,
            context: flag.context,
          },
        });
      }
    }

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: analysis.requiresEscalation ? 'BLOCKED' : 'NEEDS_REVIEW',
        payload: {
          ...payload,
          analysis,
          recommendation: analysis.recommendation,
          riskLevel: analysis.riskLevel,
          processedAt: new Date().toISOString(),
        },
      },
    });

    logger.info(`KYC review completed for task ${taskId}`);
    return { success: true, taskId, analysis };
  } catch (error) {
    logger.error(`KYC review failed: ${taskId}`, { error });

    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'BLOCKED' },
    });

    throw error;
  }
}

export async function generateReportDraft(taskId: string, payload: any) {
  logger.info(`Generating report draft for task: ${taskId}`);

  try {
    const { clientId, reportType, periodStart, periodEnd } = payload;

    // Get all necessary data for report
    const [client, bankData, ledgerData, kycData] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      getBankTransactionData(clientId, periodStart, periodEnd),
      getLedgerData(clientId, periodStart, periodEnd),
      prisma.kycRecord.findMany({ where: { clientId, status: 'APPROVED' } }),
    ]);

    if (!client) throw new Error('Client not found');

    // Generate report content with AI
    const reportContent = await generateReportContent(
      client,
      reportType,
      periodStart,
      periodEnd,
      bankData,
      ledgerData,
      kycData
    );

    // Save draft report
    const report = await prisma.report.upsert({
      where: {
        clientId_type_periodStart_periodEnd: {
          clientId,
          type: reportType,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
        },
      },
      update: {
        draftText: reportContent.markdown,
        draftMetrics: reportContent.metrics,
        status: 'DRAFT',
      },
      create: {
        clientId,
        type: reportType,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        draftText: reportContent.markdown,
        draftMetrics: reportContent.metrics,
        status: 'DRAFT',
      },
    });

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'NEEDS_REVIEW',
        payload: {
          ...payload,
          reportId: report.id,
          processedAt: new Date().toISOString(),
        },
      },
    });

    logger.info(`Report draft generated for task ${taskId}`);
    return { success: true, taskId, reportId: report.id };
  } catch (error) {
    logger.error(`Report generation failed: ${taskId}`, { error });

    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'BLOCKED' },
    });

    throw error;
  }
}

// ============================================================================
// AI ANALYSIS GENERATORS
// ============================================================================

async function generateReconciliationAnalysis(result: any, bankData: any[], ledgerData: any[]) {
  const prompt = `${BANK_RECONCILIATION_PROMPT}

Here's the data to analyze:

Bank Transactions (${bankData.length} total):
${JSON.stringify(bankData.slice(0, 5), null, 2)}

Ledger Entries (${ledgerData.length} total):
${JSON.stringify(ledgerData.slice(0, 5), null, 2)}

Reconciliation Results:
- Matched: ${result.matched?.length || 0}
- Unmatched Bank: ${result.deltas?.filter((d: any) => d.type === 'unmatched_bank').length || 0}
- Unmatched Ledger: ${result.deltas?.filter((d: any) => d.type === 'unmatched_ledger').length || 0}
- Match Rate: ${(result.matched?.length / bankData.length * 100).toFixed(1)}%
- Variance: ${result.variance || 0}

Provide a professional analysis with recommendations.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: BANK_RECONCILIATION_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}

async function generateKYCAnalysis(kycRecord: any) {
  const prompt = `${KYC_REVIEW_PROMPT}

KYC Record to Review:
${JSON.stringify(kycRecord, null, 2)}

Provide:
1. Risk Assessment
2. Any Red Flags (list with codes)
3. Recommendation (APPROVE, REJECT, or REQUEST_MORE_INFO)
4. Reasoning

Format as JSON with fields: riskLevel, flags[], recommendation, reasoning`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: KYC_REVIEW_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return {
      riskLevel: 'medium',
      recommendation: 'REQUEST_MORE_INFO',
      requiresEscalation: true,
      flags: [],
    };
  }
}

async function generateReportContent(
  client: any,
  reportType: string,
  periodStart: string,
  periodEnd: string,
  bankData: any[],
  ledgerData: any[],
  kycData: any[]
) {
  const prompt = `${REPORT_GENERATION_PROMPT}

Generate a ${reportType} report for:
- Fund: ${client.name}
- Period: ${periodStart} to ${periodEnd}
- Bank Balance: ${bankData.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)}
- Ledger Entries: ${ledgerData.length}
- KYC Records: ${kycData.length}

Include key metrics and professional insights.
Format as Markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: REPORT_GENERATION_PROMPT,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return {
    markdown: response.choices[0].message.content || '',
    metrics: {
      bankBalance: bankData.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0),
      ledgerCount: ledgerData.length,
      kycCount: kycData.length,
    },
  };
}

// ============================================================================
// DATA RETRIEVAL HELPERS
// ============================================================================

async function getBankTransactionData(clientId: string, startDate: string, endDate: string) {
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      clientId,
      source: 'BANK',
      bookingDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  return entries.map((e) => ({
    id: e.id,
    date: e.bookingDate.toISOString(),
    amount: parseFloat(e.amount.toString()),
    description: e.description,
  }));
}

async function getLedgerData(clientId: string, startDate: string, endDate: string) {
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      clientId,
      bookingDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  return entries.map((e) => ({
    id: e.id,
    bookingDate: e.bookingDate.toISOString(),
    amount: parseFloat(e.amount.toString()),
    description: e.description,
    account: e.account,
  }));
}

async function createFlagsFromReconciliation(taskId: string, result: any) {
  const flags = [];

  // Flag unmatched bank transactions
  if (result.deltas) {
    for (const delta of result.deltas) {
      if (delta.type === 'unmatched_bank') {
        flags.push({
          taskId,
          severity: delta.severity || 'warning',
          message: `Unmatched bank transaction: ${delta.description}`,
          code: 'UNMATCHED_BANK',
          context: {
            amount: delta.amount,
            date: delta.date,
          },
        });
      }
    }
  }

  // Create all flags
  await prisma.flag.createMany({
    data: flags,
  });
}
