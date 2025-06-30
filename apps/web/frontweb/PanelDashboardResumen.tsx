import { useEffect, useState } from 'react';

export function PanelDashboardResumen() {
  const [mejorVendedor, setMejorVendedor] = useState<string>('Cargando...');
  const [cotCDMX, setCotCDMX] = useState<number>(0);
  const [cotPlaya, setCotPlaya] = useState<number>(0);
  const [ventasCDMX, setVentasCDMX] = useState<number>(0);
  const [ventasPlaya, setVentasPlaya] = useState<number>(0);

  useEffect(() => {
    // Mejor vendedor (más órdenes de venta)
    fetch('/api/reports/quotes-by-seller')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const ventas = data.filter((v: any) => v.ordenes > 0 && v.vendedor !== 'Sin asignar');
          if (ventas.length > 0) {
            const mejor = ventas.reduce((a, b) => (a.ordenes > b.ordenes ? a : b));
            setMejorVendedor(`${mejor.vendedor} (${mejor.ordenes} órdenes)`);
          } else {
            setMejorVendedor('Sin datos');
          }
        }
      });
    // Cotizaciones pendientes por sucursal
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCotCDMX(data.filter((q: any) => q.status === 'PENDING' && q.sucursal === 'CDMX').length);
          setCotPlaya(data.filter((q: any) => q.status === 'PENDING' && q.sucursal === 'PLAYA DEL CARMEN').length);
        }
      });
    // Ventas completadas por sucursal (cotizaciones con status VENDIDO y usuario con rol VENTAS)
    fetch('/api/quotes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Mapear usuario a rol usando la lista de usuarios
          fetch('/api/users')
            .then(res => res.json())
            .then(users => {
              const userMap = new Map(users.map((u: any) => [u.name, u.role]));
              const cotizacionesPlaya = data.filter((q: any) => q.status === 'VENDIDO' && q.sucursal === 'PLAYA DEL CARMEN' && userMap.get(q.usuario) === 'VENTAS');
              setVentasPlaya(cotizacionesPlaya.length);
              const cotizacionesCDMX = data.filter((q: any) => q.status === 'VENDIDO' && q.sucursal === 'CDMX' && userMap.get(q.usuario) === 'VENTAS');
              setVentasCDMX(cotizacionesCDMX.length);
            });
        }
      });
  }, []);

  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
      <div style={cardStyle}>
        <div style={titleStyle}>MEJOR VENDEDOR</div>
        <div style={valueStyle}>{mejorVendedor}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>COTIZACIONES PENDIENTES CDMX</div>
        <div style={valueStyle}>{cotCDMX}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>COTIZACIONES PENDIENTES PLAYA DEL CARMEN</div>
        <div style={valueStyle}>{cotPlaya}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>VENTAS COMPLETADAS CDMX</div>
        <div style={valueStyle}>{ventasCDMX}</div>
      </div>
      <div style={cardStyle}>
        <div style={titleStyle}>VENTAS COMPLETADAS PLAYA DEL CARMEN</div>
        <div style={valueStyle}>{ventasPlaya}</div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'linear-gradient(135deg, #e3f0fc 0%, #f8fafc 100%)',
  borderRadius: 16,
  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.08)',
  padding: '28px 36px',
  minWidth: 260,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #90caf9',
};
const titleStyle = {
  fontSize: 16,
  color: '#1976d2',
  fontWeight: 700,
  marginBottom: 10,
  letterSpacing: 1,
  textAlign: 'center' as const,
};
const valueStyle = {
  fontSize: 28,
  color: '#0d47a1',
  fontWeight: 800,
  textAlign: 'center' as const,
};
