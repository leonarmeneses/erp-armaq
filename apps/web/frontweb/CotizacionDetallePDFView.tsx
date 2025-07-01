import React from 'react';

export interface ProductoCotizacion {
  cantidad: number;
  descripcion: string;
  unidad: string;
  precioUnitario: number;
  importe: number;
}

export interface CotizacionDetalle {
  folio: string;
  fecha: string;
  clienteNombre: string;
  clienteRFC: string;
  clienteDireccion: string;
  clienteTelefono: string;
  clienteEmail: string;
  productos: ProductoCotizacion[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
  vigencia?: string;
  vendedor?: string;
}

// Este componente es un ejemplo base. Ajusta los campos y estilos según el PDF real.
export default function CotizacionDetallePDFView({ cotizacion }: { cotizacion: CotizacionDetalle }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px #0001', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #2563eb', marginBottom: 24, paddingBottom: 12 }}>
        <h1 style={{ color: '#2563eb', fontSize: 28, margin: 0 }}>COTIZACIÓN</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 32, marginTop: 8 }}>
          <div>
            <strong>Vendedor:</strong> {cotizacion.vendedor || '-'}
          </div>
          <div>
            <strong>Folio:</strong> {cotizacion.folio}
          </div>
          <div>
            <strong>Fecha:</strong> {cotizacion.fecha}
          </div>
        </div>
      </header>
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, color: '#1e293b', marginBottom: 8 }}>Datos de contacto</h2>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'space-between' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><strong>Cliente:</strong> {cotizacion.clienteNombre}</div>
            <div><strong>Teléfono:</strong> {cotizacion.clienteTelefono}</div>
            <div><strong>Email:</strong> {cotizacion.clienteEmail}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', textAlign: 'right' }}>
            <div><strong>Dirección:</strong> {cotizacion.clienteDireccion}</div>
          </div>
        </div>
      </section>
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, color: '#1e293b', marginBottom: 8 }}>Productos/Servicios</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#e0e7ff' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: 8 }}>Cantidad</th>
              <th style={{ border: '1px solid #cbd5e1', padding: 8 }}>Descripción</th>
              <th style={{ border: '1px solid #cbd5e1', padding: 8 }}>Unidad</th>
              <th style={{ border: '1px solid #cbd5e1', padding: 8 }}>Precio Unitario</th>
              <th style={{ border: '1px solid #cbd5e1', padding: 8 }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {cotizacion.productos.map((prod, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #cbd5e1', padding: 8, textAlign: 'center' }}>{prod.cantidad}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: 8 }}>{prod.descripcion}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: 8, textAlign: 'center' }}>{prod.unidad}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: 8, textAlign: 'right' }}>${prod.precioUnitario.toFixed(2)}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: 8, textAlign: 'right' }}>${prod.importe.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section style={{ textAlign: 'right', marginBottom: 24 }}>
        <div><strong>Subtotal:</strong> ${cotizacion.subtotal.toFixed(2)}</div>
        <div><strong>IVA:</strong> ${cotizacion.iva.toFixed(2)}</div>
        <div style={{ fontSize: 20, color: '#2563eb', fontWeight: 700 }}><strong>Total:</strong> ${cotizacion.total.toFixed(2)}</div>
      </section>
      <footer style={{ borderTop: '1px solid #cbd5e1', paddingTop: 16, color: '#64748b', fontSize: 15 }}>
        <div>Observaciones: {cotizacion.observaciones || 'N/A'}</div>
        <div style={{ marginTop: 8 }}>Vigencia: {cotizacion.vigencia || '15 días'}</div>
      </footer>
    </div>
  );
}
