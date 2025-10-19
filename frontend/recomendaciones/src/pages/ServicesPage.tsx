import React from 'react';

const ServicesPage: React.FC = () => {
  return (
    <div>
      <h2>Servicios Turísticos</h2>
      <p>Transporte, hospedaje, alimentación y otros servicios disponibles.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <div className="card">Transporte — Minivan, traslado privado</div>
        <div className="card">Hospedaje — Hoteles y lodges</div>
        <div className="card">Alimentación — Desayuno / Almuerzo</div>
      </div>
    </div>
  );
};

export default ServicesPage;
