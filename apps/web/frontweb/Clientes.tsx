import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function generarCodigoCliente() {
  // Ejemplo: CLI-20250628-XXXX
  const fecha = new Date();
  const yyyyMMdd = fecha.toISOString().slice(0,10).replace(/-/g,"");
  const random = Math.random().toString(36).slice(2,6).toUpperCase();
  return `CLI-${yyyyMMdd}-${random}`;
}

function ClienteForm({ initial, onSave, onCancel }: { initial?: any, onSave: (data: any) => void, onCancel: () => void }) {
  // Solo mostrar el código si existe (modo edición)
  const code = initial?.code || '';
  const [name, setName] = useState(initial?.name || '');
  const [rfc, setRfc] = useState(initial?.rfc || '');
  const [email, setEmail] = useState(initial?.email || '');
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={e => { e.preventDefault(); onSave({ name, rfc, email }); }} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:300 }}>
        <h3>{initial ? 'Editar cliente' : 'Añadir cliente'}</h3>
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
          <label>RFC:<br/><input value={rfc} onChange={e=>setRfc(e.target.value)} required /></label>
        </div>
        <div style={{ marginBottom:8 }}>
          <label>Email:<br/><input value={email} onChange={e=>setEmail(e.target.value)} type="email" /></label>
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

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCliente, setEditCliente] = useState<any>(null);
  const [deleteCliente, setDeleteCliente] = useState<any>(null);

  const fetchClientes = () => {
    setLoading(true);
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => {
        setClientes(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar clientes');
        setLoading(false);
      });
  };
  useEffect(() => { fetchClientes(); }, []);

  const handleAdd = () => { setEditCliente(null); setShowForm(true); };
  const handleEdit = (cliente: any) => { setEditCliente(cliente); setShowForm(true); };
  const handleDelete = (cliente: any) => { setDeleteCliente(cliente); };

  const saveCliente = async (data: any) => {
    try {
      let res;
      if (editCliente) {
        res = await fetch(`/api/clients/${editCliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        // No enviar code al crear
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en la respuesta del servidor');
      }
      setShowForm(false);
      setEditCliente(null);
      fetchClientes();
    } catch (e: any) {
      alert('Error al guardar cliente: ' + (e.message || e));
    }
  };

  const confirmDelete = async () => {
    try {
      await fetch(`/api/clients/${deleteCliente.id}`, { method: 'DELETE' });
      setDeleteCliente(null);
      fetchClientes();
    } catch {
      alert('Error al eliminar cliente');
    }
  };

  if (loading) return <div>Cargando clientes...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Clientes</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleAdd}>Añadir</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8, display: 'none' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Código</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Nombre</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>RFC</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td style={{ border: '1px solid #ccc', padding: 8, display: 'none' }}>{c.id}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.code}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.rfc}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{c.email}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => handleEdit(c)} style={{ marginRight: 8 }}>Editar</button>
                <button onClick={() => handleDelete(c)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <ClienteForm initial={editCliente} onSave={saveCliente} onCancel={()=>{setShowForm(false); setEditCliente(null);}} />
      )}
      {deleteCliente && (
        <ConfirmDialog message={`¿Eliminar cliente ${deleteCliente.name}?`} onConfirm={confirmDelete} onCancel={()=>setDeleteCliente(null)} />
      )}
    </div>
  );
}
