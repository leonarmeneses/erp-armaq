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
    <div style={{ maxWidth: 320, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario:</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {result && <div style={{ marginTop: 16 }}>{result}</div>}
    </div>
  );
}
