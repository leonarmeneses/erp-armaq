import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormularioUsuario({ onClose, onUsuarioCreado, initial }: { onClose: () => void, onUsuarioCreado: () => void, initial?: any }) {
  const [tipo, setTipo] = useState(initial?.role || '');
  const [sucursal, setSucursal] = useState(initial?.sucursal || '');
  const [nombre, setNombre] = useState(initial?.name || '');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState(initial?.phone || '');
  const [correo, setCorreo] = useState(initial?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let res;
    if (initial) {
      // Editar usuario
      res = await fetch(`/api/users/${initial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: tipo,
          sucursal,
          name: nombre,
          password: password || undefined, // Solo enviar si se cambia
          phone: telefono,
          email: correo
        })
      });
    } else {
      // Crear usuario
      res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: tipo,
          sucursal,
          name: nombre,
          password,
          phone: telefono,
          email: correo
        })
      });
    }
    setLoading(false);
    if (res.ok) {
      onUsuarioCreado();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error || 'Error al guardar usuario');
    }
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:400 }}>
        <h3>{initial ? 'Editar' : 'Nuevo'} Usuario</h3>
        <div style={{ marginBottom: 12 }}>
          <label>Tipo de usuario:<br/>
            <select value={tipo} onChange={e => setTipo(e.target.value)} required style={{ width:'100%' }}>
              <option value=''>Selecciona un tipo</option>
              <option value='ADMIN'>ADMIN</option>
              <option value='ENCARGADO'>ENCARGADO</option>
              <option value='VENTAS'>VENTAS</option>
              <option value='FINANZAS'>FINANZAS</option>
              <option value='MARKETING'>MARKETING</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Sucursal:<br/>
            <select value={sucursal} onChange={e => setSucursal(e.target.value)} required style={{ width:'100%' }}>
              <option value=''>Selecciona una sucursal</option>
              <option value='CDMX'>Sucursal CDMX</option>
              <option value='PLAYA DEL CARMEN'>Sucursal PLAYA DEL CARMEN</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre:<br/>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña:<br/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Teléfono:<br/>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} required style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Correo:<br/>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required style={{ width:'100%' }} />
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
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
          >
            {initial ? 'Guardar cambios' : 'Crear usuario'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: 8,
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.08)'
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

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const recargarUsuarios = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { setUsuarios(data); setLoading(false); })
      .catch(() => { setError('Error al cargar usuarios'); setLoading(false); });
  };

  useEffect(() => {
    recargarUsuarios();
  }, []);

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Gestión de Usuarios</h2>
          {/* Botón Añadir usuario */}
          <button
            onClick={() => setShowForm(true)}
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
            Añadir usuario
          </button>
        </div>
        {showForm && <FormularioUsuario onClose={() => setShowForm(false)} onUsuarioCreado={recargarUsuarios} />}
        {editUser && <FormularioUsuario initial={editUser} onClose={() => setEditUser(null)} onUsuarioCreado={recargarUsuarios} />}
        {deleteUser && (
          <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350 }}>
              <p>¿Seguro que deseas eliminar el usuario <b>{deleteUser.name}</b>?</p>
              <button onClick={async () => {
                await fetch(`/api/users/${deleteUser.id}`, { method: 'DELETE' });
                setDeleteUser(null);
                recargarUsuarios();
              }} style={{ color: 'red', marginRight: 8 }}>Eliminar</button>
              <button onClick={() => setDeleteUser(null)}>Cancelar</button>
            </div>
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Nombre</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Rol</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{u.name}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{u.role}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  {/* Botón Editar */}
                  <button style={{ marginRight: 8, background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }} onClick={() => setEditUser(u)}>Editar</button>
                  {/* Botón Eliminar */}
                  <button style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14 }} onClick={() => setDeleteUser(u)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
