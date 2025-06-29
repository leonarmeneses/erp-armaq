import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Tesoreria() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        setPagos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar pagos');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando pagos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24 }}>
      <button onClick={() => navigate('/panel')} style={{ marginBottom: 16 }}>Volver al panel</button>
      <h2>Tesorería (Pagos)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Folio</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Monto</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map(p => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.folio}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.client?.name || p.clientId}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.amount}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{p.paymentDate?.slice(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
