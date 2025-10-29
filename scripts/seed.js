const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
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

    console.log('✅ Cleared existing data');

    // CREATE CLIENTS
    const client1 = await prisma.client.create({
      data: {
        name: 'Nordic Tech Fund',
        orgNo: '556000-0001',
        tier: 'XL',
        createdAt: new Date('2024-01-15'),
      },
    });

    const client2 = await prisma.client.create({
      data: {
        name: 'Scandinavia Investment Partners',
        orgNo: '556000-0002',
        tier: 'LARGE',
        createdAt: new Date('2024-02-20'),
      },
    });

    console.log('✅ Created 2 demo clients');

    // CREATE SUBSCRIPTIONS
    await prisma.subscription.createMany({
      data: [
        { clientId: client1.id, plan: 'COORDINATOR', active: true, sla: 'T+3' },
        { clientId: client1.id, plan: 'SPECIALIST', active: true, sla: 'T+3' },
        { clientId: client2.id, plan: 'AGENT_PORTAL', active: true, sla: 'T+5' },
      ],
    });

    console.log('✅ Created subscriptions');

    // CREATE USERS
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@aifm.se',
        name: 'Admin User',
        role: 'ADMIN',
        clerkUserId: 'clerk_admin_001',
      },
    });

    const coordinatorUser = await prisma.user.create({
      data: {
        email: 'coordinator@aifm.se',
        name: 'Coordinator User',
        role: 'COORDINATOR',
        clerkUserId: 'clerk_coordinator_001',
      },
    });

    const specialistUser = await prisma.user.create({
      data: {
        email: 'specialist@aifm.se',
        name: 'Specialist User',
        role: 'SPECIALIST',
        clerkUserId: 'clerk_specialist_001',
      },
    });

    const clientUser = await prisma.user.create({
      data: {
        email: 'client@nordictechfund.se',
        name: 'Client User',
        role: 'CLIENT',
        clientId: client1.id,
        clerkUserId: 'clerk_client_001',
      },
    });

    console.log('✅ Created 4 users');

    // CREATE TASKS
    const task1 = await prisma.task.create({
      data: {
        clientId: client1.id,
        kind: 'BANK_RECON',
        status: 'NEEDS_REVIEW',
        assigneeId: specialistUser.id,
        payload: {
          period: 'Q4 2024',
          expectedBalance: 125000000,
          discrepancy: 50000,
        },
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    const task2 = await prisma.task.create({
      data: {
        clientId: client1.id,
        kind: 'KYC_REVIEW',
        status: 'IN_PROGRESS',
        assigneeId: coordinatorUser.id,
        payload: { investorId: 'inv-001', documentSet: 'KYC_2024_Q1' },
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    const task3 = await prisma.task.create({
      data: {
        clientId: client1.id,
        kind: 'REPORT_DRAFT',
        status: 'QUEUED',
        payload: {
          reportType: 'FUND_ACCOUNTING',
          periodStart: '2024-10-01',
          periodEnd: '2024-12-31',
        },
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Created 3 demo tasks');

    // CREATE REPORTS
    const report1 = await prisma.report.create({
      data: {
        clientId: client1.id,
        type: 'FUND_ACCOUNTING',
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'DRAFT',
        draftText: '# Nordic Tech Fund - Q4 2024\n\n**NAV:** SEK 125,000,000\n**Performance:** +12.5%',
        draftMetrics: {
          nav: 125000000,
          performancePercent: 12.5,
          holdingCount: 4,
        },
      },
    });

    const report2 = await prisma.report.create({
      data: {
        clientId: client2.id,
        type: 'INVESTOR_REPORT',
        periodStart: new Date('2024-10-01'),
        periodEnd: new Date('2024-12-31'),
        status: 'QC',
        finalText: '# Scandinavia Partners - Q4 2024\n\n**NAV:** EUR 75,000,000\n**Return:** +8.2%',
      },
    });

    console.log('✅ Created 2 demo reports');

    // CREATE INVESTORS
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

    console.log('✅ Created 2 demo investors');

    // CREATE KYC RECORDS
    await prisma.kycRecord.createMany({
      data: [
        {
          clientId: client1.id,
          investorId: investor1.id,
          status: 'APPROVED',
          riskLevel: 'low',
          pepStatus: 'clear',
          sanctionStatus: 'clear',
        },
        {
          clientId: client1.id,
          investorId: investor2.id,
          status: 'IN_REVIEW',
          riskLevel: 'medium',
          pepStatus: 'clear',
          sanctionStatus: 'pending',
        },
      ],
    });

    console.log('✅ Created KYC records');

    console.log('\n🌱 Seed completed successfully!');
    console.log('\n📊 Demo Data Loaded:');
    console.log('- Clients: 2');
    console.log('- Users: 4 (Admin, Coordinator, Specialist, Client)');
    console.log('- Tasks: 3 (Bank Reconciliation, KYC Review, Report Draft)');
    console.log('- Reports: 2');
    console.log('- Investors: 2');
    console.log('- KYC Records: 2');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
