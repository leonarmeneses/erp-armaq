import { Router } from 'express';
import * as quotesController from './quotes.controller';

const router = Router();

// Crear nueva cotización
router.post('/', quotesController.createQuote);
// Listar cotizaciones
router.get('/', quotesController.getQuotes);
// Obtener una cotización específica
router.get('/:id', quotesController.getQuoteById);
// Actualizar una cotización
router.put('/:id', quotesController.updateQuote);
// Eliminar una cotización
router.delete('/:id', quotesController.deleteQuote);
// Convertir cotización en pedido
router.post('/:id/convert', quotesController.convertToOrder);

export default router;
