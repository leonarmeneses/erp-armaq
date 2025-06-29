// API client for Clients
export async function fetchClients() {
  const res = await fetch('http://localhost:3000/api/clients');
  if (!res.ok) throw new Error('Error al obtener clientes');
  return res.json();
}
