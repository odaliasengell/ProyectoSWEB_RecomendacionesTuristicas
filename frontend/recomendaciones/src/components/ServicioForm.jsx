import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import ImageUploader from './ImageUploader';

const ServicioForm = ({ 
  show, 
  onClose, 
  onSave, 
  servicio = null, 
  isEditing = false,
  destinos = []
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    destino: '',
    duracion_dias: 1,
    capacidad_maxima: 1,
    disponible: true,
    proveedor: '',
    telefono_contacto: '',
    email_contacto: '',
    imagen_url: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'hotel', 'tour', 'transporte', 'restaurante', 'actividad', 
    'evento', 'spa', 'aventura', 'cultural', 'gastronomico'
  ];

  useEffect(() => {
    if (servicio && isEditing) {
      console.log('📝 Cargando servicio para editar:', servicio);
      console.log('   - disponible (raw):', servicio.disponible);
      console.log('   - tipo de disponible:', typeof servicio.disponible);
      
      // Asegurar que el valor sea booleano
      const disponibleValue = servicio.disponible === true || servicio.disponible === 'true';
      const servicioId = servicio.id || servicio._id;
      console.log('   - disponible (procesado):', disponibleValue);
      console.log('   - ID del servicio:', servicioId);
      
      setFormData({
        id: servicioId,
        nombre: servicio.nombre || '',
        descripcion: servicio.descripcion || '',
        precio: servicio.precio || 0,
        categoria: servicio.categoria || '',
        destino: servicio.destino || '',
        duracion_dias: servicio.duracion_dias || 1,
        capacidad_maxima: servicio.capacidad_maxima || 1,
        disponible: disponibleValue,
        proveedor: servicio.proveedor || '',
        telefono_contacto: servicio.telefono_contacto || '',
        email_contacto: servicio.email_contacto || '',
        imagen_url: servicio.imagen_url || ''
      });
    } else {
      console.log('📝 Creando nuevo servicio (disponible = true por defecto)');
      setFormData({
        id: null,
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        destino: '',
        duracion_dias: 1,
        capacidad_maxima: 1,
        disponible: true,
        proveedor: '',
        telefono_contacto: '',
        email_contacto: '',
        imagen_url: ''
      });
    }
    setErrors({});
  }, [servicio, isEditing, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log(`🔄 Campo cambiado: ${name} = ${newValue} (type: ${type})`);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
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
      newErrors.nombre = 'El nombre del servicio es requerido';
    }
    
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }
    
    if (!formData.destino.trim()) {
      newErrors.destino = 'El destino es requerido';
    }
    
    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (!formData.proveedor.trim()) {
      newErrors.proveedor = 'El proveedor es requerido';
    }

    if (formData.email_contacto && !/\S+@\S+\.\S+/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'Email inválido';
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
        duracion_dias: parseInt(formData.duracion_dias) || 1,
        capacidad_maxima: parseInt(formData.capacidad_maxima) || 1
      };
      
      console.log('💾 Enviando datos del servicio:', submitData);
      console.log('   - disponible:', submitData.disponible, '(tipo:', typeof submitData.disponible, ')');
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving servicio:', error);
      alert('Error al guardar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  // Debug: mostrar estado actual del formulario
  console.log('🎨 Renderizando formulario - disponible:', formData.disponible, 'tipo:', typeof formData.disponible);

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
            <Building2 size={24} color="#f59e0b" />
            <h2 style={{ margin: 0, color: '#1f2937' }}>
              {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
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
                Nombre del Servicio *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={errors.nombre ? errorInputStyle : inputStyle}
                placeholder="Ej: Hotel Boutique Centro Histórico"
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
              placeholder="Descripción detallada del servicio, amenidades, características especiales..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Destino *
              </label>
              <select
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                style={errors.destino ? errorInputStyle : inputStyle}
              >
                <option value="">Seleccionar destino</option>
                {destinos.map(dest => (
                  <option key={dest.id_destino} value={dest.nombre}>{dest.nombre}</option>
                ))}
              </select>
              {errors.destino && <div style={errorStyle}>{errors.destino}</div>}
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                {destinos.length === 0 ? 'No hay destinos disponibles. Créalos primero.' : `${destinos.length} destino(s) disponible(s)`}
              </div>
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
                placeholder="75.00"
              />
              {errors.precio && <div style={errorStyle}>{errors.precio}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Duración (días)
              </label>
              <input
                type="number"
                name="duracion_dias"
                value={formData.duracion_dias}
                onChange={handleChange}
                min="1"
                style={inputStyle}
                placeholder="1"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Proveedor/Empresa *
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                style={errors.proveedor ? errorInputStyle : inputStyle}
                placeholder="Ej: Hotel Galápagos S.A."
              />
              {errors.proveedor && <div style={errorStyle}>{errors.proveedor}</div>}
            </div>

            <div>
              <label style={labelStyle}>
                Capacidad Máxima
              </label>
              <input
                type="number"
                name="capacidad_maxima"
                value={formData.capacidad_maxima}
                onChange={handleChange}
                min="1"
                style={inputStyle}
                placeholder="4"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono_contacto"
                value={formData.telefono_contacto}
                onChange={handleChange}
                style={inputStyle}
                placeholder="099-123-4567"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Email de Contacto
              </label>
              <input
                type="email"
                name="email_contacto"
                value={formData.email_contacto}
                onChange={handleChange}
                style={errors.email_contacto ? errorInputStyle : inputStyle}
                placeholder="info@servicio.com"
              />
              {errors.email_contacto && <div style={errorStyle}>{errors.email_contacto}</div>}
            </div>
          </div>

          {/* Componente de subida de imagen */}
          <div style={{ marginBottom: '30px' }}>
            <ImageUploader
              currentImage={formData.imagen_url}
              onImageUploaded={(url) => {
                setFormData(prev => ({
                  ...prev,
                  imagen_url: url
                }));
              }}
              uploadEndpoint="/admin/upload/servicio"
              label="Imagen del Servicio"
            />
          </div>

          <div style={{ marginBottom: '30px', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="disponible"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
              />
              <label htmlFor="disponible" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                Servicio disponible para reservas
              </label>
              <span style={{ 
                marginLeft: 'auto', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: '600',
                background: formData.disponible ? '#dcfce7' : '#fee2e2',
                color: formData.disponible ? '#166534' : '#991b1b'
              }}>
                {formData.disponible ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
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
                backgroundColor: isSubmitting ? '#9ca3af' : '#f59e0b',
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

export default ServicioForm;