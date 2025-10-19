import React from 'react';
import { useRecomendaciones } from '../hooks/useRecomendaciones';
import RecomendacionCard from '../components/recomendaciones/RecomendacionCard';

const RecomendacionesPage: React.FC = () => {
  const { recomendaciones, loading } = useRecomendaciones();

  if (loading) return <div>Cargando recomendaciones...</div>;
  console.log('Recomendaciones recibidas:', recomendaciones);

  return (
    <div>
      <h2>Recomendaciones</h2>
      <div style={{ marginBottom: 8, color: 'var(--muted)' }}>
        Total: {recomendaciones.length} recomendación(es)
        {' '}
        {recomendaciones.length > 0 && (
          <span> — IDs: {recomendaciones.map((r) => r.id_recomendacion).join(', ')}</span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {recomendaciones.map((rec) => (
          <RecomendacionCard key={rec.id_recomendacion} recomendacion={rec} />
        ))}
      </div>
    </div>
  );
};

export default RecomendacionesPage;
