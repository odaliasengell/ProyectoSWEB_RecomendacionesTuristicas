import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => (
  <div>
    <h2>Bienvenido al Dashboard</h2>
    <ul>
      <li>
        <Link to="/guias">Guías</Link>
      </li>
      <li>
        <Link to="/tours">Tours</Link>
      </li>
      <li>
        <Link to="/reservas">Reservas</Link>
      </li>
      <li>
        <Link to="/destinos">Destinos</Link>
      </li>
      <li>
        <Link to="/recomendaciones">Recomendaciones</Link>
      </li>
    </ul>
  </div>
);

export default DashboardPage;
