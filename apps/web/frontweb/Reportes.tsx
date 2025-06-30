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
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
      <thead>
        <tr style={{ background: '#e3f2fd' }}>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Vendedor</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Total vendido</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>N° facturas</th>
        </tr>
      </thead>
      <tbody>
        {data.map((v, i) => (
          <tr key={i} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{v.clientName || v.clientId}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
              {Array.isArray(v.vendedores) && v.vendedores.length > 0
                ? v.vendedores.map((ven: string, idx: number) => (
                    <div key={idx}>{ven}</div>
                  ))
                : '-'}
            </td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{v._sum?.total?.toFixed(2) ?? 0}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{v._count?.id ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaInventario({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay movimientos de inventario.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
      <thead>
        <tr style={{ background: '#e3f2fd' }}>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Producto</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Tipo</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cantidad</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m, i) => (
          <tr key={i} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.product?.name || m.productId}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.type}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.quantity}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.createdAt?.slice(0,10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaCotizaciones({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay cotizaciones.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
      <thead>
        <tr style={{ background: '#e3f2fd' }}>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Vendedor</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Sucursal</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cotizaciones realizadas</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Orden de venta realizadas</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Total vendido</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{row.vendedor}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{row.sucursal}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{row.cotizaciones}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{row.ordenes}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{row.totalVendido?.toFixed(2) ?? 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaPagos({ data }: { data: any[] }) {
  if (!data?.length) return <div>No hay pagos.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
      <thead>
        <tr style={{ background: '#e3f2fd' }}>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Método</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Monto</th>
          <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Referencia</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p, i) => (
          <tr key={i} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.createdAt?.slice(0,10)}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.client?.name || p.clientId}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.method || '-'}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.amount?.toFixed(2) ?? 0}</td>
            <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.reference || '-'}</td>
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
    if (opcion === 'cotizaciones') url = `/api/reports/quotes-by-seller`;
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
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Reportes</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 48, marginBottom: 32, alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* Columna izquierda: selección de reporte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 220, justifyItems: 'center', alignItems: 'center' }}>
            {opciones.map(opt => (
              <button
                key={opt.value}
                style={{
                  padding: '12px 18px',
                  borderRadius: 8,
                  border: opcion === opt.value ? '2px solid #1976d2' : '1.5px solid #cbd5e1',
                  background: opcion === opt.value ? '#e3f2fd' : '#f8fafc',
                  color: '#1a237e',
                  fontWeight: 600,
                  fontSize: 16,
                  margin: 0,
                  cursor: 'pointer',
                  boxShadow: opcion === opt.value ? '0 2px 8px #90caf9' : 'none',
                  transition: 'all 0.15s',
                  width: '100%'
                }}
                onClick={() => setOpcion(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Columna derecha: filtros de fecha y buscar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 220 }}>
            <label style={{ fontWeight: 500, color: '#64748b' }}>
              Fecha de inicio<br />
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} />
            </label>
            <label style={{ fontWeight: 500, color: '#64748b' }}>
              Fecha fin<br />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} />
            </label>
            <button
              style={{
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)',
                width: '100%'
              }}
              onClick={handleBuscar}
            >
              Buscar
            </button>
          </div>
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
    </div>
  );
}
