import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Facturacion() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setFacturas(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar facturas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando facturas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Facturación</h2>
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
          {facturas.map(f => (
            <tr key={f.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.folio}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.client?.name || f.clientId}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.total}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.status}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{f.createdAt?.slice(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
