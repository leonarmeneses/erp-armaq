import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  const existing = await prisma.user.findFirst({ where: { name: 'vendedor' } });
  if (existing) {
    console.log('El usuario vendedor ya existe:', existing);
    await prisma.$disconnect();
    return;
  }
  const password = await bcrypt.hash('vendedor123', 10);
  const seller = await prisma.user.create({
    data: {
      name: 'vendedor',
      role: 'seller',
      password,
    },
  });
  console.log('Usuario vendedor creado:', seller);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
