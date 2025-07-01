import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const salesByClient = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    // Agrupar ventas por cliente
    const result = await prisma.invoice.groupBy({
      by: ['clientId'],
      where: {
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
      },
      _sum: { total: true },
      _count: { id: true },
    });
    // Obtener los nombres de los clientes
    const clientIds = result.map(r => r.clientId);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true }
    });
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]));
    // Obtener vendedores por cliente
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: { in: clientIds },
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
      },
      select: {
        clientId: true,
        saleOrder: {
          select: {
            quote: {
              select: { usuario: true }
            }
          }
        }
      }
    });
    // Agrupar vendedores por cliente
    const vendedoresPorCliente: Record<string, Set<string>> = {};
    for (const inv of invoices) {
      const vendedor = inv.saleOrder?.quote?.usuario;
      if (vendedor) {
        if (!vendedoresPorCliente[inv.clientId]) vendedoresPorCliente[inv.clientId] = new Set();
        vendedoresPorCliente[inv.clientId].add(vendedor);
      }
    }
    const resultWithNames = result.map(r => ({
      ...r,
      clientName: clientMap[r.clientId] || r.clientId,
      vendedores: Array.from(vendedoresPorCliente[r.clientId] || [])
    }));
    res.json(resultWithNames);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const topSellingProducts = async (req: Request, res: Response) => {
  try {
    const result = await prisma.invoiceItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true },
      orderBy: [{ _sum: { quantity: 'desc' } }],
      take: 10,
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const accountsReceivable = async (req: Request, res: Response) => {
  try {
    const result = await prisma.invoice.findMany({
      where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      include: { client: true },
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const kardex = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: 'productId requerido' });
    // Buscar movimientos donde productos JSON contenga el productId
    const result = await prisma.stockMovement.findMany({
      where: {
        productos: {
          array_contains: [{ productId: String(productId) }]
        }
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    res.json({
      endpoints: [
        '/api/reports/sales-by-client',
        '/api/reports/top-selling-products',
        '/api/reports/accounts-receivable',
        '/api/reports/kardex'
      ],
      message: 'Consulta los endpoints específicos para reportes detallados.'
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const quotesBySeller = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    // Obtener todas las cotizaciones en el rango
    const quotes = await prisma.quote.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(String(startDate)) : undefined,
          lte: endDate ? new Date(String(endDate)) : undefined,
        },
      },
      select: {
        usuario: true,
        id: true,
        saleOrders: {
          select: {
            id: true,
            total: true
          }
        }
      }
    });
    // Agrupar por vendedor
    const resumen: Record<string, { vendedor: string, cotizaciones: number, ordenes: number, totalVendido: number }> = {};
    for (const q of quotes) {
      const vendedor = q.usuario || 'Sin asignar';
      if (!resumen[vendedor]) {
        resumen[vendedor] = {
          vendedor,
          cotizaciones: 0,
          ordenes: 0,
          totalVendido: 0
        };
      }
      resumen[vendedor].cotizaciones += 1;
      resumen[vendedor].ordenes += q.saleOrders.length;
      resumen[vendedor].totalVendido += q.saleOrders.reduce((acc: number, so: any) => acc + (so.total || 0), 0);
    }
    // Obtener sucursal de cada vendedor
    const vendedoresNombres = Object.keys(resumen).filter(v => v !== 'Sin asignar');
    const users = await prisma.user.findMany({ where: { name: { in: vendedoresNombres } }, select: { name: true, sucursal: true } });
    const sucursalMap = Object.fromEntries(users.map(u => [u.name, u.sucursal || '-']));
    // Armar resultado final
    const resultado = Object.values(resumen).map(r => ({
      vendedor: r.vendedor,
      sucursal: sucursalMap[r.vendedor] || '-',
      cotizaciones: r.cotizaciones,
      ordenes: r.ordenes,
      totalVendido: r.totalVendido
    }));
    res.json(resultado);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
