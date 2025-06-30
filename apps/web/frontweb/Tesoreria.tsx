import { useEffect, useState } from 'react';

export default function Tesoreria() {
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
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Tesorería (Pagos)</h2>
          {/* Botón de acción (si aplica) */}
          <button
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}
          >
            {/* Acción */}
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Folio</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Cliente</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Monto</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map(p => (
              <tr key={p.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.folio}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.client?.name || p.clientId}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.amount}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.paymentDate?.slice(0,10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
