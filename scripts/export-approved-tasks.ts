import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

/**
 * Exportera godkända tasks och konvertera till AI examples
 * 
 * Kör: npx tsx scripts/export-approved-tasks.ts
 */
async function exportApprovedTasks() {
  console.log('📊 Exporterar godkända tasks...');

  // Hitta alla godkända tasks
  const tasks = await prisma.task.findMany({
    where: {
      kind: 'BANK_RECON',
      status: 'DONE',
      comment: { not: null }, // Kommentar betyder att någon granskat
    },
    include: {
      client: { select: { name: true } },
      flags: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  console.log(`✅ Hittade ${tasks.length} godkända tasks`);

  // Konvertera till examples format
  const examples = tasks
    .filter(task => {
      // Filtrera bort tasks utan korrekt payload-struktur
      return (
        task.payload &&
        typeof task.payload === 'object' &&
        'bankBalance' in task.payload &&
        'ledgerBalance' in task.payload
      );
    })
    .map(task => {
      const payload = task.payload as any;

      return {
        input: {
          bankBalance: payload.bankBalance,
          ledgerBalance: payload.ledgerBalance,
          discrepancy: payload.discrepancy || (payload.bankBalance - payload.ledgerBalance),
          recentTransactions: payload.recentTransactions || [],
        },
        output: {
          analysis: payload.analysis || task.comment || 'Analysis completed',
          discrepancies: payload.discrepancies || [],
          recommendations: payload.recommendations || [],
          flags: payload.flags || task.flags.map(f => ({
            severity: f.severity,
            message: f.message,
            code: f.code,
          })),
        },
        tags: extractTags(payload, task.flags),
        metadata: {
          taskId: task.id,
          clientName: task.client?.name || 'Unknown',
          approvedAt: task.updatedAt.toISOString(),
        },
      };
    });

  // Spara till JSON-fil
  const outputPath = 'approved-tasks-examples.json';
  fs.writeFileSync(outputPath, JSON.stringify(examples, null, 2));

  console.log(`✅ Exporterade ${examples.length} examples till ${outputPath}`);
  console.log(`📝 Tags använda:`, [...new Set(examples.flatMap(e => e.tags))]);
}

function extractTags(payload: any, flags: any[]): string[] {
  const tags: string[] = [];

  // Analysera discrepancies
  if (payload.discrepancies) {
    payload.discrepancies.forEach((d: any) => {
      if (d.type === 'TIMING_DIFFERENCE') tags.push('timing-difference');
      if (d.type === 'MISSING_TRANSACTION') tags.push('missing-transaction');
      if (d.type === 'INCORRECT_AMOUNT') tags.push('incorrect-amount');
      if (d.type === 'ROUNDING_ERROR') tags.push('rounding-error');
    });
  }

  // Analysera flags
  flags.forEach(flag => {
    if (flag.severity === 'error') tags.push('critical');
    if (flag.severity === 'warning') tags.push('warning');
    if (flag.severity === 'info') tags.push('info');
  });

  // Analysera belopp
  const discrepancy = payload.discrepancy || (payload.bankBalance - payload.ledgerBalance);
  if (Math.abs(discrepancy) < 10000) {
    tags.push('small-amount');
  } else if (Math.abs(discrepancy) > 1000000) {
    tags.push('large-amount');
  }

  // Analysera transaktioner
  if (payload.recentTransactions) {
    const hasFees = payload.recentTransactions.some((t: any) => 
      t.type === 'fee' || t.description?.toLowerCase().includes('fee')
    );
    if (hasFees) tags.push('fee');
  }

  return [...new Set(tags)]; // Ta bort duplicater
}

exportApprovedTasks()
  .catch((e) => {
    console.error('Error exporting tasks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

