import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function Historial() {
  const [movimientos, setMovimientos] = useState([]);

  const obtenerHistorial = async () => {
    const { data, error } = await supabase
      .from('historial')
      .select('*')
      .order('fecha', { ascending: false }) // Los nuevos primero
      .limit(50); // Traer solo los últimos 50 para no saturar

    if (!error) setMovimientos(data);
  };

  useEffect(() => {
     // eslint-disable-next-line react-hooks/exhaustive-deps
    obtenerHistorial();
  }, []);

  

  // Función para formatear la fecha bonita
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-ES', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: '20px', color: '#4f46e5' }}>📜 Historial de Movimientos</h2>
      
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Acción</th>
            <th>Cant.</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td style={{ fontSize: '0.85rem', color: '#666' }}>{formatearFecha(m.fecha)}</td>
              <td style={{ fontWeight: 'bold' }}>{m.producto}</td>
              <td>
                <span style={{
                  padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold',
                  background: m.accion === 'Entrada' || m.accion === 'Creado' ? '#d1fae5' : '#fee2e2',
                  color: m.accion === 'Entrada' || m.accion === 'Creado' ? '#065f46' : '#991b1b'
                }}>
                  {m.accion}
                </span>
              </td>
              <td>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {movimientos.length === 0 && <p style={{textAlign:'center', padding:'20px', opacity:0.6}}>No hay movimientos recientes.</p>}
    </div>
  );
}

export default Historial;