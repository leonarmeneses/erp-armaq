import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CotizacionDetallePDFView, { CotizacionDetalle } from './CotizacionDetallePDFView';

export default function Cotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [showView, setShowView] = useState<{ open: boolean, cotizacion?: any }>({ open: false });
  const [showEdit, setShowEdit] = useState<{ open: boolean, cotizacion?: any }>({ open: false });
  const [filtroSucursal, setFiltroSucursal] = useState('TODAS');

  useEffect(() => {
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        setCotizaciones(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar cotizaciones');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : data.data || []));
  }, []);

  const handleNuevaCotizacion = () => setShowForm(true);

  const saveCotizacion = async (data: any) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en la respuesta del servidor');
      }
      setShowForm(false);
      alert('Cotización creada correctamente');
      // Recargar cotizaciones
      fetch('/api/quotes')
        .then(res => res.json())
        .then(data => setCotizaciones(data));
    } catch (e: any) {
      alert('Error al guardar cotización: ' + (e.message || e));
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(c =>
    filtroSucursal === 'TODAS' ? true : c.sucursal === filtroSucursal
  );

  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Cotizaciones</h2>
          {/* Botón Nueva Cotización */}
          <button
            onClick={handleNuevaCotizacion}
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
            Nueva Cotización
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
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
              <thead>
                <tr style={{ background: '#e3f2fd' }}>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Folio</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Total</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Estado</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Ver</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Editar</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesFiltradas.map(c => {
                  let clienteNombre = c.client?.name;
                  if (!clienteNombre) {
                    const cli = clientes.find((cl: any) => cl.id === c.clientId);
                    clienteNombre = cli ? cli.name : c.clientId;
                  }
                  // Calcular el total sumando los productos si existen, si no usar c.total
                  let total = 0;
                  if (Array.isArray(c.items) && c.items.length > 0 && Array.isArray(c.productos)) {
                    total = c.items.reduce((acc: number, item: { productId: string; quantity: number }) => {
                      const prod = c.productos.find((p: any) => p.id === item.productId);
                      return acc + (prod ? prod.price * item.quantity : 0);
                    }, 0);
                  } else if (typeof c.total === 'number') {
                    total = c.total;
                  }
                  return (
                    <tr key={c.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{c.folio}</td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{clienteNombre}</td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>${total.toFixed(2)}</td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                        {c.status === 'VENDIDO' ? 'Vendido' : c.status === 'PENDING' ? 'Pendiente' : c.status}
                      </td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{c.createdAt?.slice(0,10)}</td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                        {/* Botón Ver */}
                        <button onClick={() => setShowView({ open: true, cotizacion: c })} style={{
                          background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.08)',
                          marginRight: 8
                        }}>
                          Ver
                        </button>
                      </td>
                      <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                        {/* Botón Editar */}
                        <button onClick={() => setShowEdit({ open: true, cotizacion: c })} style={{
                          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                        }}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {showForm && (
          <NuevaCotizacionForm onSave={saveCotizacion} onCancel={() => setShowForm(false)} clientes={clientes} />
        )}
        {showView.open && (
          <VerCotizacionModal cotizacion={showView.cotizacion} onClose={() => setShowView({ open: false })} clientes={clientes} />
        )}
        {showEdit.open && (
          <EditarCotizacionModal
            cotizacion={showEdit.cotizacion}
            onClose={() => setShowEdit({ open: false })}
            clientes={clientes}
            onSave={(updated, isEdit) => {
              if (isEdit) {
                setCotizaciones(cotizaciones => cotizaciones.map(c => c.id === updated.id ? updated : c));
              } else {
                setCotizaciones(cotizaciones => [updated, ...cotizaciones]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function NuevaCotizacionForm({ onSave, onCancel, clientes }: { onSave: (data: any) => void, onCancel: () => void, clientes: any[] }) {
  const [productos, setProductos] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [notas, setNotas] = useState('');
  const usuario = localStorage.getItem('usuario') || '';
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProductos(data));
  }, []);

  // Calcular total
  const total = items.reduce((acc, item) => {
    const prod = productos.find((p: any) => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems(items => items.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Agregar subtotal a cada item
    const itemsConSubtotal = items.map(item => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return {
        ...item,
        subtotal: prod ? prod.price * item.quantity : 0,
      };
    });
    onSave({ clientId, items: itemsConSubtotal, total, fecha, notas, usuario });
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding:32, borderRadius:18, minWidth:400, maxWidth:800, width:'100%', boxShadow:'0 8px 32px rgba(60,80,180,0.18)', border:'1.5px solid #dbeafe', position:'relative', transition:'box-shadow 0.2s' }}>
        <h3 style={{
          margin: 0,
          marginBottom: 18,
          fontSize: 24,
          fontWeight: 700,
          color: '#2563eb',
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 2px 8px #e0e7ff'
        }}>Nueva Cotización</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px 28px', marginBottom: 18 }}>
          <div>
            <label style={{ fontWeight: 500 }}>Cliente:<br/>
              <select value={clientId} onChange={e=>setClientId(e.target.value)} required style={{ width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16, background:'#f1f5fa', outlineColor:'#2563eb' }}>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Fecha:<br/>
              <input type="date" value={fecha} readOnly disabled style={{ background:'#eee', width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16 }} />
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Vendedor:<br/>
              <input value={usuario} readOnly style={{ background:'#eee', width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16 }} />
            </label>
          </div>
        </div>
        <div style={{ marginBottom:18 }}>
          <b style={{ color:'#1976d2' }}>Productos:</b>
          {items.map((item, idx) => (
            <div key={idx} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:6 }}>
              <select value={item.productId} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>handleItemChange(idx, 'productId', e.target.value)} required style={{ flex:2, border:'1.5px solid #cbd5e1', borderRadius:7, padding:'7px 10px', fontSize:15, background:'#f8fafc', outlineColor:'#2563eb' }}>
                <option value="">Producto</option>
                {productos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.quantity} min={1} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleItemChange(idx, 'quantity', Number(e.target.value.replace(/\D/g, '')))} required style={{ width:60, border:'1.5px solid #cbd5e1', borderRadius:7, padding:'7px 10px', fontSize:15, outlineColor:'#2563eb' }} />
              <button type="button" onClick={()=>removeItem(idx)} disabled={items.length===1} style={{ background:'#e0e7ef', border:'1px solid #cbd5e1', borderRadius:6, padding:'4px 10px', fontWeight:600, color:'#e74c3c', fontSize:18, cursor:'pointer' }}>-</button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ marginTop:4, background:'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color:'#fff', border:'none', borderRadius:7, padding:'6px 18px', fontWeight:600, fontSize:15, cursor:'pointer', boxShadow:'0 1px 4px rgba(25, 118, 210, 0.08)' }}>+ Agregar producto</button>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontWeight: 500 }}>Notas:<br/>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} style={{ width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:15, background:'#f8fafc', marginTop:4, outlineColor:'#2563eb' }} />
          </label>
        </div>
        <div style={{ marginBottom:18, textAlign:'right' }}>
          <b style={{ fontSize:18, color:'#1976d2' }}>Total: ${total.toFixed(2)}</b>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.08)'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function VerCotizacionModal({ cotizacion, onClose, clientes }: { cotizacion: any, onClose: () => void, clientes: any[] }) {
  const [productos, setProductos] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: any[]) => setProductos(data));
  }, []);
  if (!cotizacion) return null;
  const cliente = clientes.find(c => c.id === cotizacion.clientId);

  // Adaptar datos a la estructura CotizacionDetalle
  const cotizacionDetalle: CotizacionDetalle = {
    folio: cotizacion.folio || '',
    fecha: cotizacion.createdAt?.slice(0,10) || '',
    clienteNombre: cliente ? cliente.name : cotizacion.clientId,
    clienteRFC: cliente ? cliente.rfc : '',
    clienteDireccion: cliente ? `${cliente.calle || ''} ${cliente.numExterior || ''}${cliente.numInterior ? ' Int. ' + cliente.numInterior : ''}, ${cliente.colonia || ''}, ${cliente.municipio || cliente.ciudad || ''}, ${cliente.estado || ''}, ${cliente.pais || ''}, CP ${cliente.codigoPostal || ''}`.replace(/(, )+/g, ', ').replace(/^, |, $/g, '').trim() : '',
    clienteTelefono: cliente ? cliente.phone : '',
    clienteEmail: cliente ? cliente.email : '',
    vendedor: cotizacion.usuario || cotizacion.vendedor || '-',
    productos: (cotizacion.items || []).map((item: { productId: string; quantity: number }) => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return {
        cantidad: item.quantity,
        descripcion: prod ? prod.name : '',
        unidad: prod ? prod.unit : '',
        precioUnitario: prod ? prod.price : 0,
        importe: prod ? prod.price * item.quantity : 0,
      };
    }),
    subtotal: (cotizacion.items || []).reduce((acc: number, item: { productId: string; quantity: number }) => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0),
    iva: Math.round(((cotizacion.items || []).reduce((acc: number, item: { productId: string; quantity: number }) => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0) * 0.16) * 100) / 100, // IVA 16% redondeado a 2 decimales
    total: (cotizacion.items || []).reduce((acc: number, item: { productId: string; quantity: number }) => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0) * 1.16,
    observaciones: cotizacion.notas,
    vigencia: cotizacion.vigencia || '15 días',
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'none', padding:0, borderRadius:18, minWidth:400, maxWidth:800, width:'100%', boxShadow:'none', border:'none', position:'relative' }}>
        <CotizacionDetallePDFView cotizacion={cotizacionDetalle} />
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 18 }}>
          <button onClick={onClose} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(231, 76, 60, 0.08)' }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function EditarCotizacionModal({ cotizacion, onClose, clientes, onSave }: { cotizacion: any, onClose: () => void, clientes: any[], onSave: (data: any, isEdit?: boolean) => void }) {
  const [productos, setProductos] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>(cotizacion.clientId || '');
  const [fecha, setFecha] = useState<string>(cotizacion.createdAt ? cotizacion.createdAt.slice(0,10) : '');
  const [notas, setNotas] = useState<string>(cotizacion.notas || '');
  const [usuario] = useState<string>(cotizacion.usuario || '');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>(Array.isArray(cotizacion.items) ? cotizacion.items.map((item: any) => ({ ...item })) : [{ productId: '', quantity: 1 }]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: any[]) => setProductos(data));
  }, []);

  // Calcular total
  const total = items.reduce((acc: number, item: { productId: string; quantity: number }) => {
    const prod = productos.find((p: any) => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((items: { productId: string; quantity: number }[]) => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItems((items: { productId: string; quantity: number }[]) => [...items, { productId: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems((items: { productId: string; quantity: number }[]) => items.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Agregar subtotal a cada item
    const itemsConSubtotal = items.map(item => {
      const prod = productos.find((p: any) => p.id === item.productId);
      return {
        ...item,
        subtotal: prod ? prod.price * item.quantity : 0,
      };
    });
    // Llamar a la API para actualizar la cotización existente
    try {
      const res = await fetch(`/api/quotes/${cotizacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, items: itemsConSubtotal, total, fecha, notas, usuario }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error al actualizar cotización: ' + (err.error || 'Error desconocido'));
        return;
      }
      onSave(await res.json(), true); // true = edición
      onClose();
    } catch (e: any) {
      alert('Error al actualizar cotización: ' + (e.message || e));
    }
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding:32, borderRadius:18, minWidth:400, maxWidth:800, width:'100%', boxShadow:'0 8px 32px rgba(60,80,180,0.18)', border:'1.5px solid #dbeafe', position:'relative', transition:'box-shadow 0.2s' }}>
        <h3 style={{
          margin: 0,
          marginBottom: 18,
          fontSize: 24,
          fontWeight: 700,
          color: '#2563eb',
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 2px 8px #e0e7ff'
        }}>Editar Cotización</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px 28px', marginBottom: 18 }}>
          <div>
            <label style={{ fontWeight: 500 }}>Cliente:<br/>
              <select value={clientId} onChange={e=>setClientId(e.target.value)} required style={{ width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16, background:'#f1f5fa', outlineColor:'#2563eb' }}>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Fecha:<br/>
              <input type="date" value={fecha} readOnly disabled style={{ background:'#eee', width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16 }} />
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Vendedor:<br/>
              <input value={usuario} readOnly style={{ background:'#eee', width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:16 }} />
            </label>
          </div>
        </div>
        <div style={{ marginBottom:18 }}>
          <b style={{ color:'#1976d2' }}>Productos:</b>
          {items.map((item: { productId: string; quantity: number }, idx: number) => (
            <div key={idx} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:6 }}>
              <select value={item.productId} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>handleItemChange(idx, 'productId', e.target.value)} required style={{ flex:2, border:'1.5px solid #cbd5e1', borderRadius:7, padding:'7px 10px', fontSize:15, background:'#f8fafc', outlineColor:'#2563eb' }}>
                <option value="">Producto</option>
                {productos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.quantity} min={1} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>handleItemChange(idx, 'quantity', Number(e.target.value.replace(/\D/g, '')))} required style={{ width:60, border:'1.5px solid #cbd5e1', borderRadius:7, padding:'7px 10px', fontSize:15, outlineColor:'#2563eb' }} />
              <button type="button" onClick={()=>removeItem(idx)} disabled={items.length===1} style={{ background:'#e0e7ef', border:'1px solid #cbd5e1', borderRadius:6, padding:'4px 10px', fontWeight:600, color:'#e74c3c', fontSize:18, cursor:'pointer' }}>-</button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ marginTop:4, background:'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color:'#fff', border:'none', borderRadius:7, padding:'6px 18px', fontWeight:600, fontSize:15, cursor:'pointer', boxShadow:'0 1px 4px rgba(25, 118, 210, 0.08)' }}>+ Agregar producto</button>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontWeight: 500 }}>Notas:<br/>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} style={{ width:'100%', border:'1.5px solid #cbd5e1', borderRadius:7, padding:'8px 12px', fontSize:15, background:'#f8fafc', marginTop:4, outlineColor:'#2563eb' }} />
          </label>
        </div>
        <div style={{ marginBottom:18, textAlign:'right' }}>
          <b style={{ fontSize:18, color:'#1976d2' }}>Total: ${total.toFixed(2)}</b>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.08)'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
