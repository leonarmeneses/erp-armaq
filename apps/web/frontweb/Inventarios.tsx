import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductoForm({ initial, onSave, onCancel }: { initial?: any, onSave: (data: any) => void, onCancel: () => void }) {
  // Solo mostrar el código si existe (modo edición)
  const code = initial?.code || '';
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'PRODUCT');
  const [price, setPrice] = useState(initial?.price !== undefined ? String(initial.price) : '');
  const [unit, setUnit] = useState(initial?.unit || 'pieza');
  const [description, setDescription] = useState(initial?.description || '');
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={e => { e.preventDefault(); onSave({ name, type, price: price === '' ? null : parseFloat(price), unit, description }); }} style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding: 36, borderRadius: 20, minWidth: 340, maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(60,80,180,0.18)', border: '1.5px solid #dbeafe', position: 'relative', transition: 'box-shadow 0.2s' }}>
        <h3 style={{ textAlign:'center', color:'#2563eb', fontWeight:700, marginBottom:24, letterSpacing:1, textShadow:'0 2px 8px #e0e7ff' }}>{initial ? 'Editar producto' : 'Añadir producto'}</h3>
        {code && (
          <div style={{ marginBottom:14 }}>
            <label style={{ fontWeight:500, color:'#64748b' }}>Código<br/>
              <input value={code} readOnly style={{ background:'#eee', borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} />
            </label>
          </div>
        )}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Nombre<br/><input value={name} onChange={e=>setName(e.target.value)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} /></label>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Tipo<br/>
            <select value={type} onChange={e=>setType(e.target.value)} style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }}>
              <option value="PRODUCT">Producto</option>
              <option value="SERVICE">Servicio</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Precio<br/><input value={price} onChange={e=>setPrice(e.target.value)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} /></label>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Unidad<br/><input value={unit} onChange={e=>setUnit(e.target.value)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} /></label>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ fontWeight:500, color:'#64748b' }}>Descripción<br/><input value={description} onChange={e=>setDescription(e.target.value)} style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'100%' }} /></label>
        </div>
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
      </form>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:300 }}>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onCancel} style={{ marginLeft:8 }}>Cancelar</button>
      </div>
    </div>
  );
}

function EntradaForm({ productos, onSave, onCancel }: { productos: any[], onSave: (data: any) => void, onCancel: () => void }) {
  const [productId, setProductId] = useState(productos[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [fecha] = useState(new Date().toISOString().slice(0,10));
  const usuario = localStorage.getItem('usuario') || '';
  const [tipo, setTipo] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  // Inicializar sucursal según el rol y datos del usuario
  const [sucursal, setSucursal] = useState(() => {
    const userData = localStorage.getItem('usuario_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'ENCARGADO' && user.sucursal) {
          return user.sucursal;
        }
      } catch {}
    }
    return '';
  });
  const [productosSeleccionados, setProductosSeleccionados] = useState<{productId: string, cantidad: string}[]>([]);
  const [folioCompra, setFolioCompra] = useState('');
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [proveedorId, setProveedorId] = useState('');

  // Obtener rol y sucursal del usuario solo para lógica de UI
  let rol = '';
  const userData = localStorage.getItem('usuario_data');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      rol = user.role;
    } catch {}
  }

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => setProveedores(Array.isArray(data) ? data : data.data || []))
      .catch(() => setProveedores([]));
  }, []);

  const agregarProducto = () => {
    setProductosSeleccionados([...productosSeleccionados, { productId: '', cantidad: '' }]);
  };
  const actualizarProducto = (idx: number, campo: 'productId' | 'cantidad', valor: string) => {
    const copia = [...productosSeleccionados];
    copia[idx][campo] = valor;
    setProductosSeleccionados(copia);
  };
  const eliminarProducto = (idx: number) => {
    setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== idx));
  };

  // Si es ENCARGADO, fijar sucursal y deshabilitar select
  useEffect(() => {
    if (rol === 'ENCARGADO' && sucursal) {
      setSucursal(sucursal);
    }
  }, [rol, sucursal]);

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={e => { 
        e.preventDefault();
        // Transformar productosSeleccionados: cantidad -> quantity (number)
        const productosTransformados = productosSeleccionados.map(item => ({
          productId: item.productId,
          quantity: Number(item.cantidad)
        }));
        // Solo enviar el primer producto seleccionado (ajustar para el backend actual)
        const producto = productosTransformados[0];
        if (!producto || !producto.productId || !producto.quantity) {
          alert('Selecciona al menos un producto y cantidad válida');
          return;
        }
        onSave({
          productId: producto.productId,
          quantity: producto.quantity,
          type: tipo,
          createdAt: fecha,
          createdBy: usuario,
          sucursal,
          folioCompra,
          proveedorId,
          reason: '', // puedes ajustar si tienes campo de motivo
          cost: 0     // puedes ajustar si tienes campo de costo
        });
      }} style={{ background:'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)', padding: 36, borderRadius: 20, minWidth: 600, maxWidth: 900, width: '100%', boxShadow: '0 8px 32px rgba(60,80,180,0.18)', border: '1.5px solid #dbeafe', position: 'relative', transition: 'box-shadow 0.2s' }}>
        <h3 style={{ textAlign:'center', color:'#2563eb', fontWeight:700, marginBottom:24, letterSpacing:1, textShadow:'0 2px 8px #e0e7ff' }}>Añadir movimiento</h3>
        <div style={{ display:'flex', gap:32 }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Usuario<br/><input value={usuario} readOnly style={{ background:'#eee', borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:100, textAlign:'center' }} /></label>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Fecha<br/>
                <input type="date" value={fecha} readOnly disabled style={{ background:'#eee', borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:100, textAlign:'center' }} />
              </label>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Proveedor<br/>
                <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:120, textAlign:'center', textAlignLast:'center' }}>
                  <option value=''>Selecciona un proveedor</option>
                  {proveedores.map((prov: any) => (
                    <option key={prov.id} value={prov.id}>{prov.code} - {prov.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Sucursal<br/>
                <select
                  value={sucursal}
                  onChange={e => setSucursal(e.target.value)}
                  required
                  disabled={rol === 'ENCARGADO'}
                  style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:120, textAlign:'center', textAlignLast:'center', background: rol === 'ENCARGADO' ? '#eee' : undefined }}
                >
                  <option value=''>Selecciona una sucursal</option>
                  <option value='CDMX'>Sucursal CDMX</option>
                  <option value='PLAYA DEL CARMEN'>Sucursal PLAYA DEL CARMEN</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Tipo de movimiento<br/>
                <select value={tipo} onChange={e=>setTipo(e.target.value as any)} required style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:120, textAlign:'center', textAlignLast:'center' }}>
                  <option value="IN">Entrada</option>
                  <option value="OUT">Salida</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontWeight:500, color:'#64748b' }}>Folio de compra<br/>
                <input type="text" value={folioCompra} onChange={e => setFolioCompra(e.target.value)} placeholder="Folio de compra" style={{ borderRadius:7, border:'1.5px solid #cbd5e1', padding:'8px 12px', width:'auto', minWidth:120, textAlign:'center' }} />
              </label>
            </div>
          </div>
          <div style={{ flex:2 }}>
            <div style={{ marginBottom:14, fontWeight:500, color:'#64748b' }}>Productos y cantidades:</div>
            <table style={{ width:'100%', borderCollapse:'collapse', background:'#f8fafc', borderRadius:8, boxShadow:'0 2px 8px #e0e7ef', marginBottom:12 }}>
              <thead>
                <tr style={{ background:'#e3f2fd' }}>
                  <th style={{ border:'1px solid #bbdefb', padding:'8px 10px', color:'#1976d2', fontWeight:600 }}>Producto</th>
                  <th style={{ border:'1px solid #bbdefb', padding:'8px 10px', color:'#1976d2', fontWeight:600 }}>Cantidad</th>
                  <th style={{ border:'1px solid #bbdefb', padding:'8px 10px', color:'#1976d2', fontWeight:600 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((item, idx) => (
                  <tr key={idx} style={{ background:'#fff', transition:'background 0.2s' }}>
                    <td style={{ border:'1px solid #e3f2fd', padding:'8px 10px' }}>
                      <select value={item.productId} onChange={e => actualizarProducto(idx, 'productId', e.target.value)} required style={{ borderRadius:6, border:'1.5px solid #cbd5e1', padding:'7px 10px', minWidth:180, background:'#f8fafc' }}>
                        <option value=''>Selecciona producto</option>
                        {productos.filter(p => !productosSeleccionados.some((sel, i) => sel.productId === p.id && i !== idx)).map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ border:'1px solid #e3f2fd', padding:'8px 10px' }}>
                      <input type="text" value={item.cantidad} onChange={e => actualizarProducto(idx, 'cantidad', e.target.value)} required placeholder="Cantidad" style={{ borderRadius:6, border:'1.5px solid #cbd5e1', padding:'7px 10px', width:90, background:'#f8fafc' }} />
                    </td>
                    <td style={{ border:'1px solid #e3f2fd', padding:'8px 10px', textAlign:'center' }}>
                      <button type="button" onClick={() => eliminarProducto(idx)} style={{ background:'#e74c3c', color:'#fff', border:'none', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer' }}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={agregarProducto} style={{ background:'#1976d2', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontWeight:600, cursor:'pointer', marginTop:8 }}>Agregar producto</button>
          </div>
        </div>
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
      </form>
    </div>
  );
}

export default function Inventarios() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState<any>(null);
  const [deleteProducto, setDeleteProducto] = useState<any>(null);
  const [showEntrada, setShowEntrada] = useState(false);

  // Obtener el rol del usuario
  const rol = (() => {
    try {
      const userData = localStorage.getItem('usuario_data');
      if (userData) return JSON.parse(userData).role;
    } catch {}
    return '';
  })();

  const fetchMovimientos = () => {
    setLoading(true);
    fetch('/api/stockmovements')
      .then(res => res.json())
      .then(data => {
        setMovimientos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar inventarios');
        setLoading(false);
      });
  };
  const fetchProductos = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(() => setProductos([]));
  };
  useEffect(() => { fetchMovimientos(); fetchProductos(); }, []);

  const handleAdd = () => setShowForm(true);
  const handleEdit = (producto: any) => { setEditProducto(producto); setShowForm(true); };
  const handleDelete = (producto: any) => { setDeleteProducto(producto); };
  const handleEntrada = () => setShowEntrada(true);

  const saveProducto = async (data: any) => {
    try {
      let res;
      if (editProducto) {
        res = await fetch(`/api/products/${editProducto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { error: 'Error en la respuesta del servidor' };
        }
        throw new Error(err.error || 'Error en la respuesta del servidor');
      }
      setShowForm(false);
      setEditProducto(null);
      alert(editProducto ? 'Producto editado correctamente' : 'Producto añadido correctamente');
      fetchProductos();
    } catch (e: any) {
      alert('Error al guardar producto: ' + (e.message || e));
    }
  };
  const confirmDelete = async () => {
    try {
      await fetch(`/api/products/${deleteProducto.id}`, { method: 'DELETE' });
      setDeleteProducto(null);
      fetchProductos();
    } catch {
      alert('Error al eliminar producto');
    }
  };
  const saveEntrada = async (data: any) => {
    try {
      const res = await fetch('/api/stockmovements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Usar el tipo seleccionado en el formulario
      });
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        result = { error: 'Respuesta inesperada del servidor' };
      }
      if (!res.ok) {
        throw new Error(result.error || 'Error en la respuesta del servidor');
      }
      setShowEntrada(false);
      alert('Entrada registrada correctamente');
      fetchProductos();
      fetchMovimientos();
    } catch (e: any) {
      alert('Error al registrar entrada: ' + (e.message || e));
    }
  };

  if (loading) return <div>Cargando inventarios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Inventarios</h2>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 16 }}>
              <h3 style={{ margin: 0 }}>Lista de productos</h3>
              {rol !== 'VENTAS' && rol !== 'ENCARGADO' && (
                <button
                  onClick={handleAdd}
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
                    marginLeft: 8
                  }}
                >
                  Añadir producto
                </button>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef', marginBottom: 24 }}>
              <thead>
                <tr style={{ background: '#e3f2fd' }}>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Código</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Nombre</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Tipo</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Precio</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Unidad</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cantidad</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.code}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.name}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.type}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>${p.price}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.unit}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.stock ?? 0}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                      {rol !== 'VENTAS' && (
                        <button onClick={() => handleEdit(p)} style={{ marginRight: 8 }}>Editar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 16 }}>
              <h3 style={{ margin: 0 }}>Movimientos</h3>
              {rol !== 'VENTAS' && (
                <button
                  onClick={handleEntrada}
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
                    marginLeft: 8
                  }}
                >
                  Añadir movimiento
                </button>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
              <thead>
                <tr style={{ background: '#e3f2fd' }}>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>ID</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Producto</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Tipo</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cantidad</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
                  <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.folio || m.id}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.product?.name || m.productId}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                      {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Salida' : m.type === 'ADJUSTMENT' ? 'Ajuste' : m.type}
                    </td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.quantity}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.createdAt?.slice(0,10)}</td>
                    <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{m.createdBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showForm && (
          <ProductoForm initial={editProducto} onSave={saveProducto} onCancel={()=>{setShowForm(false); setEditProducto(null);}} />
        )}
        {deleteProducto && (
          <ConfirmDialog message={`¿Eliminar producto ${deleteProducto.name}?`} onConfirm={confirmDelete} onCancel={()=>setDeleteProducto(null)} />
        )}
        {showEntrada && (
          <EntradaForm productos={productos} onSave={saveEntrada} onCancel={()=>setShowEntrada(false)} />
        )}
      </div>
    </div>
  );
}
