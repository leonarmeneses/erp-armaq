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
    // Generar folio consecutivo
    const last = await prisma.stockMovement.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { folio: true },
    });
    let nextFolio = 'MVO-1';
    if (last && last.folio) {
      const num = parseInt(last.folio.replace('MVO-', ''));
      nextFolio = `MVO-${isNaN(num) ? 1 : num + 1}`;
    }
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        quantity,
        reason,
        cost,
        type: 'ADJUSTMENT',
        createdBy,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        folio: nextFolio,
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

export const createMovement = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, reason, cost, createdBy, createdAt, type } = req.body;
    // Validar tipo
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }
    // Generar folio consecutivo robusto basado en el mayor número existente
    let nextFolio = '';
    let movement;
    let intentos = 0;
    while (intentos < 5) {
      // Buscar el mayor número de folio existente
      const allFolios = await prisma.stockMovement.findMany({
        select: { folio: true },
      });
      let maxNum = 0;
      for (const f of allFolios) {
        if (f.folio && /^MVO-\d+$/.test(f.folio)) {
          const num = parseInt(f.folio.replace('MVO-', ''));
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
      nextFolio = `MVO-${maxNum + 1}`;
      try {
        movement = await prisma.stockMovement.create({
          data: {
            productId,
            quantity,
            reason,
            cost: typeof cost === 'number' ? cost : 0,
            type,
            createdBy,
            createdAt: createdAt ? new Date(createdAt) : undefined,
            folio: nextFolio,
          },
        });
        break; // Éxito
      } catch (e: any) {
        if (e.code === 'P2002' && e.meta?.target?.includes('folio')) {
          // Folio duplicado, reintentar
          intentos++;
          continue;
        } else {
          throw e;
        }
      }
    }
    if (!movement) throw new Error('No se pudo generar un folio único para el movimiento');
    // Log para depuración
    console.log('Actualizando stock:', { type, quantity, increment: type === 'OUT' ? -quantity : quantity });
    // Actualizar stock del producto
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: type === 'OUT' ? -quantity : quantity } },
    });
    res.status(201).json(movement);
  } catch (error) {
    const err = error as Error;
    if (!res.headersSent) {
      res.status(400).json({ error: err.message || 'Error inesperado' });
    }
  }
};
