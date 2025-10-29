import { PrismaClient, ClientTier, Plan, Role, DataSource, FeedStatus, TaskKind, TaskStatus, ReportType, ReportStatus, KYCStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.signOff.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.reportVersion.deleteMany();
  await prisma.report.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.kycRecord.deleteMany();
  await prisma.riskProfile.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.dataFeed.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.client.deleteMany();

  // ============================================================================
  // CREATE CLIENTS
  // ============================================================================

  const client1 = await prisma.client.create({
    data: {
      name: 'Nordic Tech Fund',
      orgNo: '556000-0001',
      tier: ClientTier.XL,
      createdAt: new Date('2024-01-15'),
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Scandinavia Investment Partners',
      orgNo: '556000-0002',
      tier: ClientTier.LARGE,
      createdAt: new Date('2024-02-20'),
    },
  });

  console.log('✅ Created 2 demo clients');

  // ============================================================================
  // CREATE SUBSCRIPTIONS
  // ============================================================================

  await prisma.subscription.createMany({
    data: [
      {
        clientId: client1.id,
        plan: Plan.COORDINATOR,
        active: true,
        sla: 'T+3',
      },
      {
        clientId: client1.id,
        plan: Plan.SPECIALIST,
        active: true,
        sla: 'T+3',
      },
      {
        clientId: client2.id,
        plan: Plan.AGENT_PORTAL,
        active: true,
        sla: 'T+5',
      },
    ],
  });

  console.log('✅ Created subscriptions');

  // ============================================================================
  // CREATE CONTACTS
  // ============================================================================

  await prisma.contact.createMany({
    data: [
      {
        clientId: client1.id,
        email: 'anna.svensson@nordictechfund.se',
        name: 'Anna Svensson',
        role: 'CFO',
        phone: '+46701234567',
      },
      {
        clientId: client1.id,
        email: 'carl.johansson@nordictechfund.se',
        name: 'Carl Johansson',
        role: 'COO',
        phone: '+46702345678',
      },
      {
        clientId: client2.id,
        email: 'eva.larsson@scandinavia-ip.se',
        name: 'Eva Larsson',
        role: 'CFO',
        phone: '+46703456789',
      },
    ],
  });

  console.log('✅ Created contacts');

  // ============================================================================
  // CREATE USERS
  // ============================================================================

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aifm.se',
      name: 'Admin User',
      role: Role.ADMIN,
      clerkUserId: 'clerk_admin_001',
    },
  });

  const coordinatorUser = await prisma.user.create({
    data: {
      email: 'coordinator@aifm.se',
      name: 'Coordinator User',
      role: Role.COORDINATOR,
      clerkUserId: 'clerk_coordinator_001',
    },
  });

  const specialistUser = await prisma.user.create({
    data: {
      email: 'specialist@aifm.se',
      name: 'Specialist User',
      role: Role.SPECIALIST,
      clerkUserId: 'clerk_specialist_001',
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@nordictechfund.se',
      name: 'Client User',
      role: Role.CLIENT,
      clientId: client1.id,
      clerkUserId: 'clerk_client_001',
    },
  });

  console.log('✅ Created users');

  // ============================================================================
  // CREATE DATA FEEDS
  // ============================================================================

  await prisma.dataFeed.createMany({
    data: [
      {
        clientId: client1.id,
        source: DataSource.FORTNOX,
        status: FeedStatus.ACTIVE,
        lastSyncAt: new Date(),
        configJson: {
          apiKey: 'demo-fortnox-key-xxxx',
          environment: 'production',
        },
      },
      {
        clientId: client1.id,
        source: DataSource.BANK,
        status: FeedStatus.ACTIVE,
        lastSyncAt: new Date(),
        configJson: {
          provider: 'nordigen',
          bankId: 'SWEDENBANKEN',
        },
      },
      {
        clientId: client2.id,
        source: DataSource.FORTNOX,
        status: FeedStatus.ACTIVE,
        configJson: {
          apiKey: 'demo-fortnox-key-yyyy',
        },
      },
    ],
  });

  console.log('✅ Created data feeds');

  // ============================================================================
  // CREATE BANK ACCOUNTS
  // ============================================================================

  const bankAccount1 = await prisma.bankAccount.create({
    data: {
      clientId: client1.id,
      iban: 'SE8960000000000000000001',
      currency: 'SEK',
      balance: 125000000, // 125M SEK
      syncedAt: new Date(),
    },
  });

  const bankAccount2 = await prisma.bankAccount.create({
    data: {
      clientId: client2.id,
      iban: 'SE8960000000000000000002',
      currency: 'EUR',
      balance: 75000000, // 75M EUR
      syncedAt: new Date(),
    },
  });

  console.log('✅ Created bank accounts');

  // ============================================================================
  // CREATE LEDGER ENTRIES
  // ============================================================================

  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  await prisma.ledgerEntry.createMany({
    data: [
      {
        clientId: client1.id,
        source: DataSource.FORTNOX,
        bookingDate: new Date(lastMonth),
        account: '1910',
        amount: 50000000,
        currency: 'SEK',
        description: 'Fund capital inflow',
        meta: { type: 'CAPITAL_CALL', investorCount: 12 },
      },
      {
        clientId: client1.id,
        source: DataSource.FORTNOX,
        bookingDate: new Date(lastMonth),
        account: '2910',
        amount: 5000000,
        currency: 'SEK',
        description: 'Management fees',
        meta: { type: 'ANNUAL_FEE', rate: 0.02 },
      },
      {
        clientId: client1.id,
        source: DataSource.BANK,
        bookingDate: new Date(lastMonth),
        account: '1910',
        amount: 1200000,
        currency: 'SEK',
        description: 'Dividend received',
        meta: { type: 'DIVIDEND', source: 'Portfolio companies' },
      },
    ],
  });

  console.log('✅ Created ledger entries');

  // ============================================================================
  // CREATE TASKS
  // ============================================================================

  const task1 = await prisma.task.create({
    data: {
      clientId: client1.id,
      kind: TaskKind.BANK_RECON,
      status: TaskStatus.NEEDS_REVIEW,
      assigneeId: specialistUser.id,
      payload: {
        period: 'Q4 2024',
        bankStatementUrl: 's3://bucket/bank-statement-2024-q4.pdf',
        expectedBalance: 125000000,
        discrepancy: 50000,
      },
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
  });

  const task2 = await prisma.task.create({
    data: {
      clientId: client1.id,
      kind: TaskKind.KYC_REVIEW,
      status: TaskStatus.IN_PROGRESS,
      assigneeId: coordinatorUser.id,
      payload: {
        investorId: 'inv-001',
        documentSet: 'KYC_2024_Q1',
      },
      dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    },
  });

  const task3 = await prisma.task.create({
    data: {
      clientId: client1.id,
      kind: TaskKind.REPORT_DRAFT,
      status: TaskStatus.QUEUED,
      payload: {
        reportType: ReportType.FUND_ACCOUNTING,
        periodStart: '2024-10-01',
        periodEnd: '2024-12-31',
      },
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log('✅ Created tasks');

  // ============================================================================
  // CREATE FLAGS
  // ============================================================================

  await prisma.flag.createMany({
    data: [
      {
        taskId: task1.id,
        severity: 'warning',
        message: 'Bank balance discrepancy detected',
        code: 'BANK_MISMATCH',
        context: {
          expectedBalance: 125000000,
          actualBalance: 124950000,
          discrepancy: 50000,
        },
      },
      {
        taskId: task2.id,
        severity: 'info',
        message: 'KYC documents pending verification',
        code: 'KYC_PENDING',
        context: { documentsCount: 3, verifiedCount: 1 },
      },
    ],
  });

  console.log('✅ Created flags');

  // ============================================================================
  // CREATE REPORTS
  // ============================================================================

  const report1 = await prisma.report.create({
    data: {
      clientId: client1.id,
      type: ReportType.FUND_ACCOUNTING,
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-12-31'),
      status: ReportStatus.DRAFT,
      draftText: `
# Nordic Tech Fund - Q4 2024 Report

## Summary
- NAV: SEK 125,000,000
- Inflows: SEK 50,000,000
- Management Fees: SEK 5,000,000
- Performance: +12.5%

## Holdings
1. Tech Company A - 35%
2. Tech Company B - 28%
3. Tech Company C - 22%
4. Cash - 15%

## Risk Assessment
Overall risk profile: Medium
Concentration: Moderate
Liquidity: Good
      `,
      draftMetrics: {
        nav: 125000000,
        inflow: 50000000,
        performancePercent: 12.5,
        holdingCount: 4,
      },
    },
  });

  const report2 = await prisma.report.create({
    data: {
      clientId: client2.id,
      type: ReportType.INVESTOR_REPORT,
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-12-31'),
      status: ReportStatus.QC,
      finalText: `
# Scandinavia Investment Partners - Q4 2024 Investor Report

## Performance Summary
- NAV: EUR 75,000,000
- Return: +8.2%
- Dividend: EUR 1,200,000

## Portfolio Performance
Outperformed benchmark by 2.1%

## Risk Metrics
Value at Risk (95%): EUR 2,100,000
      `,
    },
  });

  console.log('✅ Created reports');

  // ============================================================================
  // CREATE INVESTORS
  // ============================================================================

  const investor1 = await prisma.investor.create({
    data: {
      clientId: client1.id,
      name: 'Pension Fund Sweden',
      email: 'contact@pensionsweden.se',
      ubo: 'Swedish State Pension Agency',
    },
  });

  const investor2 = await prisma.investor.create({
    data: {
      clientId: client1.id,
      name: 'European Insurance Corp',
      email: 'inv@eurinsurance.eu',
      ubo: 'Insurance Company Holdings',
    },
  });

  console.log('✅ Created investors');

  // ============================================================================
  // CREATE KYC RECORDS
  // ============================================================================

  await prisma.kycRecord.createMany({
    data: [
      {
        clientId: client1.id,
        investorId: investor1.id,
        status: KYCStatus.APPROVED,
        riskLevel: 'low',
        pepStatus: 'clear',
        sanctionStatus: 'clear',
        uboTree: {
          owners: [
            { name: 'Swedish State', ownership: 100 },
          ],
        },
      },
      {
        clientId: client1.id,
        investorId: investor2.id,
        status: KYCStatus.IN_REVIEW,
        riskLevel: 'medium',
        pepStatus: 'clear',
        sanctionStatus: 'pending',
        uboTree: {
          owners: [
            { name: 'Insurance Company Holding', ownership: 100 },
          ],
        },
      },
    ],
  });

  console.log('✅ Created KYC records');

  // ============================================================================
  // CREATE RISK PROFILES
  // ============================================================================

  await prisma.riskProfile.createMany({
    data: [
      {
        clientId: client1.id,
        period: new Date('2024-10-01'),
        var95: 6250000, // 5% of NAV
        concentration: {
          top5: [
            { company: 'Tech A', percentage: 35 },
            { company: 'Tech B', percentage: 28 },
            { company: 'Tech C', percentage: 22 },
          ],
        },
        limitBreaches: {
          concentrationLimit: false,
          leverageLimit: false,
          liquidityLimit: false,
        },
        stressTest: {
          marketDown10Percent: -12500000,
          marketDown20Percent: -25000000,
        },
      },
      {
        clientId: client2.id,
        period: new Date('2024-10-01'),
        var95: 2250000,
        concentration: {
          top5: [
            { company: 'EU Holdings', percentage: 45 },
            { company: 'Bonds', percentage: 30 },
          ],
        },
      },
    ],
  });

  console.log('✅ Created risk profiles');

  // ============================================================================
  // CREATE SIGN-OFFS
  // ============================================================================

  await prisma.signOff.create({
    data: {
      reportId: report1.id,
      userId: specialistUser.id,
      role: Role.SPECIALIST,
      timestamp: new Date(),
    },
  });

  console.log('✅ Created sign-offs');

  console.log('🌱 Seed completed successfully!');
  console.log('\n📊 Demo Data Summary:');
  console.log('- Clients: 2');
  console.log('- Users: 4');
  console.log('- Tasks: 3');
  console.log('- Reports: 2');
  console.log('- Investors: 2');
  console.log('- KYC Records: 2');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
