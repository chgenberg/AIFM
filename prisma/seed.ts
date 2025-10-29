import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test client
  const client = await prisma.client.upsert({
    where: { orgNo: '5591234567' },
    update: {},
    create: {
      name: 'Test Fund AB',
      orgNo: '5591234567',
      tier: 'XL',
      subscriptions: {
        create: {
          plan: 'PREMIUM',
          seats: 10,
        },
      },
    },
  });

  console.log(`✅ Created client: ${client.name}`);

  // Create test users
  const coordinator = await prisma.user.upsert({
    where: { clerkId: 'user_coordinator_test' },
    update: {},
    create: {
      clerkId: 'user_coordinator_test',
      email: 'coordinator@test.local',
      role: 'COORDINATOR',
    },
  });

  const specialist = await prisma.user.upsert({
    where: { clerkId: 'user_specialist_test' },
    update: {},
    create: {
      clerkId: 'user_specialist_test',
      email: 'specialist@test.local',
      role: 'SPECIALIST',
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { clerkId: 'user_client_test' },
    update: {},
    create: {
      clerkId: 'user_client_test',
      email: 'client@test.local',
      role: 'CLIENT',
    },
  });

  console.log(`✅ Created users: Coordinator, Specialist, Client`);

  // Create data feeds
  const fortnoxFeed = await prisma.dataFeed.upsert({
    where: {
      clientId_source: {
        clientId: client.id,
        source: 'FORTNOX',
      },
    },
    update: {},
    create: {
      clientId: client.id,
      source: 'FORTNOX',
      status: 'ACTIVE',
      configJson: {
        apiKey: 'demo_key',
        syncInterval: 3600,
      },
    },
  });

  const bankFeed = await prisma.dataFeed.upsert({
    where: {
      clientId_source: {
        clientId: client.id,
        source: 'BANK',
      },
    },
    update: {},
    create: {
      clientId: client.id,
      source: 'BANK',
      status: 'ACTIVE',
      configJson: {
        bankId: 'demo_bank',
        accountId: 'demo_account',
      },
    },
  });

  console.log(`✅ Created data feeds`);

  // Create test ledger entries
  const ledgerEntry = await prisma.ledgerEntry.create({
    data: {
      clientId: client.id,
      account: '1910',
      amount: 100000,
      currency: 'SEK',
      description: 'Opening balance',
      bookingDate: new Date('2025-01-01'),
      transactionDate: new Date('2025-01-01'),
      source: 'MANUAL',
    },
  });

  console.log(`✅ Created ledger entries`);

  // Create test tasks
  const task = await prisma.task.create({
    data: {
      clientId: client.id,
      kind: 'QC_CHECK',
      status: 'PENDING',
      payload: {
        errorCount: 2,
        warningCount: 1,
      },
      assigneeId: coordinator.id,
    },
  });

  console.log(`✅ Created test task`);

  // Create test report
  const report = await prisma.report.create({
    data: {
      clientId: client.id,
      type: 'INVESTOR_LETTER',
      status: 'DRAFT',
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      draftText: 'Test report draft...',
      draftMetrics: {
        nav: 1234567,
        navChange: 5.2,
        ytdReturn: 8.5,
      },
    },
  });

  console.log(`✅ Created test report`);

  // Create audit log
  await prisma.auditLog.create({
    data: {
      actorId: coordinator.id,
      action: 'CREATE',
      refType: 'Report',
      refId: report.id,
      diffJson: { type: 'INVESTOR_LETTER', status: 'DRAFT' },
    },
  });

  console.log(`✅ Created audit log`);

  console.log('\n✨ Database seed completed!');
  console.log('\n📊 Test data summary:');
  console.log(`  - Client: ${client.name} (${client.orgNo})`);
  console.log(`  - Users: Coordinator, Specialist, Client`);
  console.log(`  - Data feeds: Fortnox, Bank`);
  console.log(`  - Ledger entries: 1`);
  console.log(`  - Tasks: 1 QC_CHECK`);
  console.log(`  - Reports: 1 INVESTOR_LETTER`);
  console.log('\n🚀 Ready for local testing!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
