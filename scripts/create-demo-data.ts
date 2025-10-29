import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Creating demo scenario...");

  // 1. Create a demo client
  const client = await prisma.client.upsert({
    where: { orgNo: "DEMO-CLIENT-001" },
    update: {},
    create: {
      name: "Nordic Growth Fund",
      orgNo: "DEMO-CLIENT-001",
      tier: "LARGE",
      contacts: {
        create: [
          {
            name: "John Smith",
            email: "john@nordicgrowth.se",
            role: "CFO",
            phone: "+46701234567",
          },
        ],
      },
      subscriptions: {
        create: [
          {
            plan: "AGENT_PORTAL",
            active: true,
            sla: "T+3",
          },
        ],
      },
      bankAccounts: {
        create: [
          {
            iban: "SE1234567890123456789012",
            currency: "SEK",
            balance: 125000000,
          },
        ],
      },
    },
  });

  console.log(`✓ Created client: ${client.name}`);

  // 2. Create bank transactions
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const transactions = await Promise.all([
    prisma.ledgerEntry.create({
      data: {
        clientId: client.id,
        source: "BANK",
        bookingDate: new Date(startOfMonth.getTime() + 86400000 * 5),
        account: "1000",
        amount: 5000000,
        currency: "SEK",
        description: "Investor deposit - Pension Fund AB",
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        clientId: client.id,
        source: "BANK",
        bookingDate: new Date(startOfMonth.getTime() + 86400000 * 10),
        account: "2000",
        amount: 2500000,
        currency: "SEK",
        description: "Management fees to custodian",
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        clientId: client.id,
        source: "BANK",
        bookingDate: new Date(startOfMonth.getTime() + 86400000 * 15),
        account: "1000",
        amount: 3000000,
        currency: "SEK",
        description: "Dividend income - Tech stocks",
      },
    }),
  ]);

  console.log(`✓ Created ${transactions.length} bank transactions`);

  // 3. Create an investor/KYC record
  const investor = await prisma.investor.upsert({
    where: { email: "investor@pensionfund.se" },
    update: {},
    create: {
      clientId: client.id,
      name: "Pension Fund Sweden AB",
      email: "investor@pensionfund.se",
      investmentAmount: 50000000,
      investmentDate: new Date(2024, 0, 15),
    },
  });

  const kycRecord = await prisma.kycRecord.upsert({
    where: { investorId: investor.id },
    update: {},
    create: {
      clientId: client.id,
      investorId: investor.id,
      status: "PENDING_REVIEW",
      riskLevel: "MEDIUM",
      pepStatus: "CLEAR",
      sanctionStatus: "CLEAR",
      uboVerified: true,
      documents: {
        identityVerified: true,
        addressVerified: true,
        beneficiaryVerified: true,
      },
    },
  });

  console.log(`✓ Created KYC record for investor: ${investor.name}`);

  // 4. Create tasks for different workflows
  const coordinator = await prisma.user.findFirst({
    where: { role: "COORDINATOR" },
  });

  const specialist = await prisma.user.findFirst({
    where: { role: "SPECIALIST" },
  });

  const tasks = await Promise.all([
    // Bank reconciliation task
    prisma.task.create({
      data: {
        clientId: client.id,
        kind: "BANK_RECON",
        status: "NEEDS_REVIEW",
        assigneeId: coordinator?.id,
        payload: {
          bankBalance: 125000000,
          ledgerBalance: 124950000,
          discrepancy: 50000,
          recentTransactions: transactions.length,
          period: "2024-10",
        },
        dueAt: new Date(Date.now() + 86400000 * 2),
      },
    }),
    // KYC review task
    prisma.task.create({
      data: {
        clientId: client.id,
        kind: "KYC_REVIEW",
        status: "QUEUED",
        assigneeId: coordinator?.id,
        payload: {
          investorId: investor.id,
          investorName: investor.name,
          riskLevel: "MEDIUM",
          requiresApproval: true,
        },
        dueAt: new Date(Date.now() + 86400000 * 3),
      },
    }),
    // Report draft task
    prisma.task.create({
      data: {
        clientId: client.id,
        kind: "REPORT_DRAFT",
        status: "QUEUED",
        assigneeId: specialist?.id,
        payload: {
          reportType: "FUND_ACCOUNTING",
          periodStart: "2024-10-01",
          periodEnd: "2024-10-31",
          templateId: "NAV_REPORT_V2",
        },
        dueAt: new Date(Date.now() + 86400000 * 5),
      },
    }),
  ]);

  console.log(`✓ Created ${tasks.length} tasks for demo workflow`);

  // 5. Create a sample report
  const report = await prisma.report.create({
    data: {
      clientId: client.id,
      type: "FUND_ACCOUNTING",
      periodStart: new Date(2024, 9, 1),
      periodEnd: new Date(2024, 9, 31),
      status: "DRAFT",
      draftText: `# Nordic Growth Fund - October 2024 Report

## Executive Summary
Fund NAV as of October 31, 2024: **SEK 125,000,000**

## Performance Metrics
- Return YTD: +8.2%
- Monthly Return: +1.5%
- Volatility: 12.3%

## Portfolio Holdings
### Equities (72%)
- Technology: 35%
- Healthcare: 20%
- Industrials: 17%

### Fixed Income (22%)
- Government Bonds: 15%
- Corporate Bonds: 7%

### Cash (6%)
- Liquidity Reserve

## Risk Assessment
Low to moderate risk profile maintained throughout the period.

## Compliance Notes
All regulatory requirements met. KYC documentation current for all investors.`,
      draftMetrics: {
        nav: 125000000,
        inflow: 5000000,
        outflow: 0,
        fees: 2500000,
        return_ytd: 8.2,
      },
    },
  });

  console.log(`✓ Created sample report`);

  console.log("\n✅ Demo scenario complete!");
  console.log("\nDemo Data Summary:");
  console.log(`- Client: ${client.name}`);
  console.log(`- Bank Transactions: ${transactions.length}`);
  console.log(`- Investor: ${investor.name}`);
  console.log(`- Tasks: ${tasks.length}`);
  console.log(`- Report: ${report.type}`);
  console.log("\n🎬 You can now see this data in the dashboards!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
