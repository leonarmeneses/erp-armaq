// Script para poblar la base de datos con datos genéricos usando Prisma Client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Crear clientes
  const cliente1 = await prisma.client.create({
    data: {
      code: 'CLI-1',
      name: 'Cliente Genérico 1',
      rfc: 'GENC010101AAA',
      email: 'cliente1@demo.com',
      phone: '5551234567',
      calle: 'Calle 1',
      numExterior: '100',
      colonia: 'Centro',
      municipio: 'CDMX',
      ciudad: 'CDMX',
      estado: 'CDMX',
      pais: 'México',
      codigoPostal: '01000',
      creditLimit: 10000,
      creditDays: 30,
      regimenFiscal: '601',
      usoCfdi: 'G03',
    }
  });

  // Crear proveedores
  const proveedor1 = await prisma.provider.create({
    data: {
      code: 'PRO-1',
      name: 'Proveedor Genérico 1',
      rfc: 'GENP010101AAA',
      email: 'proveedor1@demo.com',
      phone: '5559876543',
      calle: 'Calle Proveedor',
      numExterior: '200',
      colonia: 'Industrial',
      municipio: 'CDMX',
      ciudad: 'CDMX',
      estado: 'CDMX',
      pais: 'México',
      codigoPostal: '02000',
      regimenFiscal: '601',
      usoCfdi: 'G03',
    }
  });

  // Crear productos
  const producto1 = await prisma.product.create({
    data: {
      code: 'PROD-1',
      name: 'Producto Genérico 1',
      description: 'Producto de prueba',
      type: 'PRODUCT',
      cost: 100,
      price: 150,
      taxRate: 0.16,
      stock: 50,
      unit: 'pieza',
    }
  });
  const producto2 = await prisma.product.create({
    data: {
      code: 'PROD-2',
      name: 'Producto Genérico 2',
      description: 'Otro producto de prueba',
      type: 'PRODUCT',
      cost: 200,
      price: 300,
      taxRate: 0.16,
      stock: 30,
      unit: 'caja',
    }
  });

  // Crear cotización
  const quote1 = await prisma.quote.create({
    data: {
      folio: 'COT-1',
      clientId: cliente1.id,
      total: 150 * 2 + 300 * 1,
      status: 'PENDING',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: JSON.stringify([
        { productId: producto1.id, cantidad: 2, precio: 150 },
        { productId: producto2.id, cantidad: 1, precio: 300 }
      ]),
      notas: 'Cotización de ejemplo',
      usuario: 'admin',
    }
  });

  // Crear orden de venta
  const saleOrder1 = await prisma.saleOrder.create({
    data: {
      folio: 'ORD-1',
      clientId: cliente1.id,
      total: 600,
      status: 'PENDING_SURTIDO',
      items: JSON.stringify([
        { productId: producto1.id, cantidad: 2, precio: 150 },
        { productId: producto2.id, cantidad: 1, precio: 300 }
      ]),
      quoteId: quote1.id,
    }
  });

  // Crear factura
  const invoice1 = await prisma.invoice.create({
    data: {
      folio: 'FAC-1',
      clientId: cliente1.id,
      subtotal: 600,
      tax: 96,
      total: 696,
      status: 'UNPAID',
      paymentMethod: 'PUE',
      saleOrderId: saleOrder1.id,
    }
  });

  // Crear movimientos de inventario
  await prisma.stockMovement.create({
    data: {
      folio: 'MVO-1',
      productId: producto1.id,
      type: 'IN',
      quantity: 10,
      reason: 'Compra inicial',
      cost: 100,
      createdBy: 'admin',
    }
  });
  await prisma.stockMovement.create({
    data: {
      folio: 'MVO-2',
      productId: producto2.id,
      type: 'IN',
      quantity: 5,
      reason: 'Compra inicial',
      cost: 200,
      createdBy: 'admin',
    }
  });

  // Crear usuario admin
  await prisma.user.create({
    data: {
      name: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      sucursal: 'CDMX',
      email: 'admin@demo.com',
      phone: '5550000000',
    }
  });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
