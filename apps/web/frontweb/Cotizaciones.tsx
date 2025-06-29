import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cotizaciones() {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [showView, setShowView] = useState<{ open: boolean, cotizacion?: any }>({ open: false });
  const [showEdit, setShowEdit] = useState<{ open: boolean, cotizacion?: any }>({ open: false });

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

  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Cotizaciones</h2>
      <button onClick={handleNuevaCotizacion} style={{ marginBottom: 16 }}>Nueva Cotización</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Ver</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Editar</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map(c => {
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
              <tr key={c.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.folio}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{clienteNombre}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>${total.toFixed(2)}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  {c.status === 'VENDIDO' ? 'Vendido' : c.status === 'PENDING' ? 'Pendiente' : c.status}
                </td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.createdAt?.slice(0,10)}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button onClick={() => setShowView({ open: true, cotizacion: c })}>Ver</button>
                </td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button onClick={() => setShowEdit({ open: true, cotizacion: c })}>Editar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Nueva Cotización</h3>
        <div style={{ marginBottom:8 }}>
          <label>Cliente:<br/>
            <select value={clientId} onChange={e=>setClientId(e.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Fecha:<br/>
            <input type="date" value={fecha} readOnly disabled style={{ background:'#eee' }} />
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Usuario:<br/><input value={usuario} readOnly style={{ background:'#eee' }} /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Notas:<br/><textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} style={{ width:'100%' }} /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <b>Productos:</b>
          {items.map((item, idx) => (
            <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
              <select value={item.productId} onChange={e=>handleItemChange(idx, 'productId', e.target.value)} required style={{ flex:2 }}>
                <option value="">Producto</option>
                {productos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <input type="number" value={item.quantity} min={1} onChange={e=>handleItemChange(idx, 'quantity', Number(e.target.value))} required style={{ width:60 }} />
              <button type="button" onClick={()=>removeItem(idx)} disabled={items.length===1}>-</button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ marginTop:4 }}>+ Agregar producto</button>
        </div>
        <div style={{ marginBottom:8 }}>
          <b>Total: ${total.toFixed(2)}</b>
        </div>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel} style={{ marginLeft:8 }}>Cancelar</button>
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
  // Calcular total real sumando los productos
  const totalCalculado = (cotizacion.items || []).reduce((acc: number, item: { productId: string; quantity: number }) => {
    const prod = productos.find((p: any) => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Detalle de Cotización</h3>
        <div><b>Folio:</b> {cotizacion.folio}</div>
        <div><b>Cliente:</b> {cliente ? cliente.name : cotizacion.clientId}</div>
        <div><b>Fecha:</b> {cotizacion.createdAt?.slice(0,10)}</div>
        <div><b>Notas:</b> {cotizacion.notas}</div>
        <div><b>Usuario:</b> {cotizacion.usuario}</div>
        <div><b>Productos:</b>
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
            <thead>
              <tr>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Código</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Nombre</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Cantidad</th>
                <th style={{ border:'1px solid #ccc', padding:4 }}>Costo</th>
              </tr>
            </thead>
            <tbody>
              {(cotizacion.items || []).map((item: { productId: string; quantity: number }, idx: number) => {
                const prod = productos.find((p: any) => p.id === item.productId);
                return (
                  <tr key={idx}>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{prod ? prod.code : ''}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{prod ? prod.name : ''}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>{item.quantity}</td>
                    <td style={{ border:'1px solid #ccc', padding:4 }}>${prod ? prod.price.toFixed(2) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontWeight: 'bold' }}>Total: ${totalCalculado.toFixed(2)}</div>
        <button onClick={onClose} style={{ marginTop: 16 }}>Cerrar</button>
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
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:500 }}>
        <h3>Editar Cotización</h3>
        <div style={{ marginBottom:8 }}>
          <label>Cliente:<br/>
            <select value={clientId} onChange={e=>setClientId(e.target.value)} required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Fecha:<br/>
            <input type="date" value={fecha} readOnly disabled style={{ background:'#eee' }} />
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Usuario:<br/><input value={usuario} readOnly style={{ background:'#eee' }} /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Notas:<br/><textarea value={notas} onChange={e=>setNotas(e.target.value)} rows={2} style={{ width:'100%' }} /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <b>Productos:</b>
          {items.map((item: { productId: string; quantity: number }, idx: number) => (
            <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
              <select value={item.productId} onChange={e=>handleItemChange(idx, 'productId', e.target.value)} required style={{ flex:2 }}>
                <option value="">Producto</option>
                {productos.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
              <input type="number" value={item.quantity} min={1} onChange={e=>handleItemChange(idx, 'quantity', Number(e.target.value))} required style={{ width:60 }} />
              <button type="button" onClick={()=>removeItem(idx)} disabled={items.length===1}>-</button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ marginTop:4 }}>+ Agregar producto</button>
        </div>
        <div style={{ marginBottom:8 }}>
          <b>Total: ${total.toFixed(2)}</b>
        </div>
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={onClose} style={{ marginLeft:8 }}>Cancelar</button>
      </form>
    </div>
  );
}
