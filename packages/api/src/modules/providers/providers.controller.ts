import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Obtener todos los proveedores
router.get('/', async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.provider.findMany();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

// Crear proveedor
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Obtener el número consecutivo
    const count = await prisma.provider.count();
    const code = `PRO-${count + 1}`;
    const provider = await prisma.provider.create({ data: { ...data, code } });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

// Actualizar proveedor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const provider = await prisma.provider.update({ where: { id }, data });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

// Eliminar proveedor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.provider.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

export default router;
