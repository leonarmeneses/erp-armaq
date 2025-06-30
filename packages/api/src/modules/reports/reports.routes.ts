import { Router } from 'express';
import * as reportsController from './reports.controller';

const router = Router();

// Endpoint principal para /api/reports
router.get('/', reportsController.getReports);

router.get('/sales-by-client', reportsController.salesByClient);
router.get('/top-selling-products', reportsController.topSellingProducts);
router.get('/accounts-receivable', reportsController.accountsReceivable);
router.get('/kardex', reportsController.kardex);
router.get('/quotes-by-seller', reportsController.quotesBySeller);

export default router;
