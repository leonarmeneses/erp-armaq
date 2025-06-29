import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NuevaFacturaModal({ onClose, onSelect }: { onClose: () => void, onSelect: (orden: any) => void }) {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('/api/saleorders').then(res => res.json()),
      fetch('/api/clients').then(res => res.json())
    ]).then(([ordenesData, clientesData]) => {
      setOrdenes(ordenesData);
      setClientes(Array.isArray(clientesData) ? clientesData : clientesData.data || []);
      setLoading(false);
    });
  }, []);
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:600 }}>
        <h3>Selecciona una Orden de Venta</h3>
        {loading ? <div>Cargando órdenes...</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16 }}>
            <thead>
              <tr>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Folio</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Cliente</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Total</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.filter((o: any) => !o.invoices || o.invoices.length === 0).map((o: any) => (
                <tr key={o.id}>
                  <td style={{ border:'1px solid #ccc', padding:4 }}>{o.folio}</td>
                  <td style={{ border:'1px solid #ccc', padding:4 }}>{o.client?.name || clientes.find((c: any) => c.id === o.clientId)?.name || ''}</td>
                  <td style={{ border:'1px solid #ccc', padding:4 }}>{o.total}</td>
                  <td style={{ border:'1px solid #ccc', padding:4 }}>
                    <button onClick={() => onSelect(o)}>Elegir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function FormularioFactura({ orden, onClose, onFacturaCreada }: { orden: any, onClose: () => void, onFacturaCreada: () => void }) {
  const [folio, setFolio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File|null>(null);
  const [xmlFile, setXmlFile] = useState<File|null>(null);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        // Buscar el mayor folio FA-n
        let maxNum = 0;
        for (const f of data) {
          if (f.folio && /^FA-\d+$/.test(f.folio)) {
            const num = parseInt(f.folio.replace('FA-', ''));
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
        setFolio(`FA-${maxNum + 1}`);
        setLoading(false);
      });
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('folio', folio);
    formData.append('clientId', orden.clientId);
    formData.append('saleOrderId', orden.id);
    formData.append('total', orden.total);
    formData.append('createdAt', new Date().toISOString());
    formData.append('status', 'FACTURADO');
    if (pdfFile) formData.append('pdf', pdfFile);
    if (xmlFile) formData.append('xml', xmlFile);
    formData.append('paymentMethod', paymentMethod);
    // Si hay items, agregarlos como JSON
    formData.append('items', JSON.stringify(orden.items));
    const res = await fetch('/api/invoices', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      alert('Factura creada correctamente');
      onFacturaCreada();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error || 'Error al crear factura');
    }
  };
  if (loading) return <div style={{ background:'#fff', padding:24, borderRadius:8 }}>Cargando folio...</div>;
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Nueva Factura</h3>
        <div><b>Folio:</b> {folio}</div>
        <div style={{ marginBottom: 12 }}>
          <label><b>Tipo de pago:</b>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required>
              <option value="">Selecciona un tipo de pago</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA DEBITO">Tarjeta Débito</option>
              <option value="TARJETA CREDITO">Tarjeta Crédito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </label>
        </div>
        <div><b>PDF:</b> <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} required /></div>
        <div><b>XML:</b> <input type="file" accept="text/xml,application/xml" onChange={e => setXmlFile(e.target.files?.[0] || null)} required /></div>
        <div><b>Fecha:</b> {new Date().toISOString().slice(0,10)}</div>
        <div style={{ marginTop: 16 }}>
          <button type="submit">Crear Factura</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}

function VerFacturaModal({ factura, onClose }: { factura: any, onClose: () => void }) {
  if (!factura) return null;
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Detalle de Factura</h3>
        <div><b>Folio:</b> {factura.folio}</div>
        <div><b>Cliente:</b> {factura.client?.name || factura.clientId}</div>
        <div><b>Tipo de pago:</b> {factura.paymentMethod || '-'}</div>
        <div><b>Estado:</b> {factura.status}</div>
        <div><b>PDF:</b> <a href={factura.pdfUrl || '#'} target="_blank" rel="noopener noreferrer">PDF</a></div>
        <div><b>XML:</b> <a href={factura.xmlUrl || '#'} target="_blank" rel="noopener noreferrer">XML</a></div>
        <div><b>Fecha:</b> {factura.createdAt?.slice(0,10)}</div>
        <div style={{ marginTop: 16 }}>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function Facturacion() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [showNuevaFactura, setShowNuevaFactura] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setFacturas(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar facturas');
        setLoading(false);
      });
  }, []);

  const handleSelectOrden = (orden: any) => {
    console.log('Orden seleccionada:', orden);
    setModalOpen(false);
  };

  const handleFacturaCreada = () => {
    // Actualizar la lista de facturas
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setFacturas(data));
  };

  // Obtener el rol del usuario
  const rol = (() => {
    try {
      const userData = localStorage.getItem('usuario_data');
      if (userData) return JSON.parse(userData).role;
    } catch {}
    return '';
  })();

  if (loading) return <div>Cargando facturas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Facturación</h2>
      {rol !== 'VENTAS' && (
        <button style={{ marginBottom: 16 }} onClick={() => setShowNuevaFactura(true)}>Nueva Factura</button>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Orden de Venta</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Tipo de pago</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>PDF</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>XML</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {facturas.map(f => (
            <tr key={f.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.folio}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.saleOrder?.folio || ''}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.client?.name || ''}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.paymentMethod || '-'}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.status}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <a href={f.pdfUrl || '#'} target="_blank" rel="noopener noreferrer">PDF</a>
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <a href={f.xmlUrl || '#'} target="_blank" rel="noopener noreferrer">XML</a>
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.createdAt?.slice(0,10)}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => setFacturaSeleccionada(f)}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showNuevaFactura && (
        <NuevaFacturaModal onClose={() => setShowNuevaFactura(false)} onSelect={orden => { setOrdenSeleccionada(orden); setShowNuevaFactura(false); }} />
      )}
      {ordenSeleccionada && (
        <FormularioFactura orden={ordenSeleccionada} onClose={() => setOrdenSeleccionada(null)} onFacturaCreada={() => { setOrdenSeleccionada(null); setFacturas([]); setLoading(true); fetch('/api/invoices').then(res => res.json()).then(data => { setFacturas(data); setLoading(false); }); }} />
      )}
      {facturaSeleccionada && (
        <VerFacturaModal factura={facturaSeleccionada} onClose={() => setFacturaSeleccionada(null)} />
      )}
    </div>
  );
}
