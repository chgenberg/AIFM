import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kind, clientId, payload, assigneeId, dueAt } = body;

    if (!kind || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: kind, clientId' },
        { status: 400 }
      );
    }

    // Build task payload based on task kind
    let taskPayload: any = { ...payload };

    if (kind === 'INVESTOR_ONBOARD') {
      const { investorId } = payload || {};
      
      if (!investorId) {
        return NextResponse.json(
          { error: 'investorId is required for INVESTOR_ONBOARD tasks' },
          { status: 400 }
        );
      }

      // Fetch investor with kycRecord
      const investor = await prisma.investor.findUnique({
        where: { id: investorId },
        include: { kycRecord: true },
      });

      if (!investor) {
        return NextResponse.json(
          { error: 'Investor not found' },
          { status: 404 }
        );
      }

      // Build payload - remove documentSet reference since it doesn't exist in schema
      taskPayload = {
        investorName: investor.name,
        investorId: investor.id,
        // documentSet removed - not in KYCRecord schema
        // Use documentUrl if needed: investor.kycRecord?.documentUrl || null
        kycStatus: investor.kycRecord?.status || null,
        kycRiskLevel: investor.kycRecord?.riskLevel || null,
      };
    } else if (kind === 'REPORT_DRAFT') {
      const reportType = payload?.reportType || 'FUND_ACCOUNTING';
      taskPayload = {
        reportType,
        periodStart: payload?.periodStart,
        periodEnd: payload?.periodEnd,
        clientId,
      };
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        clientId,
        kind,
        status: 'QUEUED',
        payload: taskPayload,
        assigneeId: assigneeId || null,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Task creation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

