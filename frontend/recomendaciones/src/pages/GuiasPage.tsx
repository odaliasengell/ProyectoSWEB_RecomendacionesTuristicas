import React from 'react';
import { useGuias } from '../hooks/useGuias';
import GuiaCard from '../components/guias/GuiaCard';

const GuiasPage: React.FC = () => {
  const { guias, loading } = useGuias();

  if (loading) return <div>Cargando guías...</div>;

  return (
    <div>
      <h2>Guías</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {guias.map((guia) => (
          <GuiaCard key={guia.id_guia} guia={guia} />
        ))}
      </div>
    </div>
  );
};

export default GuiasPage;
