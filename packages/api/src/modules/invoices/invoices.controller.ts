import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, '../../../uploads/invoices');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
export const uploadInvoiceFiles = multer({ storage }).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'xml', maxCount: 1 }
]);

function calcularTotales(items: any[]): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const tax = items.reduce((acc, item) => acc + ((item.subtotal || 0) * 0.16), 0); // IVA 16%
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

async function generarFolio(): Promise<string> {
  const count = await prisma.invoice.count();
  const next = count + 1;
  return `F-${String(next).padStart(3, '0')}`;
}

export const createInvoice = async (req: Request, res: Response) => {
  try {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      // Manejo de archivos PDF y XML
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const pdfFile = files?.pdf?.[0];
      const xmlFile = files?.xml?.[0];
      let pdfUrl = null;
      let xmlUrl = null;
      if (pdfFile) {
        const pdfPath = path.join('uploads', 'invoices', pdfFile.originalname);
        fs.writeFileSync(pdfPath, pdfFile.buffer);
        pdfUrl = '/' + pdfPath;
      }
      if (xmlFile) {
        const xmlPath = path.join('uploads', 'invoices', xmlFile.originalname);
        fs.writeFileSync(xmlPath, xmlFile.buffer);
        xmlUrl = '/' + xmlPath;
      }
      const data = req.body;
      const items = JSON.parse(data.items || '[]');
      // Calcular subtotal y tax
      let subtotal = 0;
      let tax = 0;
      if (Array.isArray(items)) {
        subtotal = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        tax = items.reduce((acc, item) => acc + ((item.subtotal || 0) * 0.16), 0);
      }
      const invoice = await prisma.invoice.create({
        data: {
          folio: data.folio,
          clientId: data.clientId,
          saleOrderId: data.saleOrderId,
          subtotal,
          tax,
          total: parseFloat(data.total),
          status: 'PAID', // Cambiar a PAID al guardar la factura
          createdAt: new Date(data.createdAt),
          paymentMethod: data.paymentMethod || 'EFECTIVO',
          pdfUrl,
          xmlUrl,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              subtotal: item.subtotal,
              price: item.price ?? item.subtotal / (item.quantity || 1) // fallback si no viene price
            }))
          },
        },
      });
      return res.status(201).json(invoice);
    }
    const items = req.body.items || [];
    const { subtotal, tax, total } = calcularTotales(items);
    const folio = await generarFolio();
    // Simular UUID
    const uuid = `UUID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    // Crear factura
    const invoice = await prisma.invoice.create({
      data: {
        folio,
        uuid,
        clientId: req.body.clientId,
        subtotal,
        tax,
        total,
        status: 'PAID', // Cambiar a PAID al guardar la factura
        paymentMethod: req.body.paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
        saleOrderId: req.body.saleOrderId,
      },
      include: { items: true },
    });
    // Afectar inventario
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    // Afectar cuentas por cobrar
    await prisma.client.update({
      where: { id: req.body.clientId },
      data: { balance: { increment: total } },
    });
    res.status(201).json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { items: true, client: true, saleOrder: { include: { quote: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(invoice);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const generateInvoicePDF = async (req: Request, res: Response) => {
  // Aquí iría la lógica para generar el PDF (puedes usar pdfkit o puppeteer)
  res.status(501).json({ message: 'Generación de PDF no implementada (simulación).' });
};
