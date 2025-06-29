import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generarFolio(): Promise<string> {
  const count = await prisma.payment.count();
  const next = count + 1;
  return `PAGO-${String(next).padStart(3, '0')}`;
}

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { clientId, amount, paymentDate, applications } = req.body;
    const folio = await generarFolio();
    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        folio,
        clientId,
        amount,
        paymentDate: new Date(paymentDate),
        appliedTo: {
          create: applications.map((app: any) => ({
            invoiceId: app.invoiceId,
            amountApplied: app.amountApplied,
          })),
        },
      },
      include: { appliedTo: true },
    });
    // Actualizar balance del cliente
    await prisma.client.update({
      where: { id: clientId },
      data: { balance: { decrement: amount } },
    });
    // Actualizar status de las facturas
    for (const app of applications) {
      const invoice = await prisma.invoice.findUnique({ where: { id: app.invoiceId } });
      if (!invoice) continue;
      const totalPagado = await prisma.paymentApplication.aggregate({
        where: { invoiceId: app.invoiceId },
        _sum: { amountApplied: true },
      });
      const pagado = totalPagado._sum.amountApplied || 0;
      let status: any = 'UNPAID';
      if (pagado >= invoice.total) status = 'PAID';
      else if (pagado > 0) status = 'PARTIALLY_PAID';
      await prisma.invoice.update({ where: { id: app.invoiceId }, data: { status } });
    }
    res.status(201).json(payment);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({ include: { appliedTo: true }, orderBy: { createdAt: 'desc' } });
    res.json(payments);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { appliedTo: true } });
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(payment);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
