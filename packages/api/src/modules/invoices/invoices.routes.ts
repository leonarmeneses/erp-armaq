import { Router } from 'express';
import * as invoicesController from './invoices.controller';

const router = Router();

// Crear nueva factura con archivos
router.post('/', invoicesController.uploadInvoiceFiles, invoicesController.createInvoice);
// Listar facturas
router.get('/', invoicesController.getInvoices);
// Obtener una factura específica
router.get('/:id', invoicesController.getInvoiceById);
// Actualizar una factura
router.put('/:id', invoicesController.updateInvoice);
// Eliminar una factura
router.delete('/:id', invoicesController.deleteInvoice);
// Generar PDF de la factura
router.get('/:id/pdf', invoicesController.generateInvoicePDF);

export default router;
