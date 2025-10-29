import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: "admin@aifm.com",
      name: "Admin",
      role: "ADMIN",
      password: "Password1!",
    },
    {
      email: "coordinator@aifm.com",
      name: "Coordinator",
      role: "COORDINATOR",
      password: "Password1!",
    },
    {
      email: "specialist@aifm.com",
      name: "Specialist",
      role: "SPECIALIST",
      password: "Password1!",
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { password: hashedPassword },
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role as any,
        password: hashedPassword,
      },
    });
    console.log(`✓ User created/updated: ${user.email}`);
  }

  console.log("✓ All users created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
