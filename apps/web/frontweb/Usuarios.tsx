import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FormularioUsuario({ onClose, onUsuarioCreado }: { onClose: () => void, onUsuarioCreado: () => void }) {
  const [tipo, setTipo] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/users', {
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
    setLoading(false);
    if (res.ok) {
      onUsuarioCreado();
      onClose();
    } else {
      const err = await res.json();
      setError(err.error || 'Error al crear usuario');
    }
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form onSubmit={handleSubmit} style={{ background:'#fff', padding:24, borderRadius:8, minWidth:350, maxWidth:400 }}>
        <h3>Nuevo Usuario</h3>
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
          <button type="submit" disabled={loading}>Crear usuario</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
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

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>
        Volver al panel
      </button>
      <h2>Gestión de Usuarios</h2>
      <button onClick={() => setShowForm(true)} style={{ marginBottom: 16 }}>
        Añadir usuario
      </button>
      <p>Aquí podrás administrar los usuarios del sistema.</p>
      {showForm && <FormularioUsuario onClose={() => setShowForm(false)} onUsuarioCreado={recargarUsuarios} />}
      {loading ? <div>Cargando usuarios...</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Nombre</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Rol</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.role}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <button style={{ marginRight: 8 }} onClick={() => {/* lógica editar */}}>Editar</button>
                  <button style={{ color: 'red' }} onClick={() => {/* lógica eliminar */}}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
