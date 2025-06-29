export async function loginUser(name: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error de autenticación');
  }
  return res.json();
}
