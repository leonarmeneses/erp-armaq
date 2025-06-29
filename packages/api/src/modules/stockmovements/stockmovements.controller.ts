import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    const where = productId ? { productId: String(productId) } : {};
    const movements = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
    res.json(movements);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createAdjustment = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, reason, cost, createdBy, createdAt } = req.body;
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        quantity,
        reason,
        cost,
        type: 'ADJUSTMENT',
        createdBy,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });
    // Actualizar stock del producto
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
    res.status(201).json(movement);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
