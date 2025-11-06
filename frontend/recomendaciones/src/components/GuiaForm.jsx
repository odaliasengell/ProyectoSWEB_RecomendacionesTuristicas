import React, { useState, useEffect } from 'react';
import { X, Save, Camera } from 'lucide-react';

const GuiaForm = ({ 
  show, 
  onClose, 
  onSave, 
  guia = null, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    idiomas: [],
    experiencia: '',
    disponible: true,
    calificacion: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idiomasComunes = [
    'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués',
    'Mandarín', 'Japonés', 'Kichwa', 'Shuar'
  ];

  useEffect(() => {
    if (guia && isEditing) {
      const guiaId = guia.id || guia._id || guia.id_guia;
      setFormData({
        id: guiaId,
        nombre: guia.nombre || '',
        email: guia.email || '',
        telefono: guia.telefono || '',
        idiomas: Array.isArray(guia.idiomas) ? guia.idiomas : (guia.idiomas ? [guia.idiomas] : []),
        experiencia: guia.experiencia || '',
        disponible: guia.disponible !== undefined ? guia.disponible : true,
        calificacion: guia.calificacion || 0
      });
    } else {
      setFormData({
        id: null,
        nombre: '',
        email: '',
        telefono: '',
        idiomas: [],
        experiencia: '',
        disponible: true,
        calificacion: 0
      });
    }
    setErrors({});
  }, [guia, isEditing, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.idiomas || formData.idiomas.length === 0) {
      newErrors.idiomas = 'Al menos un idioma es requerido';
    }
    
    if (!formData.experiencia.trim()) {
      newErrors.experiencia = 'La descripción de experiencia es requerida';
    }

    const calificacion = parseFloat(formData.calificacion);
    if (calificacion < 0 || calificacion > 5) {
      newErrors.calificacion = 'La calificación debe estar entre 0 y 5';
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
      // Preparar datos según el modelo backend
      const submitData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        idiomas: formData.idiomas,
        experiencia: formData.experiencia,
        disponible: formData.disponible,
        calificacion: parseFloat(formData.calificacion) || 0
      };
      
      // Si hay id, incluirlo para edición
      if (formData.id) {
        submitData.id = formData.id;
      }
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving guía:', error);
      alert('Error al guardar la guía');
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
            <Camera size={24} color="#10b981" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              {isEditing ? 'Editar Guía' : 'Nueva Guía'}
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
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={errors.nombre ? errorInputStyle : inputStyle}
                placeholder="Ej: María González"
              />
              {errors.nombre && <div style={errorStyle}>{errors.nombre}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={errors.email ? errorInputStyle : inputStyle}
                placeholder="maria@ejemplo.com"
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={inputStyle}
                placeholder="+593 99 123 4567"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Calificación (0-5)
              </label>
              <input
                type="number"
                name="calificacion"
                value={formData.calificacion}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                style={errors.calificacion ? errorInputStyle : inputStyle}
                placeholder="4.5"
              />
              {errors.calificacion && <div style={errorStyle}>{errors.calificacion}</div>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Idiomas * (separados por comas)
            </label>
            <input
              type="text"
              name="idiomas"
              value={Array.isArray(formData.idiomas) ? formData.idiomas.join(', ') : formData.idiomas}
              onChange={(e) => {
                const value = e.target.value;
                const idiomasArray = value.split(',').map(i => i.trim()).filter(i => i);
                setFormData(prev => ({ ...prev, idiomas: idiomasArray }));
                if (errors.idiomas) {
                  setErrors(prev => ({ ...prev, idiomas: '' }));
                }
              }}
              style={errors.idiomas ? errorInputStyle : inputStyle}
              placeholder="Ej: Español, Inglés, Francés"
            />
            {errors.idiomas && <div style={errorStyle}>{errors.idiomas}</div>}
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              Separar con comas. Sugeridos: {idiomasComunes.join(', ')}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Experiencia y Especialidades *
            </label>
            <textarea
              name="experiencia"
              value={formData.experiencia}
              onChange={handleChange}
              rows="4"
              style={{
                ...(errors.experiencia ? errorInputStyle : inputStyle),
                resize: 'vertical',
                minHeight: '100px'
              }}
              placeholder="Describe la experiencia, certificaciones, especialidades en tipos de turismo, etc."
            />
            {errors.experiencia && <div style={errorStyle}>{errors.experiencia}</div>}
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
              Disponible para tours
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
                backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
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

export default GuiaForm;