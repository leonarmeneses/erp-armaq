import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const { name, role, password } = req.body;
  if (!name || !role || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const user = await prisma.user.create({ data: { name, role, password } });
  res.status(201).json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const id = req.params.id; // id es string
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  await prisma.user.delete({ where: { id } });
  res.status(204).end();
}
