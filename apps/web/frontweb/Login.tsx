import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });
      const data = await res.json();
      if (res.ok) {
        setResult('');
        setLoggedIn(true);
        localStorage.setItem('usuario', name); // Guardar usuario en localStorage
        localStorage.setItem('usuario_data', JSON.stringify(data)); // Guardar datos completos (incluye rol)
        navigate('/panel');
      } else setResult('Error: ' + (data.error || 'Login fallido'));
    } catch (err) {
      setResult('Error de conexión');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, background: 'linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', zIndex: 1, width: 350, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(60,60,120,0.18)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 18, borderRadius: 12, boxShadow: '0 2px 8px rgba(79,140,255,0.10)' }} />
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 8, color: '#2563eb', letterSpacing: 1 }}>Bienvenido</div>
        <div style={{ color: '#64748b', marginBottom: 24, fontSize: 16 }}>Inicia sesión para continuar</div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#334155' }}>Usuario</label>
            <input value={name} onChange={e => setName(e.target.value)} required autoFocus
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #4f8cff'}
              onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 6, color: '#334155' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #4f8cff'}
              onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
            />
          </div>
          <button type="submit" style={{ width: '100%', background: 'linear-gradient(90deg, #4f8cff 0%, #38bdf8 100%)', color: 'white', fontWeight: 600, fontSize: 17, border: 'none', borderRadius: 8, padding: '12px 0', boxShadow: '0 2px 8px rgba(79,140,255,0.10)', cursor: 'pointer', transition: 'background 0.2s' }}>
            Entrar
          </button>
        </form>
        {result && <div style={{ marginTop: 18, color: '#ef4444', fontWeight: 500 }}>{result}</div>}
      </div>
    </div>
  );
}
