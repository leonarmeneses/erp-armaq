import { Router } from 'express';
import * as paymentsController from './payments.controller';

const router = Router();

// Registrar un nuevo pago y su aplicación a facturas
router.post('/', paymentsController.createPayment);
// Listar pagos
router.get('/', paymentsController.getPayments);
// Obtener un pago específico
router.get('/:id', paymentsController.getPaymentById);

export default router;
