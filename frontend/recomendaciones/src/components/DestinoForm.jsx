import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';

const DestinoForm = ({ 
  show, 
  onClose, 
  onSave, 
  destino = null, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    provincia: '',
    ciudad: '',
    ubicacion: '',
    ruta: '',
    categoria: '',
    calificacion_promedio: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'playa', 'montaña', 'ciudad', 'isla', 'selva', 'volcán', 
    'páramo', 'costa', 'sierra', 'oriente', 'histórico', 'cultural'
  ];

  const provincias = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana',
    'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
    'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
  ];

  useEffect(() => {
    if (destino && isEditing) {
      setFormData({
        nombre: destino.nombre || '',
        descripcion: destino.descripcion || '',
        provincia: destino.provincia || '',
        ciudad: destino.ciudad || '',
        ubicacion: destino.ubicacion || '',
        ruta: destino.ruta || '',
        categoria: destino.categoria || '',
        calificacion_promedio: destino.calificacion_promedio || 0
      });
    } else {
      // Reset form for new destino
      setFormData({
        nombre: '',
        descripcion: '',
        provincia: '',
        ciudad: '',
        ubicacion: '',
        ruta: '',
        categoria: '',
        calificacion_promedio: 0
      });
    }
    setErrors({});
  }, [destino, isEditing, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.provincia.trim()) {
      newErrors.provincia = 'La provincia es requerida';
    }
    
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }
    
    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida';
    }

    const calificacion = parseFloat(formData.calificacion_promedio);
    if (calificacion < 0 || calificacion > 5) {
      newErrors.calificacion_promedio = 'La calificación debe estar entre 0 y 5';
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
        calificacion_promedio: parseFloat(formData.calificacion_promedio) || 0
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving destino:', error);
      alert('Error al guardar el destino');
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
    maxWidth: '600px',
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
            <MapPin size={24} color="#3b82f6" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              {isEditing ? 'Editar Destino' : 'Nuevo Destino'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Nombre del Destino *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={errors.nombre ? errorInputStyle : inputStyle}
                placeholder="Ej: Galápagos"
              />
              {errors.nombre && <div style={errorStyle}>{errors.nombre}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={errors.categoria ? errorInputStyle : inputStyle}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && <div style={errorStyle}>{errors.categoria}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Provincia *
              </label>
              <select
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                style={errors.provincia ? errorInputStyle : inputStyle}
              >
                <option value="">Seleccionar provincia</option>
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
              {errors.provincia && <div style={errorStyle}>{errors.provincia}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Ciudad *
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                style={errors.ciudad ? errorInputStyle : inputStyle}
                placeholder="Ej: Puerto Ayora"
              />
              {errors.ciudad && <div style={errorStyle}>{errors.ciudad}</div>}
            </div>
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
              placeholder="Descripción del destino..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Ubicación General
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Ej: Ecuador, Sudamérica"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Ruta/URL
              </label>
              <input
                type="text"
                name="ruta"
                value={formData.ruta}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Ej: /galapagos"
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>
              Calificación Promedio (0-5)
            </label>
            <input
              type="number"
              name="calificacion_promedio"
              value={formData.calificacion_promedio}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              style={errors.calificacion_promedio ? errorInputStyle : inputStyle}
              placeholder="4.5"
            />
            {errors.calificacion_promedio && <div style={errorStyle}>{errors.calificacion_promedio}</div>}
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
                backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
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

export default DestinoForm;