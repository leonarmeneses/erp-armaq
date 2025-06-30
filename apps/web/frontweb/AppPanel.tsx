import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Clientes from './Clientes';
import Proveedores from './Proveedores';
import Cotizaciones from './Cotizaciones';
import Inventarios from './Inventarios';
import OrdenDeVenta from './OrdenDeVenta';
import Facturacion from './Facturacion';
import Tesoreria from './Tesoreria';
import Reportes from './Reportes';
import Usuarios from './Usuarios';
import { PanelDashboardResumen } from './PanelDashboardResumen';

const opciones = [
  { label: 'Clientes', value: 'clientes' },
  { label: 'Proveedores', value: 'proveedores' },
  { label: 'Cotizaciones', value: 'cotizaciones' },
  { label: 'Orden de Venta', value: 'orden_de_venta' },
  { label: 'Facturación', value: 'facturacion' },
  { label: 'Inventarios', value: 'inventarios' },
  { label: 'Reportes', value: 'reportes' },
  { label: 'Tesorería', value: 'tesoreria' },
  { label: 'Usuarios', value: 'usuarios' },
];

export default function AppPanel() {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState('');
  const [rol, setRol] = useState('');

  useEffect(() => {
    // Obtener el rol del usuario desde localStorage (debe guardarse en login)
    const userData = localStorage.getItem('usuario_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setRol(user.role);
      } catch {}
    }
  }, []);

  let opcionesFiltradas = opciones;
  if (rol === 'VENTAS') {
    opcionesFiltradas = opciones.filter(opt =>
      ['clientes', 'cotizaciones', 'orden_de_venta', 'facturacion', 'inventarios'].includes(opt.value)
    );
  } else if (rol === 'ENCARGADO') {
    opcionesFiltradas = opciones.filter(opt =>
      !['tesoreria', 'usuarios'].includes(opt.value)
    );
  } else if (rol === 'FINANZAS') {
    opcionesFiltradas = opciones.filter(opt =>
      !['cotizaciones', 'orden_de_venta', 'inventarios', 'usuarios'].includes(opt.value)
    );
  }

  // Renderizar el componente correspondiente
  let contenido = null;
  if (opcion === 'clientes') contenido = <Clientes />;
  else if (opcion === 'proveedores') contenido = <Proveedores />;
  else if (opcion === 'cotizaciones') contenido = <Cotizaciones />;
  else if (opcion === 'inventarios') contenido = <Inventarios />;
  else if (opcion === 'orden_de_venta') contenido = <OrdenDeVenta />;
  else if (opcion === 'facturacion') contenido = <Facturacion />;
  else if (opcion === 'tesoreria') contenido = <Tesoreria />;
  else if (opcion === 'reportes') contenido = <Reportes />;
  else if (opcion === 'usuarios') contenido = <Usuarios />;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f4f8fb', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* Barra superior fija */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: 70, background: 'white', boxShadow: '0 2px 12px rgba(60,60,120,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, padding: '0 32px', margin: 0, boxSizing: 'border-box' }}>
        <h1
          style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#2563eb', letterSpacing: 1, cursor: 'pointer' }}
          onClick={() => setOpcion('')}
        >
          Panel principal
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {opcionesFiltradas.map(opt => (
            <button
              key={opt.value}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f1f5f9', color: '#2563eb', fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}
              onClick={() => setOpcion(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas salir de la sesión?')) {
                localStorage.removeItem('usuario');
                localStorage.removeItem('usuario_data');
                navigate('/login');
              }
            }}
            style={{ padding: '10px 20px', borderRadius: 8, background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: 8 }}
          >
            Salir
          </button>
        </div>
      </div>
      {/* Contenido debajo de la barra */}
      <div style={{ width: '100vw', minHeight: 'calc(100vh - 70px)', margin: 0, padding: '110px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!opcion && (
          <>
            <h2 style={{
              fontSize: 32,
              color: '#1976d2',
              marginBottom: 32,
              fontWeight: 800,
              letterSpacing: 1.5,
              textShadow: '0 2px 12px #e0e7ff, 0 1px 0 #fff',
              background: 'linear-gradient(90deg, #e0e7ff 0%, #90caf9 100%)',
              borderRadius: 12,
              padding: '24px 48px',
              boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
              border: '2px solid #90caf9',
              textAlign: 'center',
              maxWidth: 600
            }}>
              Bienvenido al sistema administrativo ARMAQ
            </h2>
            <PanelDashboardResumen />
          </>
        )}
        {contenido}
      </div>
    </div>
  );
}
