import { Router } from 'express';
import * as productsController from './products.controller';

const router = Router();

// Crear nuevo producto
router.post('/', productsController.createProduct);
// Listar productos
router.get('/', productsController.getProducts);
// Actualizar producto
router.put('/:id', productsController.updateProduct);

export default router;
