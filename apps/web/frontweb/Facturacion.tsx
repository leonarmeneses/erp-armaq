import React, { useEffect, useState } from 'react';
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
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding: 36, borderRadius: 20, minWidth: 370, maxWidth: 700, width: '100%', boxShadow: '0 8px 32px rgba(60,80,180,0.18)', border: '1.5px solid #dbeafe', position: 'relative', transition: 'box-shadow 0.2s' }}>
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
        <h3 style={{ margin: 0, marginBottom: 18, fontSize: 24, fontWeight: 700, color: '#2563eb', letterSpacing: 1, textAlign: 'center', textShadow: '0 2px 8px #e0e7ff' }}>Selecciona una Orden de Venta</h3>
        {loading ? <div>Cargando órdenes...</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16, background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ border:'1px solid #bbdefb', padding:10, color:'#1976d2' }}>Folio</th>
                <th style={{ border:'1px solid #bbdefb', padding:10, color:'#1976d2' }}>Cliente</th>
                <th style={{ border:'1px solid #bbdefb', padding:10, color:'#1976d2' }}>Total</th>
                <th style={{ border:'1px solid #bbdefb', padding:10, color:'#1976d2' }}></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.filter((o: any) => !o.invoices || o.invoices.length === 0).map((o: any, idx: number) => (
                <tr key={o.id} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ border:'1px solid #e3f2fd', padding:10 }}>{o.folio}</td>
                  <td style={{ border:'1px solid #e3f2fd', padding:10 }}>{o.client?.name || clientes.find((c: any) => c.id === o.clientId)?.name || ''}</td>
                  <td style={{ border:'1px solid #e3f2fd', padding:10 }}>{o.total}</td>
                  <td style={{ border:'1px solid #e3f2fd', padding:10 }}>
                    <button
                      onClick={() => onSelect(o)}
                      style={{
                        background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)'
                      }}
                    >
                      Elegir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  if (loading) return <div style={{ background:'#fff', padding:32, borderRadius:16, minWidth:400, maxWidth:600, boxShadow:'0 4px 24px rgba(30,40,80,0.10)' }}>Cargando folio...</div>;
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding: 36, borderRadius: 20, minWidth: 370, maxWidth: 600, width: '100%', boxShadow: '0 8px 32px rgba(60,80,180,0.18)', border: '1.5px solid #dbeafe', position: 'relative', transition: 'box-shadow 0.2s' }}>
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
        <h3 style={{ textAlign:'center', color:'#2563eb', fontWeight:700, marginBottom:24, letterSpacing:1, textShadow:'0 2px 8px #e0e7ff' }}>Nueva Factura</h3>
        <div style={{ display:'flex', gap:16, marginBottom:18 }}>
          <div style={{ flex:1 }}><b>Folio:</b> <span style={{ background:'#f1f5fa', borderRadius:6, padding:'6px 14px', border:'1.5px solid #cbd5e1', fontWeight:500 }}>{folio}</span></div>
          <div style={{ flex:1 }}><b>Fecha:</b> <span style={{ background:'#f1f5fa', borderRadius:6, padding:'6px 14px', border:'1.5px solid #cbd5e1', fontWeight:500 }}>{new Date().toISOString().slice(0,10)}</span></div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Tipo de pago<br/>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} required style={{ width:'100%', borderRadius:7, padding:'8px 12px', fontSize:16, background:'#f1f5fa', border:'1.5px solid #cbd5e1', outlineColor:'#2563eb' }}>
              <option value="">Selecciona un tipo de pago</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA DEBITO">Tarjeta Débito</option>
              <option value="TARJETA CREDITO">Tarjeta Crédito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 14 }}><b>PDF:</b> <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'6px 8px', background:'#f8fafc' }} /></div>
        <div style={{ marginBottom: 14 }}><b>XML:</b> <input type="file" accept="text/xml,application/xml" onChange={e => setXmlFile(e.target.files?.[0] || null)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'6px 8px', background:'#f8fafc' }} /></div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:24 }}>
          <button
            type="submit"
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
          >
            Crear Factura
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
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
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
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Facturación</h2>
          {rol !== 'VENTAS' && (
            <button
              style={{
                marginBottom: 16,
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
              }}
              onClick={() => setShowNuevaFactura(true)}
            >
              Nueva Factura
            </button>
          )}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Folio</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Orden de Venta</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Tipo de pago</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Estado</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>PDF</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>XML</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}></th>
            </tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <tr key={f.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.folio}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.saleOrder?.folio || ''}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.client?.name || ''}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.paymentMethod || '-'}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.status}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  {/* Botón Descargar PDF */}
                  {f.pdfUrl ? (
                    <a
                      href={f.pdfUrl}
                      download
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                        textDecoration: 'none',
                        textAlign: 'center'
                      }}
                    >
                      PDF
                    </a>
                  ) : (
                    <span style={{ color: '#aaa' }}>Sin PDF</span>
                  )}
                </td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  {/* Botón Descargar XML */}
                  {f.xmlUrl ? (
                    <a
                      href={f.xmlUrl}
                      download
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                        textDecoration: 'none',
                        textAlign: 'center'
                      }}
                    >
                      XML
                    </a>
                  ) : (
                    <span style={{ color: '#aaa' }}>Sin XML</span>
                  )}
                </td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{f.createdAt?.slice(0,10)}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  {/* Botón Ver PDF */}
                  {f.pdfUrl ? (
                    <a
                      href={f.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 18px',
                        fontWeight: 500,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
                        textDecoration: 'none',
                        textAlign: 'center'
                      }}
                    >
                      Ver
                    </a>
                  ) : (
                    <span style={{ color: '#aaa' }}>Sin PDF</span>
                  )}
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
      </div>
    </div>
  );
}
