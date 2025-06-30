import { Router } from 'express';
import * as usersController from './users.controller';

const router = Router();

router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.delete('/:id', usersController.deleteUser);
router.put('/:id', usersController.updateUser);

export default router;
