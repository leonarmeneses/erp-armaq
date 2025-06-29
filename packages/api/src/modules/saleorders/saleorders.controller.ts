import { Request, Response } from 'express';
import { PrismaClient, SaleOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

function calcularTotal(items: any[]): number {
  return items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
}

async function generarFolio(): Promise<string> {
  const count = await prisma.saleOrder.count();
  const next = count + 1;
  return `OV-${next}`;
}

async function apartarInventario(items: any[]) {
  for (const item of items) {
    if (item.productId && item.quantity) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }
}

export const createSaleOrder = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || [];
    const total = calcularTotal(items);
    const folio = await generarFolio();
    // Apartar inventario
    await apartarInventario(items);
    const saleOrder = await prisma.saleOrder.create({
      data: {
        folio,
        clientId: req.body.clientId,
        quoteId: req.body.quoteId,
        total,
        status: SaleOrderStatus.PENDING_SURTIDO,
        items,
      },
    });
    // Cambiar estado de la cotización a VENDIDO si quoteId existe
    if (req.body.quoteId) {
      await prisma.quote.update({
        where: { id: req.body.quoteId },
        data: { status: 'VENDIDO' },
      });
    }
    res.status(201).json(saleOrder);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getSaleOrders = async (req: Request, res: Response) => {
  try {
    const saleOrders = await prisma.saleOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { invoices: true },
    });
    res.json(saleOrders);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getSaleOrderById = async (req: Request, res: Response) => {
  try {
    const saleOrder = await prisma.saleOrder.findUnique({ where: { id: req.params.id } });
    if (!saleOrder) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(saleOrder);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateSaleOrder = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || [];
    const total = calcularTotal(items);
    const saleOrder = await prisma.saleOrder.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        total,
        items,
      },
    });
    res.json(saleOrder);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteSaleOrder = async (req: Request, res: Response) => {
  try {
    await prisma.saleOrder.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
