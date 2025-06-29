import { Router } from 'express';
import * as saleOrdersController from './saleorders.controller';

const router = Router();

// Crear nuevo pedido
router.post('/', saleOrdersController.createSaleOrder);
// Listar pedidos
router.get('/', saleOrdersController.getSaleOrders);
// Obtener un pedido específico
router.get('/:id', saleOrdersController.getSaleOrderById);
// Actualizar un pedido
router.put('/:id', saleOrdersController.updateSaleOrder);
// Eliminar un pedido
router.delete('/:id', saleOrdersController.deleteSaleOrder);

export default router;
