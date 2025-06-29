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
  }, []);

  const handleNuevaVenta = () => {
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => setCotizaciones(data));
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
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Orden de Venta</h2>
      <button onClick={handleNuevaVenta} style={{ marginBottom: 16 }}>Nueva Venta</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map(o => (
            <tr key={o.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{o.folio}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{
                o.client?.name || clientes.find((c: any) => c.id === o.clientId)?.name || o.clientId
              }</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{o.total}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{
                o.status === 'PENDING_SURTIDO' ? 'Pendiente de facturar' : o.status
              }</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{o.createdAt?.slice(0,10)}</td>
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
        />
      )}
    </div>
  );
}

function NuevaVentaForm({ cotizaciones, onClose, selectedQuote, setSelectedQuote }: { cotizaciones: any[], onClose: () => void, selectedQuote: any, setSelectedQuote: (q: any) => void }) {
  const [productos, setProductos] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProductos(data));
  }, []);
  const cliente = selectedQuote ? (selectedQuote.client?.name || selectedQuote.clientId) : '';
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:600 }}>
        <h3>Selecciona una Cotización</h3>
        <select value={selectedQuote?.id || ''} onChange={e => {
          const q = cotizaciones.find(c => c.id === e.target.value);
          setSelectedQuote(q);
        }} style={{ width:'100%', marginBottom:16 }}>
          <option value=''>-- Selecciona una cotización --</option>
          {cotizaciones.map(c => (
            <option key={c.id} value={c.id}>{c.folio} - {c.client?.name || c.clientId}</option>
          ))}
        </select>
        {selectedQuote && (
          <div style={{ marginBottom:16 }}>
            <div><b>Folio:</b> {selectedQuote.folio}</div>
            <div><b>Cliente:</b> {cliente}</div>
            <div><b>Fecha:</b> {selectedQuote.createdAt?.slice(0,10)}</div>
            <div><b>Notas:</b> {selectedQuote.notas}</div>
            <div><b>Usuario:</b> {selectedQuote.usuario}</div>
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
                  {(selectedQuote.items || []).map((item: any, idx: number) => {
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
            <div style={{ marginTop: 12, fontWeight: 'bold' }}>Total: ${selectedQuote.total?.toFixed(2)}</div>
            <button
              style={{ marginTop: 16, marginRight: 8 }}
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
                  // Cambiar estado de la cotización a 'VENDIDO'
                  await fetch(`/api/quotes/${selectedQuote.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'VENDIDO' }),
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
            <button onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}
