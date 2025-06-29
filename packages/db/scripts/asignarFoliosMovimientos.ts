import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const movimientos = await prisma.stockMovement.findMany({ orderBy: { createdAt: 'asc' } });
  for (let i = 0; i < movimientos.length; i++) {
    const folio = `MVO-${i + 1}`;
    await prisma.stockMovement.update({
      where: { id: movimientos[i].id },
      data: { folio },
    });
    console.log(`Asignado folio ${folio} a movimiento ${movimientos[i].id}`);
  }
  console.log('Folios asignados correctamente.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
