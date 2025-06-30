import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrdenDeVenta() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS');
  const [cotizacionesMap, setCotizacionesMap] = useState<any>({});

  useEffect(() => {
    fetch('/api/saleorders')
      .then(res => res.json())
      .then(data => {
        setOrdenes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar ordenes de venta');
        setLoading(false);
      });
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : data.data || []));
    // Obtener cotizaciones para mapear sucursal
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        // Crear un mapa id -> cotización
        const map: any = {};
        data.forEach((c: any) => { map[c.id] = c; });
        setCotizacionesMap(map);
      });
  }, []);

  // Filtrar órdenes por sucursal (usando sucursal de la cotización asociada si existe)
  const ordenesFiltradas = ordenes.filter((o: any) => {
    if (filtroSucursal === 'TODAS') return true;
    const cot = o.quoteId ? cotizacionesMap[o.quoteId] : null;
    const sucursal = cot?.sucursal || o.sucursal || null;
    return sucursal === filtroSucursal;
  });

  const handleNuevaVenta = () => {
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        // Filtrar cotizaciones que NO estén en 'VENDIDO'
        const cotizacionesDisponibles = data.filter((c: any) => c.status !== 'VENDIDO');
        setCotizaciones(cotizacionesDisponibles);
      });
    setShowForm(true);
  };

  const recargarOrdenes = () => {
    setLoading(true);
    fetch('/api/saleorders')
      .then(res => res.json())
      .then(data => {
        setOrdenes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar ordenes de venta');
        setLoading(false);
      });
  };

  if (loading) return <div>Cargando ordenes de venta...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Orden de Venta</h2>
          <button
            onClick={handleNuevaVenta}
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              marginRight: 8
            }}
          >
            Nueva Venta
          </button>
          <div>
            <label style={{ fontWeight: 'bold', marginRight: 8, color: '#333' }}>Sucursal:</label>
            <select
              value={filtroSucursal}
              onChange={e => setFiltroSucursal(e.target.value)}
              style={{
                minWidth: 160,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #b0bec5',
                background: '#f5f7fa',
                fontSize: 15
              }}
            >
              <option value="TODAS">Todas</option>
              <option value="CDMX">CDMX</option>
              <option value="PLAYA DEL CARMEN">PLAYA DEL CARMEN</option>
            </select>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Folio</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Total</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Estado</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Ver</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map(o => (
              <tr key={o.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{o.folio}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{
                  o.client?.name || clientes.find((c: any) => c.id === o.clientId)?.name || o.clientId
                }</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>${o.total}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{
                  o.status === 'PENDING_SURTIDO'
                    ? (o.invoices && o.invoices.length > 0 ? 'Facturada' : 'Pendiente de facturar')
                    : o.status
                }</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{o.createdAt?.slice(0,10)}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  <button
                    onClick={() => setSelectedQuote(o)}
                    style={{
                      background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 14px',
                      fontWeight: 500,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)'
                    }}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showForm && (
          <NuevaVentaForm
            cotizaciones={cotizaciones}
            onClose={() => { setShowForm(false); setSelectedQuote(null); recargarOrdenes(); }}
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            clientes={clientes}
          />
        )}
        {selectedQuote && !showForm && (
          <VerOrdenVentaModal orden={selectedQuote} onClose={() => setSelectedQuote(null)} clientes={clientes} />
        )}
      </div>
    </div>
  );
}

function NuevaVentaForm({ cotizaciones, onClose, selectedQuote, setSelectedQuote, clientes }: { cotizaciones: any[], onClose: () => void, selectedQuote: any, setSelectedQuote: (q: any) => void, clientes: any[] }) {
  const [productos, setProductos] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProductos(data));
  }, []);
  const cliente = selectedQuote ? (selectedQuote.client?.name || clientes.find((c: any) => c.id === selectedQuote.clientId)?.name || '') : '';
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding: 36, borderRadius: 20, minWidth: 370, maxWidth: 650, width: '100%', boxShadow: '0 8px 32px rgba(60,80,180,0.18)', border: '1.5px solid #dbeafe', position: 'relative', transition: 'box-shadow 0.2s' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 24px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.12)'
          }}
        >
          Cerrar
        </button>
        <h3 style={{
          margin: 0,
          marginBottom: 18,
          fontSize: 24,
          fontWeight: 700,
          color: '#2563eb',
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 2px 8px #e0e7ff'
        }}>Nueva Orden de Venta</h3>
        <label style={{ fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 10 }}>Elige una Cotización<br/>
          <select value={selectedQuote?.id || ''} onChange={e => {
            const q = cotizaciones.find(c => c.id === e.target.value);
            setSelectedQuote(q);
          }} style={{ width:'100%', marginBottom:16, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '8px 12px', fontSize: 16, background: '#f1f5fa', outlineColor: '#2563eb' }}>
            <option value=''>-- Selecciona una cotización --</option>
            {cotizaciones.map(c => (
              <option key={c.id} value={c.id}>{c.folio} - {c.client?.name || clientes.find((cli: any) => cli.id === c.clientId)?.name || ''}</option>
            ))}
          </select>
        </label>
        {selectedQuote && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 10 }}>
              <div style={{ flex: '1 1 120px', minWidth: 100 }}><b>Folio:</b> {selectedQuote.folio}</div>
              <div style={{ flex: '2 1 220px', minWidth: 180 }}><b>Cliente:</b> {cliente}</div>
              <div style={{ flex: '1 1 120px', minWidth: 100 }}><b>Fecha:</b> {selectedQuote.createdAt?.slice(0,10)}</div>
              <div style={{ flex: '1 1 160px', minWidth: 120 }}><b>Vendedor:</b> {selectedQuote.usuario}</div>
            </div>
            <div style={{ marginBottom: 8 }}><b>Productos:</b>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <thead>
                    <tr style={{ background: '#e3f2fd' }}>
                      <th style={{ border:'1px solid #c7d2fe', padding:6, color:'#1976d2' }}>Código</th>
                      <th style={{ border:'1px solid #c7d2fe', padding:6, color:'#1976d2' }}>Nombre</th>
                      <th style={{ border:'1px solid #c7d2fe', padding:6, color:'#1976d2' }}>Cantidad</th>
                      <th style={{ border:'1px solid #c7d2fe', padding:6, color:'#1976d2' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedQuote.items || []).map((item: any, idx: number) => {
                      const prod = productos.find((p: any) => p.id === item.productId);
                      return (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                          <td style={{ border:'1px solid #e3f2fd', padding:6 }}>{prod ? prod.code : item.productId}</td>
                          <td style={{ border:'1px solid #e3f2fd', padding:6 }}>{prod ? prod.name : item.productId}</td>
                          <td style={{ border:'1px solid #e3f2fd', padding:6 }}>{item.quantity}</td>
                          <td style={{ border:'1px solid #e3f2fd', padding:6 }}>${item.subtotal?.toFixed(2) ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}><b>Notas:</b> {selectedQuote.notas}</div>
            <div style={{ marginTop: 12, fontWeight: 'bold', fontSize: 18, color: '#1976d2', textAlign: 'right' }}>Total: ${selectedQuote.total?.toFixed(2)}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
              <button
                style={{
                  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontWeight: 600,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
                }}
                onClick={async () => {
                  // Lógica para crear la orden de venta
                  const res = await fetch('/api/saleorders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      clientId: selectedQuote.clientId,
                      quoteId: selectedQuote.id,
                      items: selectedQuote.items,
                      total: selectedQuote.total,
                    }),
                  });
                  if (res.ok) {
                    // Cambiar estado de la cotización a 'VENDIDO' sin borrar productos ni datos
                    await fetch(`/api/quotes/${selectedQuote.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...selectedQuote,
                        status: 'VENDIDO'
                      }),
                    });
                    alert('Orden de venta creada correctamente');
                    onClose();
                  } else {
                    const err = await res.json();
                    alert('Error al crear orden de venta: ' + (err.error || 'Error desconocido'));
                  }
                }}
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontWeight: 600,
                  fontSize: 17,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.12)'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VerOrdenVentaModal({ orden, onClose, clientes }: { orden: any, onClose: () => void, clientes: any[] }) {
  const [productos, setProductos] = useState<any[]>([]);
  const [cotizacion, setCotizacion] = useState<any>(null);
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: any[]) => setProductos(data));
    if (orden.quoteId) {
      fetch(`/api/quotes/${orden.quoteId}`)
        .then(res => res.json())
        .then(data => setCotizacion(data));
    }
  }, [orden]);
  if (!orden) return null;
  const cliente = clientes.find(c => c.id === orden.clientId);
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Detalle de Orden de Venta</h3>
        <div><b>Folio:</b> {orden.folio}</div>
        <div><b>Cotización:</b> {cotizacion?.folio || '-'}</div>
        <div><b>Cliente:</b> {cliente ? cliente.name : orden.clientId}</div>
        <div><b>Fecha:</b> {orden.createdAt?.slice(0,10)}</div>
        <div><b>Usuario:</b> {cotizacion?.usuario || orden.usuario || '-'}</div>
        <div><b>Productos:</b>
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
            <thead>
              <tr>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Código</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Nombre</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Cantidad</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(orden.items || []).map((item: any, idx: number) => {
                const prod = productos.find((p: any) => p.id === item.productId);
                return (
                  <tr key={idx}>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{prod ? prod.code : item.productId}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{prod ? prod.name : item.productId}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{item.quantity}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>${item.subtotal?.toFixed(2) ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontWeight: 'bold' }}>Total: ${orden.total?.toFixed(2)}</div>
        <button onClick={onClose} style={{ marginTop: 16 }}>Cerrar</button>
      </div>
    </div>
  );
}
