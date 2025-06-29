pnpm run devimport { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import Treasury from './pages/Treasury';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Login from './pages/Login';
import { currentUser as initialUser } from './auth/roles';
import './App.css';

function App() {
  const [user, setUser] = useState<{ name: string; role: 'admin' | 'seller' } | null>(initialUser);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white flex gap-4">
        {user.role === 'admin' && <Link to="/clients">Clientes</Link>}
        {user.role === 'admin' && <Link to="/products">Productos</Link>}
        <Link to="/sales">Ventas</Link>
        <Link to="/invoices">Facturación</Link>
        {user.role === 'admin' && <Link to="/inventory">Inventario</Link>}
        {user.role === 'admin' && <Link to="/treasury">Tesorería</Link>}
        {user.role === 'admin' && <Link to="/reports">Reportes</Link>}
        {user.role === 'admin' && <Link to="/users">Usuarios</Link>}
        <button className="ml-auto bg-red-600 px-3 py-1 rounded" onClick={() => setUser(null)}>Salir</button>
      </nav>
      <div className="p-4">
        <Routes>
          {user.role === 'admin' && <Route path="/clients" element={<Clients />} />}
          {user.role === 'admin' && <Route path="/products" element={<Products />} />}
          <Route path="/sales" element={<Sales />} />
          <Route path="/invoices" element={<Invoices />} />
          {user.role === 'admin' && <Route path="/inventory" element={<Inventory />} />}
          {user.role === 'admin' && <Route path="/treasury" element={<Treasury />} />}
          {user.role === 'admin' && <Route path="/reports" element={<Reports />} />}
          {user.role === 'admin' && <Route path="/users" element={<Users />} />}
          <Route path="*" element={<Sales />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
