import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createClient = async (req: Request, res: Response) => {
  try {
    // Obtener el último cliente creado (ordenado por número incremental)
    const last = await prisma.client.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    // Extraer el número del folio anterior, si existe
    let nextNumber = 1;
    if (last && last.code && /^CL-\d+$/.test(last.code)) {
      const num = parseInt(last.code.replace('CL-', ''), 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const code = `CL-${nextNumber}`;
    // Crear el cliente con el folio generado
    const client = await prisma.client.create({
      data: {
        ...req.body,
        code,
        // Eliminar address si existe en req.body
        address: undefined
      },
    });
    res.status(201).json(client);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const where = search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as any } },
            { code: { contains: String(search), mode: 'insensitive' as any } },
            { rfc: { contains: String(search), mode: 'insensitive' as any } },
          ],
        }
      : {};
    const clients = await prisma.client.findMany({
      where,
      skip,
      take: Number(pageSize),
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.client.count({ where });
    res.json({ data: clients, total });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findUnique({ where: { id: req.params.id } });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(client);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(client);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    // Borrado lógico: actualiza un campo, aquí solo ejemplo de borrado real
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
