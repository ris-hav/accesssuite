import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MODULES = [
  { key: 'dashboard', name: 'Dashboard' },
  { key: 'reports', name: 'Reports' },
  { key: 'settings', name: 'Settings' },
];

async function main() {
  const modules = await Promise.all(
    MODULES.map((m) =>
      prisma.moduleCatalog.upsert({
        where: { key: m.key },
        update: {},
        create: m,
      }),
    ),
  );

  await prisma.user.upsert({
    where: { email: 'superadmin@accesssuite.dev' },
    update: {},
    create: {
      email: 'superadmin@accesssuite.dev',
      passwordHash: await bcrypt.hash('SuperAdmin123!', 10),
      isSuperAdmin: true,
      role: 'ADMIN',
    },
  });

  const demoClient = await prisma.client.upsert({
    where: { id: 'demo-client' },
    update: {},
    create: { id: 'demo-client', name: 'Demo Client Inc.' },
  });

  await prisma.subscription.upsert({
    where: { clientId: demoClient.id },
    update: {},
    create: {
      clientId: demoClient.id,
      status: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@demo.accesssuite.dev' },
    update: {},
    create: {
      email: 'admin@demo.accesssuite.dev',
      passwordHash: await bcrypt.hash('DemoAdmin123!', 10),
      role: 'ADMIN',
      clientId: demoClient.id,
    },
  });

  // A non-admin user on the same client, so role-restricted routes have
  // someone to correctly reject.
  await prisma.user.upsert({
    where: { email: 'viewer@demo.accesssuite.dev' },
    update: {},
    create: {
      email: 'viewer@demo.accesssuite.dev',
      passwordHash: await bcrypt.hash('DemoViewer123!', 10),
      role: 'VIEWER',
      clientId: demoClient.id,
    },
  });

  // A MANAGER-role user too, so role-restricted routes have a middle case
  // to test, not just ADMIN vs VIEWER.
  await prisma.user.upsert({
    where: { email: 'manager@demo.accesssuite.dev' },
    update: {},
    create: {
      email: 'manager@demo.accesssuite.dev',
      passwordHash: await bcrypt.hash('DemoManager123!', 10),
      role: 'MANAGER',
      clientId: demoClient.id,
    },
  });

  await Promise.all(
    modules.map((m) =>
      prisma.clientModuleAccess.upsert({
        where: { clientId_moduleId: { clientId: demoClient.id, moduleId: m.id } },
        update: { enabled: true },
        create: { clientId: demoClient.id, moduleId: m.id, enabled: true },
      }),
    ),
  );

  console.log('Seed complete:');
  console.log('  Super-admin: superadmin@accesssuite.dev / SuperAdmin123!');
  console.log('  Demo admin:  admin@demo.accesssuite.dev / DemoAdmin123!');
  console.log('  Demo manager: manager@demo.accesssuite.dev / DemoManager123!');
  console.log('  Demo viewer: viewer@demo.accesssuite.dev / DemoViewer123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
