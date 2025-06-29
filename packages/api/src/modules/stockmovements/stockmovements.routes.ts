import { Router } from 'express';
import * as stockMovementsController from './stockmovements.controller';

const router = Router();

// Listar movimientos de inventario
router.get('/', stockMovementsController.getStockMovements);
// Crear ajuste manual de inventario
router.post('/adjustment', stockMovementsController.createAdjustment);

export default router;
