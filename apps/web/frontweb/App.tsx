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
import Usuarios from './Usuarios';
import RequireAuth from './RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/panel" element={<RequireAuth><AppPanel /></RequireAuth>} />
        <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
        <Route path="/cotizaciones" element={<RequireAuth><Cotizaciones /></RequireAuth>} />
        <Route path="/inventarios" element={<RequireAuth><Inventarios /></RequireAuth>} />
        <Route path="/orden_de_venta" element={<RequireAuth><OrdenDeVenta /></RequireAuth>} />
        <Route path="/facturacion" element={<RequireAuth><Facturacion /></RequireAuth>} />
        <Route path="/tesoreria" element={<RequireAuth><Tesoreria /></RequireAuth>} />
        <Route path="/reportes" element={<RequireAuth><Reportes /></RequireAuth>} />
        <Route path="/usuarios" element={<RequireAuth><Usuarios /></RequireAuth>} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
