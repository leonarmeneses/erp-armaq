import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    // Ya no hay filtro por productId
    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(movements);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createAdjustment = async (req: Request, res: Response) => {
  try {
    const { productos, reason, cost, createdBy, createdAt } = req.body;
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
        productos,
        reason,
        cost,
        type: 'ADJUSTMENT',
        createdBy,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        folio: nextFolio,
      },
    });
    // Actualizar stock de todos los productos
    if (Array.isArray(productos)) {
      for (const item of productos) {
        if (!item.productId || !item.quantity) continue;
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    res.status(201).json(movement);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const createMovement = async (req: Request, res: Response) => {
  try {
    const { productos, reason, cost, createdBy, createdAt, type, proveedorId, sucursal, folioCompra } = req.body;
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un producto' });
    }
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }
    // Generar folio único para la entrada
    let allFolios = await prisma.stockMovement.findMany({ select: { folio: true } });
    let maxNum = 0;
    for (const f of allFolios) {
      if (f.folio && /^MVO-\d+$/.test(f.folio)) {
        const num = parseInt(f.folio.replace('MVO-', ''));
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    const folio = `MVO-${maxNum + 1}`;
    // Crear un solo movimiento con todos los productos
    const movimiento = await prisma.stockMovement.create({
      data: {
        productos,
        reason,
        cost: typeof cost === 'number' ? cost : 0,
        type,
        createdBy,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        folio,
        ...(proveedorId ? { proveedorId } : {}),
        ...(sucursal ? { sucursal } : {}),
        ...(folioCompra ? { folioCompra } : {}),
      },
    });
    // Actualizar stock de todos los productos
    for (const item of productos) {
      if (!item.productId || !item.quantity) continue;
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: type === 'OUT' ? -item.quantity : item.quantity } },
      });
    }
    res.status(201).json(movimiento);
  } catch (error) {
    const err = error as Error;
    if (!res.headersSent) {
      res.status(400).json({ error: err.message || 'Error inesperado' });
    }
  }
};

// Nuevo endpoint para obtener todos los movimientos de una entrada agrupada
export const getMovementsByEntrada = async (req: Request, res: Response) => {
  try {
    const { folioCompra, createdAt, proveedorId, sucursal } = req.query;
    let where: any = {};
    if (folioCompra) where.folioCompra = String(folioCompra);
    if (createdAt) where.createdAt = new Date(String(createdAt));
    if (proveedorId) where.proveedorId = String(proveedorId);
    if (sucursal) where.sucursal = String(sucursal);
    if (Object.keys(where).length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un parámetro de búsqueda' });
    }
    const movimientos = await prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
    res.json(movimientos);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
