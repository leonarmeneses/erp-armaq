import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const salesByClient = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await prisma.invoice.groupBy({
      by: ['clientId'],
      where: {
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
      },
      _sum: { total: true },
      _count: { id: true },
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const topSellingProducts = async (req: Request, res: Response) => {
  try {
    const result = await prisma.invoiceItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true },
      orderBy: [{ _sum: { quantity: 'desc' } }],
      take: 10,
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const accountsReceivable = async (req: Request, res: Response) => {
  try {
    const result = await prisma.invoice.findMany({
      where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      include: { client: true },
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const kardex = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: 'productId requerido' });
    const result = await prisma.stockMovement.findMany({
      where: { productId: String(productId) },
      orderBy: { createdAt: 'asc' },
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    res.json({
      endpoints: [
        '/api/reports/sales-by-client',
        '/api/reports/top-selling-products',
        '/api/reports/accounts-receivable',
        '/api/reports/kardex'
      ],
      message: 'Consulta los endpoints específicos para reportes detallados.'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
