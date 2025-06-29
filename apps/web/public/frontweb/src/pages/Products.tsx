import { useEffect, useState } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/products';

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const newProduct = await createProduct({ name, price: parseFloat(price) });
      setProducts((prev) => [...prev, newProduct]);
      setName('');
      setPrice('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price.toString());
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateProduct(editingId, { name: editName, price: parseFloat(editPrice) });
      setProducts((prev) => prev.map(p => p.id === editingId ? updated : p));
      setEditingId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter(p => p.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">Precio</label>
          <input value={price} onChange={e => setPrice(e.target.value)} required className="border px-2 py-1 rounded" type="number" min="0" step="0.01" />
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
            <th className="border px-4 py-2">Precio</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            editingId === product.id ? (
              <tr key={product.id} className="bg-yellow-50">
                <td className="border px-4 py-2">{product.id}</td>
                <td className="border px-4 py-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                </td>
                <td className="border px-4 py-2">
                  <input value={editPrice} onChange={e => setEditPrice(e.target.value)} className="border px-2 py-1 rounded" type="number" min="0" step="0.01" />
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <button onClick={handleEdit} className="bg-green-600 text-white px-2 py-1 rounded" disabled={submitting}>Guardar</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancelar</button>
                </td>
              </tr>
            ) : (
              <tr key={product.id}>
                <td className="border px-4 py-2">{product.id}</td>
                <td className="border px-4 py-2">{product.name}</td>
                <td className="border px-4 py-2">${product.price.toFixed(2)}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button onClick={() => startEdit(product)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="bg-red-600 text-white px-2 py-1 rounded" disabled={submitting}>Eliminar</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}
