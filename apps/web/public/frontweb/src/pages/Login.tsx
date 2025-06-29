import { useState } from 'react';
import { loginUser } from '../api/auth';

export default function Login({ onLogin }: { onLogin: (user: { name: string; role: 'admin' | 'seller' }) => void }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(name, password);
      onLogin(user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        <div className="mb-4">
          <label className="block mb-1">Nombre de usuario</label>
          <input className="border px-2 py-1 w-full rounded" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input className="border px-2 py-1 w-full rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
