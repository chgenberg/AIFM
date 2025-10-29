const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating demo users...');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('Password1!', 10);

    const demoUsers = [
      { email: 'admin@aifm.com', name: 'Admin User', role: 'ADMIN' },
      { email: 'coordinator@aifm.com', name: 'Coordinator User', role: 'COORDINATOR' },
      { email: 'specialist@aifm.com', name: 'Specialist User', role: 'SPECIALIST' },
    ];

    for (const user of demoUsers) {
      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existing) {
        // Update password
        await prisma.user.update({
          where: { email: user.email },
          data: { password: hashedPassword }
        });
        console.log(`✅ Updated ${user.email} (${user.role})`);
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role,
            emailVerified: new Date(),
          },
        });
        console.log(`✅ Created ${user.email} (${user.role})`);
      }
    }

    console.log('\n🎉 Demo users ready!');
    console.log('\n📝 Login Credentials:');
    console.log('───────────────────────────────────────');
    console.log('Admin:        admin@aifm.com / Password1!');
    console.log('Coordinator:  coordinator@aifm.com / Password1!');
    console.log('Specialist:   specialist@aifm.com / Password1!');
    console.log('───────────────────────────────────────');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
