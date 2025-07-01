import { Router } from 'express';
import * as stockMovementsController from './stockmovements.controller';

const router = Router();

// Listar movimientos de inventario
router.get('/', stockMovementsController.getStockMovements);
// Crear ajuste manual de inventario
router.post('/adjustment', stockMovementsController.createAdjustment);
// Crear cualquier tipo de movimiento (IN, OUT, ADJUSTMENT)
router.post('/', stockMovementsController.createMovement);
// Obtener movimientos agrupados por entrada
router.get('/entrada', stockMovementsController.getMovementsByEntrada);

export default router;
