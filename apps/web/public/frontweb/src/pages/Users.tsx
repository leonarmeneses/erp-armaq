import { useEffect, useState } from 'react';
import { currentUser } from '../auth/roles';
import type { UserType, UserRoleType } from '../auth/roles';
import { fetchUsers, createUser, deleteUser } from '../api/users';

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRoleType>('seller');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const newUser = await createUser({ name, role });
      setUsers([...users, newUser]);
      setName('');
      setRole('seller');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (currentUser.role !== 'admin') {
    return <div className="text-red-500">Acceso restringido solo para administradores.</div>;
  }

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      <form onSubmit={handleAdd} className="mb-6 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value as UserRoleType)} className="border px-2 py-1 rounded">
            <option value="seller">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>Agregar</button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Rol</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.id}</td>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.role === 'admin' ? 'Administrador' : 'Vendedor'}</td>
              <td className="border px-4 py-2">
                {user.id !== 1 && (
                  <button onClick={() => handleDelete(user.id)} className="bg-red-600 text-white px-2 py-1 rounded" disabled={submitting}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
