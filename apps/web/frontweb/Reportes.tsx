import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const opciones = [
  { label: 'Reporte de ventas', value: 'ventas' },
  { label: 'Entradas y salidas de inventario', value: 'inventario' },
  { label: 'Cotizaciones realizadas', value: 'cotizaciones' },
  { label: 'Pagos por método', value: 'pagos' },
];

function TablaVentas({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay datos de ventas.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Total vendido</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>N° facturas</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{v.clientId}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{v._sum?.total?.toFixed(2) ?? 0}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{v._count?.id ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaInventario({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay movimientos de inventario.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Producto</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Tipo</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.product?.name || m.productId}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.type}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.quantity}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.createdAt?.slice(0,10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaCotizaciones({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay cotizaciones.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Estatus</th>
        </tr>
      </thead>
      <tbody>
        {data.map((q, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q.folio || q.id}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q.client?.name || q.clientId}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q.createdAt?.slice(0,10)}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q.total?.toFixed(2) ?? 0}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q.status || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaPagos({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay pagos.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Método</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Monto</th>
          <th style={{ border: '1px solid #ccc', padding: 8 }}>Referencia</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.createdAt?.slice(0,10)}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.client?.name || p.clientId}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.method || '-'}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.amount?.toFixed(2) ?? 0}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.reference || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Reportes() {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    let url = '';
    let params = '';
    if (fechaInicio) params += `startDate=${fechaInicio}`;
    if (fechaFin) params += `${params ? '&' : ''}endDate=${fechaFin}`;
    if (opcion === 'ventas') url = `/api/reports/sales-by-client`;
    if (opcion === 'inventario') url = `/api/reports/kardex`;
    if (opcion === 'cotizaciones') url = `/api/quotes`;
    if (opcion === 'pagos') url = `/api/payments`;
    if (params) url += `?${params}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Error al cargar reporte');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Reportes</h2>
      <div style={{ marginBottom: 16 }}>
        {opciones.map(opt => (
          <button
            key={opt.value}
            style={{ marginRight: 8, padding: '8px 16px', borderRadius: 6, border: opcion === opt.value ? '2px solid #007bff' : '1px solid #ccc', background: opcion === opt.value ? '#e6f0ff' : '#fff', cursor: 'pointer' }}
            onClick={() => setOpcion(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Fecha inicio: <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></label>
        <label style={{ marginLeft: 16 }}>Fecha fin: <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></label>
        <button style={{ marginLeft: 16 }} onClick={handleBuscar}>Buscar</button>
      </div>
      {loading && <div>Cargando reporte...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && opcion === 'ventas' && <TablaVentas data={result} />}
      {result && opcion === 'inventario' && <TablaInventario data={result} />}
      {result && opcion === 'cotizaciones' && <TablaCotizaciones data={result} />}
      {result && opcion === 'pagos' && <TablaPagos data={result} />}
      {result && !['ventas','inventario','cotizaciones','pagos'].includes(opcion) && (
        <pre style={{ background: '#f8f8f8', padding: 16, borderRadius: 8, overflowX: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
