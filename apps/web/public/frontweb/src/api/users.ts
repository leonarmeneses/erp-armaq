// API client for Users
export async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function createUser(data: { name: string; role: string }) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return res.json();
}
