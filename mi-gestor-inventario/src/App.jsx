import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom' // <--- NUEVOS IMPORTS
import Totales from './components/Totales'
import Grafica from './components/Grafica'
import Footer from './components/footer'
import Historial from './components/Historial' // <--- IMPORTAR HISTORIAL
import Login from './login'
import { supabase } from './supabase'

function App() {
  const [session, setSession] = useState(null);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ nombre: '', cantidad: '', precio: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Hook para saber en qué página estamos (para resaltar el menú)
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => await supabase.auth.signOut();

  const fetchProductos = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
    if (!error) setProductos(data);
  }, [session]);

  useEffect(() => {
    if (session) fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- 🆕 FUNCIÓN PARA REGISTRAR EN EL HISTORIAL ---
  const registrarMovimiento = async (producto, accion, cantidad) => {
    await supabase.from('historial').insert([{
      producto: producto,
      accion: accion,
      cantidad: cantidad
    }]);
  };
  // ------------------------------------------------

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.cantidad) return;

    const datos = { nombre: form.nombre, cantidad: form.cantidad, precio: form.precio };
    
    if (editandoId) {
      await supabase.from('productos').update(datos).eq('id', editandoId);
      // Opcional: Registrar edición (lo dejamos simple por ahora)
      setEditandoId(null);
    } else {
      await supabase.from('productos').insert([datos]);
      // 🆕 Registro creación
      registrarMovimiento(form.nombre, 'Creado', form.cantidad);
    }
    fetchProductos();
    setForm({ nombre: '', cantidad: '', precio: '' });
  };

  const eliminarProducto = async (id, nombre) => { // <--- Pasamos el nombre también
    if (confirm('¿Borrar producto?')) {
      await supabase.from('productos').delete().eq('id', id);
      // 🆕 Registro borrado
      registrarMovimiento(nombre, 'Borrado', 0);
      fetchProductos();
    }
  };

  const prepararEdicion = (p) => { setForm(p); setEditandoId(p.id); };

 // --- FUNCIÓN MEJORADA: ACTUALIZACIÓN OPTIMISTA ---
  const actualizarStock = async (id, nombre, cantidadActual, cantidadAjuste) => {
    
    // 1. Calculamos el nuevo valor hipotético
    // NOTA: Usamos el estado actual para evitar errores si das clicks muy rápido
    let nuevaCantidadFinal = 0;

    // Actualizamos la interfaz INMEDIATAMENTE (sin esperar a Supabase)
    setProductos(prevProductos => {
      return prevProductos.map(producto => {
        if (producto.id === id) {
          const nuevaCantidad = parseInt(producto.cantidad) + cantidadAjuste;
          
          // Si intenta bajar de 0, devolvemos el producto tal cual (no hacemos nada)
          if (nuevaCantidad < 0) {
            nuevaCantidadFinal = -1; // Marca de error
            return producto;
          }

          nuevaCantidadFinal = nuevaCantidad; // Guardamos el valor para enviarlo a la BD
          return { ...producto, cantidad: nuevaCantidad }; // Devolvemos el producto actualizado
        }
        return producto;
      });
    });

    // Si la cantidad era negativa (intentó bajar de 0), paramos aquí.
    if (nuevaCantidadFinal === -1) return;

    // 2. Enviamos los datos a Supabase en segundo plano ("Fire and forget")
    // Ya no esperamos a que termine para mostrar el cambio al usuario
    const { error } = await supabase
      .from('productos')
      .update({ cantidad: nuevaCantidadFinal })
      .eq('id', id);

    // 3. Registramos el movimiento (también en segundo plano)
    const tipoAccion = cantidadAjuste > 0 ? 'Entrada' : 'Salida';
    registrarMovimiento(nombre, tipoAccion, cantidadAjuste);

    // IMPORTANTE: Si hay error en el servidor, revertimos el cambio (opcional, pero buena práctica)
    if (error) {
      console.error("Error al actualizar en la nube:", error);
      fetchProductos(); // Recargamos la lista real para corregir el error visual
    }
    
    // 4. ¡YA NO LLAMAMOS A fetchProductos() AQUÍ! 
    // Eso es lo que causaba el retraso. Confiamos en que la actualización local fue correcta.
  };


  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (!session) return <Login />;

  return (
    <div className="app-wrapper">
      
      {/* NAVBAR CON NAVEGACIÓN */}
      <nav className="navbar">
        <div className="logo">
          ☁️ CloudStock <span style={{fontSize:'0.8rem', opacity:0.7, marginLeft:'5px'}}>PRO</span>
        </div>
        
        {/* Enlaces de Navegación */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/' ? '#4f46e5' : '#1f2937', 
              fontWeight: 'bold',
              borderBottom: location.pathname === '/' ? '2px solid #4f46e5' : 'none'
            }}
          >
            Inventario
          </Link>
          <Link 
            to="/historial" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/historial' ? '#4f46e5' : '#1f2937', 
              fontWeight: 'bold',
              borderBottom: location.pathname === '/historial' ? '2px solid #4f46e5' : 'none'
            }}
          >
            Historial
          </Link>
        </div>

        <div className="user-profile">
          <span style={{fontSize: '0.9rem', marginRight:'10px'}}>{session.user.email}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(0,0,0,0.1)', padding: '8px 15px', fontSize: '0.8rem', color: 'var(--dark)' }}>
            Salir ➜
          </button>
        </div>
      </nav>

      <main className="main-content">
        {/* DEFINICIÓN DE RUTAS */}
        <Routes>
          
          {/* RUTA 1: INVENTARIO (Lo que tenías antes) */}
          <Route path="/" element={
            <>
              <div style={{marginBottom: '2rem'}}>
                <Totales lista={productos} />
              </div>
              <Grafica productos={productos} />
              
              <div className="glass-panel">
                 {/* Formulario */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
                  <h2 style={{margin:0}}>{editandoId ? '✏️ Editando' : '🚀 Nuevo Item'}</h2>
                  {editandoId && <button onClick={() => {setEditandoId(null); setForm({nombre:'', cantidad:'', precio:''})}} style={{background:'transparent', color:'#666'}}>Cancelar</button>}
                </div>

                <form onSubmit={manejarSubmit} className="form-row" style={{marginBottom: '2rem'}}>
                  <input placeholder="Nombre..." value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{flex: 2}} />
                  <input type="number" placeholder="Cant" value={form.cantidad} onChange={e => setForm({...form, cantidad: e.target.value})} />
                  <input type="number" placeholder="Precio ($)" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
                  <button type="submit" className="btn-primary">{editandoId ? 'Guardar' : 'Añadir'}</button>
                </form>

                <div style={{position:'relative', marginBottom:'1.5rem'}}>
                  <span style={{position:'absolute', left:'15px', top:'14px'}}>🔍</span>
                  <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{paddingLeft: '45px', width:'100%'}} />
                </div>

                <table>
                  <thead>
                    <tr><th>Producto</th><th>Stock</th><th>Valor</th><th style={{textAlign:'right'}}>Acciones</th></tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map(p => (
                      <tr key={p.id}>
                        <td style={{fontWeight:600}}>{p.nombre}</td>
                        <td>
                          <div style={{display:'inline-flex', alignItems:'center', gap:'8px', color: p.cantidad < 5 ? '#ef4444' : '#10b981', fontWeight: 'bold', background: 'rgba(255,255,255,0.8)', padding:'5px 10px', borderRadius:'8px'}}>
                            {p.cantidad} uds. {p.cantidad < 5 && <span>⚠️</span>}
                          </div>
                        </td>
                        <td>${p.precio}</td>
                        <td style={{textAlign:'right'}}>
                          {/* Pasamos el nombre a las funciones para registrarlo en el historial */}
                          <button className="btn-stock" onClick={() => actualizarStock(p.id, p.nombre, p.cantidad, -1)}>-</button>
                          <button className="btn-stock" onClick={() => actualizarStock(p.id, p.nombre, p.cantidad, 1)} style={{marginRight:'10px'}}>+</button>
                          <button className="btn-action btn-edit" onClick={() => prepararEdicion(p)}>Editar</button>
                          <button className="btn-action btn-delete" onClick={() => eliminarProducto(p.id, p.nombre)}>X</button>
                        </td>
                      </tr>
                    ))}
                    {productos.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', opacity:0.6}}>Cargando datos...</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          } />

          {/* RUTA 2: PÁGINA DE HISTORIAL */}
          <Route path="/historial" element={<Historial />} />

        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App