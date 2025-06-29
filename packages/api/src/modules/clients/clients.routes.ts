import { Router } from 'express';
import * as clientsController from './clients.controller';

const router = Router();

// Crear nuevo cliente
router.post('/', clientsController.createClient);
// Listar clientes con paginación y filtros
router.get('/', clientsController.getClients);
// Obtener un cliente específico
router.get('/:id', clientsController.getClientById);
// Actualizar un cliente
router.put('/:id', clientsController.updateClient);
// Eliminar un cliente (borrado lógico)
router.delete('/:id', clientsController.deleteClient);

export default router;
