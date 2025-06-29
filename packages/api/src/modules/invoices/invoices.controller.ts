import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import PDFKit or puppeteer for PDF generation (placeholder)

const prisma = new PrismaClient();

function calcularTotales(items: any[]): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const tax = items.reduce((acc, item) => acc + ((item.subtotal || 0) * 0.16), 0); // IVA 16%
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

async function generarFolio(): Promise<string> {
  const count = await prisma.invoice.count();
  const next = count + 1;
  return `F-${String(next).padStart(3, '0')}`;
}

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || [];
    const { subtotal, tax, total } = calcularTotales(items);
    const folio = await generarFolio();
    // Simular UUID
    const uuid = `UUID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    // Crear factura
    const invoice = await prisma.invoice.create({
      data: {
        folio,
        uuid,
        clientId: req.body.clientId,
        subtotal,
        tax,
        total,
        status: 'UNPAID',
        paymentMethod: req.body.paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
        saleOrderId: req.body.saleOrderId,
      },
      include: { items: true },
    });
    // Afectar inventario
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    // Afectar cuentas por cobrar
    await prisma.client.update({
      where: { id: req.body.clientId },
      data: { balance: { increment: total } },
    });
    res.status(201).json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const generateInvoicePDF = async (req: Request, res: Response) => {
  // Aquí iría la lógica para generar el PDF (puedes usar pdfkit o puppeteer)
  res.status(501).json({ message: 'Generación de PDF no implementada (simulación).' });
};
