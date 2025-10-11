import React from 'react';
import { useDestinos } from '../hooks/useDestinos';
import DestinoCard from '../components/destinos/DestinoCard';

const DestinosPage: React.FC = () => {
  const { destinos, loading } = useDestinos();

  if (loading) return <div>Cargando destinos...</div>;

  return (
    <div>
      <h2>Destinos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {destinos.map((destino) => (
          <DestinoCard key={destino.id_destino} destino={destino} />
        ))}
      </div>
    </div>
  );
};

export default DestinosPage;
