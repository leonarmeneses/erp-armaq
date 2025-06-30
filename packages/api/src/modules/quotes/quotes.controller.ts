import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calcularTotal(items: any[]): number {
  return items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
}

async function generarFolio(): Promise<string> {
  const count = await prisma.quote.count();
  const next = count + 1;
  return `COT-${String(next).padStart(3, '0')}`;
}

export const createQuote = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || [];
    const total = calcularTotal(items);
    const folio = await generarFolio();
    const quote = await prisma.quote.create({
      data: {
        folio,
        clientId: req.body.clientId,
        total,
        status: 'PENDING',
        validUntil: req.body.fecha ? new Date(req.body.fecha) : req.body.validUntil,
        items,
        notas: req.body.notas,
        usuario: req.body.usuario,
      },
    });
    res.status(201).json(quote);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getQuotes = async (req: Request, res: Response) => {
  try {
    // Obtener todas las cotizaciones
    const quotes = await prisma.quote.findMany({ orderBy: { createdAt: 'desc' } });
    // Obtener todos los usuarios (solo name y sucursal)
    const users = await prisma.user.findMany({ select: { name: true, sucursal: true } });
    // Enriquecer cada cotización con la sucursal del usuario creador
    const quotesWithSucursal = quotes.map((q: any) => {
      const user = users.find((u: any) => u.name === q.usuario);
      return { ...q, sucursal: user?.sucursal || null };
    });
    res.json(quotesWithSucursal);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getQuoteById = async (req: Request, res: Response) => {
  try {
    const quote = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!quote) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(quote);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateQuote = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || [];
    const total = calcularTotal(items);
    const data: any = {
      clientId: req.body.clientId,
      total,
      items,
      notas: req.body.notas,
      usuario: req.body.usuario,
    };
    // Manejar fecha personalizada
    if (req.body.fecha) {
      data.validUntil = new Date(req.body.fecha);
    } else if (req.body.validUntil) {
      data.validUntil = new Date(req.body.validUntil);
    }
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data,
    });
    res.json(quote);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteQuote = async (req: Request, res: Response) => {
  try {
    await prisma.quote.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const convertToOrder = async (req: Request, res: Response) => {
  try {
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
    });
    // Aquí se debe crear el SaleOrder con los datos de la cotización
    // Ejemplo básico:
    // await prisma.saleOrder.create({ data: { ... } });
    res.json({ message: 'Cotización convertida en pedido', quote });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
