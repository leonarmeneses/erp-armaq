import { Router } from 'express';
import * as stockMovementsController from './stockmovements.controller';

const router = Router();

// Listar movimientos de inventario
router.get('/', stockMovementsController.getStockMovements);
// Crear ajuste manual de inventario
router.post('/adjustment', stockMovementsController.createAdjustment);
// Crear cualquier tipo de movimiento (IN, OUT, ADJUSTMENT)
router.post('/', stockMovementsController.createMovement);

export default router;
