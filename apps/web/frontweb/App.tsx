import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AppPanel from './AppPanel';
import Clientes from './Clientes';
import Cotizaciones from './Cotizaciones';
import Inventarios from './Inventarios';
import OrdenDeVenta from './OrdenDeVenta';
import Facturacion from './Facturacion';
import Tesoreria from './Tesoreria';
import Reportes from './Reportes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<AppPanel />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/cotizaciones" element={<Cotizaciones />} />
        <Route path="/inventarios" element={<Inventarios />} />
        <Route path="/orden_de_venta" element={<OrdenDeVenta />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/tesoreria" element={<Tesoreria />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
