import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const opciones = [
  { label: 'Clientes', value: 'clientes' },
  { label: 'Cotizaciones', value: 'cotizaciones' },
  { label: 'Inventarios', value: 'inventarios' },
  { label: 'Orden de Venta', value: 'orden_de_venta' },
  { label: 'Facturación', value: 'facturacion' },
  { label: 'Tesorería', value: 'tesoreria' },
  { label: 'Reportes', value: 'reportes' },
];

export default function AppPanel() {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState('');

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24 }}>
      <h1>Panel principal</h1>
      <p>Selecciona una opción:</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '24px 0' }}>
        {opciones.map(opt => (
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
