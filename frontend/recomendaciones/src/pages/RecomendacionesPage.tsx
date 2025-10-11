import React from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import RecomendacionCard from '../components/recomendaciones/RecomendacionCard';

const RecomendacionesPage: React.FC = () => {
  const { recomendaciones, loading } = useRecomendaciones();

  if (loading) return <div>Cargando recomendaciones...</div>;

  return (
    <div>
      <h2>Recomendaciones</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {recomendaciones.map((rec) => (
          <RecomendacionCard key={rec.id_recomendacion} recomendacion={rec} />
        ))}
      </div>
    </div>
  );
};

export default RecomendacionesPage;
