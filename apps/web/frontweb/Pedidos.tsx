import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/saleorders')
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar pedidos');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando ordenes de venta...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Orden de Venta</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.folio}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.client?.name || p.clientId}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.total}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.status}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.createdAt?.slice(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
