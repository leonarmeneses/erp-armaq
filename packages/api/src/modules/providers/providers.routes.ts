import express from 'express';
import providersController from './providers.controller';

const router = express.Router();

router.use('/', providersController);

export default router;
