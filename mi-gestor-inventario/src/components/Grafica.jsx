import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Grafica({ productos }) {
  
  // Si no hay productos, no mostramos nada para no romper el diseño
  if (productos.length === 0) return null;

  return (
    <div className="glass-panel" style={{ height: '400px', marginBottom: '2rem', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4f46e5' }}>📊 Niveles de Stock</h3>
      
      {/* Contenedor Responsivo: Se adapta al tamaño de la pantalla */}
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productos} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
            
            <XAxis 
              dataKey="nombre" 
              tick={{fill: '#6b7280', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              tick={{fill: '#6b7280', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '10px', 
                border: 'none', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
              }}
            />
            
            <Bar 
              dataKey="cantidad" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]} 
              name="Unidades"
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Grafica;