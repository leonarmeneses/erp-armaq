import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function generarCodigoProveedor() {
  // Ejemplo: PRO-20250628-XXXX
  const fecha = new Date();
  const yyyyMMdd = fecha.toISOString().slice(0,10).replace(/-/g,"");
  const random = Math.random().toString(36).slice(2,6).toUpperCase();
  return `PRO-${yyyyMMdd}-${random}`;
}

function ProveedorForm({ initial, onSave, onCancel }: { initial?: any, onSave: (data: any) => void, onCancel: () => void }) {
  const code = initial?.code || '';
  const [name, setName] = useState(initial?.name || '');
  const [rfc, setRfc] = useState(initial?.rfc || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [telefono, setTelefono] = useState(initial?.phone || initial?.telefono || '');
  const [regimenFiscal, setRegimenFiscal] = useState(initial?.regimenFiscal || '601');
  const [usoCfdi, setUsoCfdi] = useState(initial?.usoCfdi || 'G03');
  const [direccion, setDireccion] = useState({
    calle: initial?.direccion?.calle || initial?.calle || '',
    numExterior: initial?.direccion?.numExterior || initial?.numExterior || '',
    numInterior: initial?.direccion?.numInterior || initial?.numInterior || '',
    colonia: initial?.direccion?.colonia || initial?.colonia || '',
    municipio: initial?.direccion?.municipio || initial?.municipio || '',
    ciudad: initial?.direccion?.ciudad || initial?.ciudad || '',
    estado: initial?.direccion?.estado || initial?.estado || '',
    pais: initial?.direccion?.pais || initial?.pais || '',
    codigoPostal: initial?.direccion?.codigoPostal || initial?.codigoPostal || ''
  });
  const [errorRfc, setErrorRfc] = useState('');
  // Catálogos SAT (puedes expandir según necesidad)
  const regimenes = [
    { clave: '601', desc: 'General de Ley Personas Morales' },
    { clave: '603', desc: 'Personas Morales con Fines no Lucrativos' },
    { clave: '605', desc: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { clave: '606', desc: 'Arrendamiento' },
    { clave: '608', desc: 'Demás ingresos' },
    { clave: '609', desc: 'Consolidación' },
    { clave: '610', desc: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { clave: '611', desc: 'Ingresos por Dividendos (socios y accionistas)' },
    { clave: '612', desc: 'Personas Físicas con Actividades Empresariales y Profesionales' },
    { clave: '614', desc: 'Ingresos por intereses' },
    { clave: '615', desc: 'Régimen de los ingresos por obtención de premios' },
    { clave: '616', desc: 'Sin obligaciones fiscales' },
    { clave: '620', desc: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
    { clave: '621', desc: 'Incorporación Fiscal' },
    { clave: '622', desc: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { clave: '623', desc: 'Opcional para Grupos de Sociedades' },
    { clave: '624', desc: 'Coordinados' },
    { clave: '625', desc: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
    { clave: '626', desc: 'Régimen Simplificado de Confianza' }
  ];
  const usosCfdi = [
    { clave: 'G01', desc: 'Adquisición de mercancías' },
    { clave: 'G02', desc: 'Devoluciones, descuentos o bonificaciones' },
    { clave: 'G03', desc: 'Gastos en general' },
    { clave: 'I01', desc: 'Construcciones' },
    { clave: 'I02', desc: 'Mobiliario y equipo de oficina por inversiones' },
    { clave: 'I03', desc: 'Equipo de transporte' },
    { clave: 'I04', desc: 'Equipo de computo y accesorios' },
    { clave: 'D01', desc: 'Honorarios médicos, dentales y gastos hospitalarios' },
    { clave: 'D02', desc: 'Gastos médicos por incapacidad o discapacidad' },
    { clave: 'D03', desc: 'Gastos funerales' },
    { clave: 'D04', desc: 'Donativos' },
    { clave: 'D05', desc: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)' },
    { clave: 'D06', desc: 'Aportaciones voluntarias al SAR' },
    { clave: 'D07', desc: 'Primas por seguros de gastos médicos' },
    { clave: 'D08', desc: 'Gastos de transportación escolar obligatoria' },
    { clave: 'D09', desc: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
    { clave: 'D10', desc: 'Pagos por servicios educativos (colegiaturas)' }
  ];
  // Validaciones básicas
  const emailValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const rfcValido = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc.toUpperCase());
  const telValido = /^\d{10}$/.test(telefono);
  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(30,40,80,0.18)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setErrorRfc('');
          if(emailValido && rfcValido && telValido) {
            try {
              await onSave({
                code: initial?.code || generarCodigoProveedor(),
                name,
                rfc,
                email,
                phone: telefono,
                calle: direccion.calle,
                numExterior: direccion.numExterior,
                numInterior: direccion.numInterior,
                colonia: direccion.colonia,
                municipio: direccion.municipio,
                ciudad: direccion.ciudad,
                estado: direccion.estado,
                pais: direccion.pais,
                codigoPostal: direccion.codigoPostal,
                regimenFiscal,
                usoCfdi
              });
            } catch (err: any) {
              if (err?.message?.includes('rfc')) {
                setErrorRfc('El RFC ya está registrado.');
              }
            }
          }
        }}
        style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e9f7 100%)',
          padding: 24,
          borderRadius: 18,
          minWidth: 320,
          maxWidth: 1200,
          width: '100%',
          boxShadow: '0 8px 32px rgba(60,80,180,0.18)',
          border: '1.5px solid #dbeafe',
          position: 'relative',
          transition: 'box-shadow 0.2s',
        }}
      >
        <h3 style={{
          margin: 0,
          marginBottom: 18,
          fontSize: 24,
          fontWeight: 700,
          color: '#2563eb',
          letterSpacing: 1,
          textAlign: 'center',
          textShadow: '0 2px 8px #e0e7ff'
        }}>{initial ? 'Editar proveedor' : 'Añadir proveedor'}</h3>
        {code && (
          <div style={{ marginBottom:16, textAlign: 'center' }}>
            <label style={{ fontWeight: 500, color: '#64748b' }}>Código:<br/>
              <input value={code} readOnly style={{ background:'#e0e7ef', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 10px', width: 180, textAlign: 'center', fontWeight: 600 }} />
            </label>
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px 28px',
          marginBottom: 20
        }}>
          <div>
            <label style={{ fontWeight: 500 }}>Nombre completo:<br/>
              <input value={name} onChange={e=>setName(e.target.value)} required style={{ width: '100%', maxWidth: 260, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>RFC:<br/>
              <input value={rfc} onChange={e=>setRfc(e.target.value)} required style={{ width: '100%', maxWidth: 180, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb', borderColor: rfc && (!rfcValido || errorRfc) ? 'red' : '#cbd5e1' }} />
            </label>
            {rfc && !rfcValido && <div style={{ color: 'red', fontSize: 12 }}>RFC inválido</div>}
            {errorRfc && <div style={{ color: 'red', fontSize: 12 }}>{errorRfc}</div>}
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Email:<br/>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{ width: '100%', maxWidth: 220, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb', borderColor: email && !emailValido ? 'red' : '#cbd5e1' }} />
            </label>
            {email && !emailValido && <div style={{ color: 'red', fontSize: 12 }}>Email inválido</div>}
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Número telefónico:<br/>
              <input value={telefono} onChange={e=>setTelefono(e.target.value)} type="tel" required style={{ width: '100%', maxWidth: 160, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb', borderColor: telefono && !telValido ? 'red' : '#cbd5e1' }} maxLength={10} />
            </label>
            {telefono && !telValido && <div style={{ color: 'red', fontSize: 12 }}>Teléfono debe ser 10 dígitos</div>}
          </div>
        </div>
        <fieldset style={{ border: '1.5px solid #c7d2fe', borderRadius: 10, padding: 18, margin: '18px 0 18px 0', background: '#f1f5fa' }}>
          <legend style={{ fontWeight: 600, color: '#1976d2', fontSize: 16, letterSpacing: 1 }}>Dirección</legend>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px 20px'
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 500 }}>Calle:<br/>
                <input value={direccion.calle} onChange={e=>setDireccion(d=>({...d, calle: e.target.value}))} required style={{ width: '100%', maxWidth: 260, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Num. exterior:<br/>
                <input value={direccion.numExterior} onChange={e=>setDireccion(d=>({...d, numExterior: e.target.value}))} required style={{ width: '100%', maxWidth: 100, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Num. interior:<br/>
                <input value={direccion.numInterior} onChange={e=>setDireccion(d=>({...d, numInterior: e.target.value}))} style={{ width: '100%', maxWidth: 100, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Colonia:<br/>
                <input value={direccion.colonia} onChange={e=>setDireccion(d=>({...d, colonia: e.target.value}))} required style={{ width: '100%', maxWidth: 160, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Municipio:<br/>
                <input value={direccion.municipio} onChange={e=>setDireccion(d=>({...d, municipio: e.target.value}))} required style={{ width: '100%', maxWidth: 160, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Ciudad:<br/>
                <input value={direccion.ciudad} onChange={e=>setDireccion(d=>({...d, ciudad: e.target.value}))} required style={{ width: '100%', maxWidth: 160, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Estado:<br/>
                <input value={direccion.estado} onChange={e=>setDireccion(d=>({...d, estado: e.target.value}))} required style={{ width: '100%', maxWidth: 120, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>País:<br/>
                <input value={direccion.pais} onChange={e=>setDireccion(d=>({...d, pais: e.target.value}))} required style={{ width: '100%', maxWidth: 120, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
            <div>
              <label style={{ fontWeight: 500 }}>Código postal:<br/>
                <input value={direccion.codigoPostal} onChange={e=>setDireccion(d=>({...d, codigoPostal: e.target.value}))} required style={{ width: '100%', maxWidth: 120, border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '7px 10px', fontSize: 15, marginTop: 4, outlineColor: '#2563eb' }} />
              </label>
            </div>
          </div>
        </fieldset>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 12 }}>
          <div>
            <label style={{ fontWeight: 500 }}>Régimen fiscal:<br/>
              <select value={regimenFiscal} onChange={e=>setRegimenFiscal(e.target.value)} required style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '10px 14px', fontSize: 16, marginTop: 4, outlineColor: '#2563eb', background: '#f8fafc' }}>
                <option value="">Selecciona un régimen</option>
                {regimenes.map(r => <option key={r.clave} value={r.clave}>{r.clave} - {r.desc}</option>)}
              </select>
            </label>
          </div>
          <div>
            <label style={{ fontWeight: 500 }}>Uso del CFDI:<br/>
              <select value={usoCfdi} onChange={e=>setUsoCfdi(e.target.value)} required style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: 7, padding: '10px 14px', fontSize: 16, marginTop: 4, outlineColor: '#2563eb', background: '#f8fafc' }}>
                <option value="">Selecciona un uso</option>
                {usosCfdi.map(u => <option key={u.clave} value={u.clave}>{u.clave} - {u.desc}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 18 }}>
          <button
            type="submit"
            disabled={!(emailValido && rfcValido && telValido)}
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 600,
              fontSize: 17,
              cursor: !(emailValido && rfcValido && telValido) ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.12)'
            }}
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 600,
              fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.12)'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Proveedores() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProveedor, setEditProveedor] = useState<any>(null);

  const fetchProveedores = () => {
    setLoading(true);
    fetch('/api/providers')
      .then(res => res.json())
      .then((data) => {
        setProveedores(Array.isArray(data) ? data : data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar proveedores');
        setLoading(false);
      });
  };
  useEffect(() => { fetchProveedores(); }, []);

  const handleAdd = () => { setEditProveedor(null); setShowForm(true); };
  const handleEdit = (proveedor: any) => { setEditProveedor(proveedor); setShowForm(true); };

  const saveProveedor = async (data: any) => {
    try {
      let res;
      if (editProveedor) {
        res = await fetch(`/api/providers/${editProveedor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch('/api/providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error en la respuesta del servidor');
      }
      setShowForm(false);
      setEditProveedor(null);
      fetchProveedores();
    } catch (e: any) {
      alert('Error al guardar proveedor: ' + (e.message || e));
    }
  };

  if (loading) return <div>Cargando proveedores...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', background: 'none', margin: 0, padding: '40px 0 0 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <h2 style={{ margin: 0, flex: 1, color: '#1a237e', letterSpacing: 1 }}>Proveedores</h2>
          <button
            onClick={handleAdd}
            style={{
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              marginRight: 8
            }}
          >
            Añadir
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #e0e7ef' }}>
          <thead>
            <tr style={{ background: '#e3f2fd' }}>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Código</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Nombre</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>RFC</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Email</th>
              <th style={{ border: '1px solid #bbdefb', padding: 10, color: '#1976d2' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }}>
                <td style={{ border: '1px solid #e3f2fd', padding: 10, display: 'none' }}>{p.id}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.code}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.name}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.rfc}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>{p.email}</td>
                <td style={{ border: '1px solid #e3f2fd', padding: 10 }}>
                  <button onClick={() => handleEdit(p)} style={{ marginRight: 8 }}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showForm && (
          <ProveedorForm initial={editProveedor} onSave={saveProveedor} onCancel={()=>{setShowForm(false); setEditProveedor(null);}} />
        )}
      </div>
    </div>
  );
}
