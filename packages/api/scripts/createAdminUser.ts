import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { id: 'admin' }, // Usar id como campo único
    update: {},
    create: {
      id: 'admin', // Usar id como identificador único
      name: 'admin',
      role: 'admin',
      password,
    },
  });
  console.log('Usuario admin creado:', admin);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
