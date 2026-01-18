import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      
      {/* Sección Izquierda: Marca */}
      <div className="footer-brand">
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#4f46e5' }}>
          ☁️ CloudStock
        </span>
        <span style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px' }}>
          Gestión inteligente para empresas modernas.
        </span>
      </div>

      {/* Sección Centro: Enlaces */}
      <div className="footer-links">
        <a href="#">Soporte</a>
        <a href="#">Privacidad</a>
        <a href="#">Términos</a>
      </div>

      {/* Sección Derecha: Copyright y Versión */}
      <div className="footer-info">
        <span>© 2026 CloudStock Inc.</span>
        <span className="version-tag">v1.2.0</span>
      </div>

    </footer>
  );
}

export default Footer;