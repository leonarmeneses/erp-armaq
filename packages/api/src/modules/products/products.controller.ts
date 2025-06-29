import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Obtener el último producto creado (ordenado por número incremental)
    const last = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    // Extraer el número del folio anterior, si existe
    let nextNumber = 1;
    if (last && last.code && /^ARM-\d+$/.test(last.code)) {
      const num = parseInt(last.code.replace('ARM-', ''), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const code = `ARM-${nextNumber}`;
    // Crear el producto con el folio generado
    const product = await prisma.product.create({
      data: { ...req.body, code }
    });
    res.status(201).json(product);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // No permitir cambiar el código
    const { code, ...data } = req.body;
    const updated = await prisma.product.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
