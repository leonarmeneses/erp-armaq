import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getAllUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const { name, role, password, sucursal, phone, email } = req.body;
  if (!name || !role || !password) return res.status(400).json({ error: 'Faltan campos requeridos' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, role, password: hashedPassword, sucursal, phone, email } });
  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response) {
  const { name, role, password, sucursal, phone, email } = req.body;
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  let data: any = { name, role, sucursal, phone, email };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({ where: { id }, data });
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  await prisma.user.delete({ where: { id } });
  res.status(204).end();
}
