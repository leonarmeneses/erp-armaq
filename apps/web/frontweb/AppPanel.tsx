import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const opciones = [
  { label: 'Clientes', value: 'clientes' },
  { label: 'Cotizaciones', value: 'cotizaciones' },
  { label: 'Inventarios', value: 'inventarios' },
  { label: 'Orden de Venta', value: 'orden_de_venta' },
  { label: 'Facturación', value: 'facturacion' },
  { label: 'Tesorería', value: 'tesoreria' },
  { label: 'Reportes', value: 'reportes' },
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
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, position: 'relative' }}>
      <button
        onClick={() => {
          if (window.confirm('¿Seguro que deseas salir de la sesión?')) {
            localStorage.removeItem('usuario');
            localStorage.removeItem('usuario_data');
            navigate('/login');
          }
        }}
        style={{ position: 'absolute', top: 16, right: 16, padding: '8px 20px', borderRadius: 8, background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Salir
      </button>
      <h1>Panel principal</h1>
      <p>Selecciona una opción:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '24px 0' }}>
        {opcionesFiltradas.map(opt => (
          <button
            key={opt.value}
            style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #888', background: '#f8f8f8', cursor: 'pointer' }}
            onClick={() => {
              setOpcion(opt.value);
              navigate('/' + opt.value);
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {opcion && <div style={{ marginTop: 32 }}><b>Opción seleccionada:</b> {opcion}</div>}
    </div>
  );
}
