import express from 'express';
import cors from 'cors';
import clientsRouter from './modules/clients/clients.routes';
import quotesRouter from './modules/quotes/quotes.routes';
import saleOrdersRouter from './modules/saleorders/saleorders.routes';
import invoicesRouter from './modules/invoices/invoices.routes';
import stockMovementsRouter from './modules/stockmovements/stockmovements.routes';
import paymentsRouter from './modules/payments/payments.routes';
import reportsRouter from './modules/reports/reports.routes';
import usersRouter from './modules/users/users.routes';
import authRouter from './modules/auth/auth.routes';
import productsRouter from './modules/products/products.routes';

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/saleorders', saleOrdersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/stockmovements', stockMovementsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);

app.get('/', (req, res) => {
  res.send('API GestionComercialWeb funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor API escuchando en puerto ${PORT}`);
});
