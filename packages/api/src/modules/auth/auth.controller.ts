import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const user = await prisma.user.findUnique({ where: { name } });
  if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  // Por simplicidad, no se genera JWT aquí
  res.json({ id: user.id, name: user.name, role: user.role });
}
