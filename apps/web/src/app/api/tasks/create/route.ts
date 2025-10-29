import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, kind, payload } = await request.json();

    if (!clientId || !kind) {
      return NextResponse.json(
        { error: 'clientId and kind are required' },
        { status: 400 }
      );
    }

    // Hämta data baserat på task kind
    let context: any = {};

    if (kind === 'BANK_RECON') {
      const periodStart = payload?.periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const periodEnd = payload?.periodEnd || new Date().toISOString();

      const [bankTransactions, ledgerEntries] = await Promise.all([
        prisma.bankTransaction.findMany({
          where: {
            clientId,
            bookingDate: {
              gte: new Date(periodStart),
              lte: new Date(periodEnd),
            },
          },
        }),
        prisma.ledgerEntry.findMany({
          where: {
            clientId,
            bookingDate: {
              gte: new Date(periodStart),
              lte: new Date(periodEnd),
            },
          },
        }),
      ]);

      const bankBalance = bankTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const ledgerBalance = ledgerEntries.reduce((sum, e) => sum + Number(e.amount), 0);

      context = {
        bankBalance,
        ledgerBalance,
        discrepancy: bankBalance - ledgerBalance,
        recentTransactions: bankTransactions.slice(-10).map(t => ({
          date: t.bookingDate,
          amount: t.amount,
          description: t.description,
        })),
        bankTransactions: bankTransactions.length,
        ledgerEntries: ledgerEntries.length,
      };
    } else if (kind === 'KYC_REVIEW') {
      const investorId = payload?.investorId;
      if (!investorId) {
        return NextResponse.json(
          { error: 'investorId is required for KYC_REVIEW' },
          { status: 400 }
        );
      }

      const investor = await prisma.investor.findUnique({
        where: { id: investorId },
        include: {
          kycRecords: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!investor) {
        return NextResponse.json(
          { error: 'Investor not found' },
          { status: 404 }
        );
      }

      context = {
        investorName: investor.name,
        investorId: investor.id,
        documentSet: investor.kycRecords[0]?.documentSet || {},
      };
    } else if (kind === 'REPORT_DRAFT') {
      const reportType = payload?.reportType || 'FUND_ACCOUNTING';
      const periodStart = payload?.periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const periodEnd = payload?.periodEnd || new Date().toISOString();

      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      const [bankTransactions, ledgerEntries, investors] = await Promise.all([
        prisma.bankTransaction.findMany({
          where: {
            clientId,
            bookingDate: {
              gte: new Date(periodStart),
              lte: new Date(periodEnd),
            },
          },
        }),
        prisma.ledgerEntry.findMany({
          where: {
            clientId,
            bookingDate: {
              gte: new Date(periodStart),
              lte: new Date(periodEnd),
            },
          },
        }),
        prisma.investor.findMany({
          where: { clientId },
        }),
      ]);

      context = {
        clientName: client?.name || 'Unknown',
        reportType,
        periodStart,
        periodEnd,
        bankTransactions: bankTransactions.length,
        ledgerEntries: ledgerEntries.length,
        investors: investors.length,
        totalBalance: bankTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
      };
    }

    // Anropa AI för att analysera
    const aiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskKind: kind,
        context,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI processing failed');
    }

    const aiResult = await aiResponse.json();

    // Skapa Task i databasen
    const task = await prisma.task.create({
      data: {
        clientId,
        kind,
        status: 'NEEDS_REVIEW',
        payload: {
          ...payload,
          ...aiResult,
          processedAt: new Date().toISOString(),
        },
        flags: {
          create: (aiResult.flags || []).map((flag: any) => ({
            severity: flag.severity || 'info',
            message: flag.message,
            code: flag.code || 'AI_FLAG',
          })),
        },
      },
      include: {
        flags: true,
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      task,
      message: `Task created successfully. Check Coordinator Inbox for review.`,
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

