import React, { useState, useEffect } from 'react';
import { X, Save, Route } from 'lucide-react';
import ImageUploader from './ImageUploader';

const TourForm = ({ 
  show, 
  onClose, 
  onSave, 
  tour = null, 
  isEditing = false,
  guias = [],
  destinos = []
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: 0,
    capacidad_maxima: 10,
    disponible: true,
    guia_id: '',
    destino_id: '',
    imagen_url: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const duracionesComunes = [
    '2 horas', '4 horas', '6 horas', '8 horas', 
    '1 día', '2 días', '3 días', '1 semana', '2 semanas'
  ];

  useEffect(() => {
    if (tour && isEditing) {
      console.log('📝 Cargando tour para editar:', tour);
      const tourId = tour.id || tour._id || tour.id_tour;
      // El backend usa guia_id y destino_id
      setFormData({
        id: tourId,
        nombre: tour.nombre || '',
        descripcion: tour.descripcion || '',
        duracion: tour.duracion || '',
        precio: tour.precio || 0,
        capacidad_maxima: tour.capacidad_maxima || 10,
        disponible: tour.disponible !== undefined ? tour.disponible : true,
        guia_id: tour.guia_id || '',
        destino_id: tour.destino_id || '',
        imagen_url: tour.imagen_url || ''
      });
      console.log('✅ Formulario cargado - Guía:', tour.guia_id, 'Destino:', tour.destino_id);
    } else {
      setFormData({
        id: null,
        nombre: '',
        descripcion: '',
        duracion: '',
        precio: 0,
        capacidad_maxima: 10,
        disponible: true,
        guia_id: '',
        destino_id: '',
        imagen_url: ''
      });
    }
    setErrors({});
  }, [tour, isEditing, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Log para debugging
    if (name === 'destino_id') {
      console.log('🔄 Cambiando destino a:', value);
    }
    if (name === 'guia_id') {
      console.log('🔄 Cambiando guía a:', value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del tour es requerido';
    }
    
    if (!formData.duracion.trim()) {
      newErrors.duracion = 'La duración es requerida';
    }
    
    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (!formData.capacidad_maxima || formData.capacidad_maxima <= 0) {
      newErrors.capacidad_maxima = 'La capacidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        capacidad_maxima: parseInt(formData.capacidad_maxima) || 10,
        guia_id: formData.guia_id || null,
        destino_id: formData.destino_id || null
      };
      
      console.log('💾 Enviando datos del formulario:', submitData);
      console.log('📍 ID Destino a guardar:', submitData.destino_id);
      console.log('👤 ID Guía a guardar:', submitData.guia_id);
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Error al guardar el tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const formStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f1f5f9'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '5px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Route size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              {isEditing ? 'Editar Tour' : 'Nuevo Tour'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Nombre del Tour *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              style={errors.nombre ? errorInputStyle : inputStyle}
              placeholder="Ej: Tour Galápagos Express"
            />
            {errors.nombre && <div style={errorStyle}>{errors.nombre}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px'
              }}
              placeholder="Descripción detallada del tour, qué incluye, lugares a visitar..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Duración *
              </label>
              <select
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                style={errors.duracion ? errorInputStyle : inputStyle}
              >
                <option value="">Seleccionar duración</option>
                {duracionesComunes.map(dur => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
              {errors.duracion && <div style={errorStyle}>{errors.duracion}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Precio (USD) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={errors.precio ? errorInputStyle : inputStyle}
                placeholder="150.00"
              />
              {errors.precio && <div style={errorStyle}>{errors.precio}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Capacidad Máxima *
              </label>
              <input
                type="number"
                name="capacidad_maxima"
                value={formData.capacidad_maxima}
                onChange={handleChange}
                min="1"
                style={errors.capacidad_maxima ? errorInputStyle : inputStyle}
                placeholder="10"
              />
              {errors.capacidad_maxima && <div style={errorStyle}>{errors.capacidad_maxima}</div>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Guía Asignada
            </label>
            <select
              name="guia_id"
              value={formData.guia_id}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Sin guía asignada</option>
              {guias.map(guia => {
                const guiaId = guia.id || guia._id || guia.id_guia;
                return (
                  <option key={guiaId} value={guiaId}>
                    {`${guia.nombre}${guia.idiomas ? ` - ${Array.isArray(guia.idiomas) ? guia.idiomas.join(', ') : guia.idiomas}` : ''}`}
                  </option>
                );
              })}
            </select>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              {guias.length === 0 ? 'No hay guías disponibles' : 'Opcional: Asignar una guía específica'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Destino
            </label>
            <select
              name="destino_id"
              value={formData.destino_id}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Sin destino asignado</option>
              {destinos.map(destino => {
                const destinoId = destino.id || destino._id;
                const destinoNombre = destino.nombre || destino.ciudad || 'Destino sin nombre';
                const destinoUbicacion = destino.ubicacion || destino.provincia || destino.pais || 'Sin ubicación';
                
                // Log para debugging
                if (destinos.length > 0 && destino === destinos[0]) {
                  console.log('🗺️ Ejemplo de destino:', destino);
                  console.log('🔑 ID del destino:', destinoId);
                  console.log('📍 Destino actual seleccionado:', formData.destino_id);
                }
                
                return (
                  <option key={destinoId} value={destinoId}>
                    {`${destinoNombre} - ${destinoUbicacion}`}
                  </option>
                );
              })}
            </select>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              {destinos.length === 0 ? 'No hay destinos disponibles' : `${destinos.length} destino(s) disponible(s)`}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <ImageUploader
              currentImage={formData.imagen_url}
              onImageUploaded={(url) => {
                setFormData(prev => ({
                  ...prev,
                  imagen_url: url
                }));
              }}
              uploadEndpoint="/admin/upload/tour"
              label="Imagen del Tour"
            />
          </div>

          <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="disponible"
              name="disponible"
              checked={formData.disponible}
              onChange={handleChange}
              style={{ transform: 'scale(1.2)' }}
            />
            <label htmlFor="disponible" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Tour disponible para reservas
            </label>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#8b5cf6',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TourForm;