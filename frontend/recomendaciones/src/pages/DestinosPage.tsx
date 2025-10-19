import React, { useMemo, useState } from 'react';
import { useDestinos } from '../hooks/useDestinos';
import DestinoCard from '../components/destinos/DestinoCard';

const DestinosPage: React.FC = () => {
  const { destinos, loading } = useDestinos();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q) return destinos;
    return destinos.filter((d: any) => (d.nombre || '').toLowerCase().includes(q.toLowerCase()) || (d.ubicacion || '').toLowerCase().includes(q.toLowerCase()));
  }, [destinos, q]);

  if (loading) return <div>Cargando destinos...</div>;

  return (
    <div>
      <h2>Destinos</h2>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Buscar destino o ubicación..." value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: 8, width: '100%', maxWidth: 420 }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {filtered.map((destino: any) => (
          <DestinoCard key={destino.id_destino} destino={destino} />
        ))}
        {filtered.length === 0 && <div>No se encontraron destinos.</div>}
      </div>
    </div>
  );
};

export default DestinosPage;
