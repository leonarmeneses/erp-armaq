import { useEffect, useState } from 'react';
import { fetchClients } from '../api/clients';

interface Client {
  id: number;
  name: string;
  email: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error('Error al crear cliente');
      const newClient = await res.json();
      setClients((prev) => [...prev, newClient]);
      setName('');
      setEmail('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditEmail(client.email);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/clients/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) throw new Error('Error al editar cliente');
      const updated = await res.json();
      setClients((prev) => prev.map(c => c.id === editingId ? updated : c));
      setEditingId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este cliente?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar cliente');
      setClients((prev) => prev.filter(c => c.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Cargando clientes...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} required className="border px-2 py-1 rounded" type="email" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Agregar'}
        </button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            editingId === client.id ? (
              <tr key={client.id} className="bg-yellow-50">
                <td className="border px-4 py-2">{client.id}</td>
                <td className="border px-4 py-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                </td>
                <td className="border px-4 py-2">
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="border px-2 py-1 rounded" />
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <button onClick={handleEdit} className="bg-green-600 text-white px-2 py-1 rounded" disabled={submitting}>Guardar</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={client.id}>
                <td className="border px-4 py-2">{client.id}</td>
                <td className="border px-4 py-2">{client.name}</td>
                <td className="border px-4 py-2">{client.email}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button onClick={() => startEdit(client)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                  <button onClick={() => handleDelete(client.id)} className="bg-red-600 text-white px-2 py-1 rounded" disabled={submitting}>Eliminar</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}
