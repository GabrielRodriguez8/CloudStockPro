import React from 'react';

function Totales({ lista }) {
  // 1. Calcular los totales (igual que antes)
  const totalProductos = lista.length;
  
  const totalUnidades = lista.reduce((total, producto) => {
    return total + (parseInt(producto.cantidad) || 0);
  }, 0);

  const valorTotal = lista.reduce((total, producto) => {
    const cantidad = parseInt(producto.cantidad) || 0;
    const precio = parseFloat(producto.precio) || 0;
    return total + (cantidad * precio);
  }, 0);

  // Formatear el dinero para que se vea bonito (ej: 1,234.56)
  const valorFormateado = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(valorTotal);


  // 2. Nueva estructura visual con tarjetas
  return (
    <div className="summary-grid">
      
      {/* Tarjeta 1: Productos */}
      <div className="summary-tile">
        <div className="tile-icon">📦</div>
        <div className="tile-content">
          <span className="tile-number">{totalProductos}</span>
          <span className="tile-label">Tipos de Producto</span>
        </div>
      </div>

      {/* Tarjeta 2: Unidades */}
      <div className="summary-tile">
        <div className="tile-icon" style={{ fontSize: '2.2rem' }}>🔢</div>
        <div className="tile-content">
          <span className="tile-number">{totalUnidades}</span>
          <span className="tile-label">Unidades Totales</span>
        </div>
      </div>

      {/* Tarjeta 3: Valor Total */}
      <div className="summary-tile">
        <div className="tile-icon">💰</div>
        <div className="tile-content">
          {/* Usamos el valor formateado aquí */}
          <span className="tile-number" style={{ color: '#10b981' }}>{valorFormateado}</span>
          <span className="tile-label">Valor del Inventario</span>
        </div>
      </div>

    </div>
  );
}

export default Totales;