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
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={e => { e.preventDefault(); onSave({ name, type, price: price === '' ? null : parseFloat(price), unit, description }); }} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:300 }}>
        <h3>{initial ? 'Editar producto' : 'Añadir producto'}</h3>
        {code && (
          <div style={{ marginBottom:8 }}>
            <label>Código:<br/>
              <input value={code} readOnly style={{ background:'#eee' }} />
            </label>
          </div>
        )}
        <div style={{ marginBottom:8 }}>
          <label>Nombre:<br/><input value={name} onChange={e=>setName(e.target.value)} required /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Tipo:<br/>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="PRODUCT">Producto</option>
              <option value="SERVICE">Servicio</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Precio:<br/><input value={price} onChange={e=>setPrice(e.target.value)} required /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Unidad:<br/><input value={unit} onChange={e=>setUnit(e.target.value)} required /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Descripción:<br/><input value={description} onChange={e=>setDescription(e.target.value)} /></label>
        </div>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel} style={{ marginLeft:8 }}>Cancelar</button>
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
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={e => { e.preventDefault(); onSave({ productId, quantity, type: tipo, createdAt: fecha, createdBy: usuario }); }} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:300 }}>
        <h3>Movimiento de inventario</h3>
        <div style={{ marginBottom:8 }}>
          <label>Tipo de movimiento:<br/>
            <select value={tipo} onChange={e=>setTipo(e.target.value as any)} required>
              <option value="IN">Entrada</option>
              <option value="ADJUSTMENT">Ajuste</option>
              <option value="OUT">Salida</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Producto:<br/>
            <select value={productId} onChange={e=>setProductId(e.target.value)} required>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Cantidad:<br/><input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} min={1} required /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Fecha:<br/>
            <input type="date" value={fecha} readOnly disabled style={{ background:'#eee' }} />
          </label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Usuario:<br/><input value={usuario} readOnly style={{ background:'#eee' }} /></label>
        </div>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel} style={{ marginLeft:8 }}>Cancelar</button>
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
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Movimientos de Inventario</h2>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {rol !== 'VENTAS' && (
            <>
              <button onClick={handleAdd} style={{ marginBottom: 16, marginRight: 8 }}>Añadir producto</button>
              <button onClick={handleEntrada} style={{ marginBottom: 16 }}>Movimiento</button>
            </>
          )}
          <h3>Lista de productos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Código</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Nombre</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Tipo</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Precio</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Unidad</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.code}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.type}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.price}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.unit}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.stock ?? 0}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
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
          <h3>Movimientos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>ID</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Producto</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Tipo</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Cantidad</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.folio || m.id}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.product?.name || m.productId}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Salida' : m.type === 'ADJUSTMENT' ? 'Ajuste' : m.type}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.quantity}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.createdAt?.slice(0,10)}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.createdBy || '-'}</td>
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
  );
}
