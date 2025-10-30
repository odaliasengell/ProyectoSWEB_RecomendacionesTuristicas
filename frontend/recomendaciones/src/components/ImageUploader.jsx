import React, { useState, useRef, useEffect } from 'react';

/**
 * Componente reutilizable para subir imágenes
 * @param {string} currentImage - URL de la imagen actual (opcional)
 * @param {function} onImageUploaded - Callback cuando la imagen se sube exitosamente
 * @param {string} uploadEndpoint - Endpoint del backend (ej: '/admin/upload/destino')
 * @param {string} label - Texto del label
 * @param {string} apiUrl - URL base del API (por defecto: http://localhost:8000)
 */
const ImageUploader = ({ 
  currentImage, 
  onImageUploaded, 
  uploadEndpoint = '/admin/upload/destino',
  label = 'Imagen del Destino',
  apiUrl = 'http://localhost:8000'
}) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const API_URL = apiUrl;

  // Actualizar preview cuando cambia currentImage (al editar diferentes destinos)
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  // Estilos inline consistentes con DestinoForm
  const containerStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const uploadAreaStyle = {
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9fafb'
  };

  const uploadAreaHoverStyle = {
    ...uploadAreaStyle,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4'
  };

  const previewContainerStyle = {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb'
  };

  const previewImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  };

  const deleteButtonStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    borderWidth: '0',
    borderStyle: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const loadingOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#fecaca',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    marginTop: '10px'
  };

  const instructionsStyle = {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px'
  };

  const validateFile = (file) => {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Formato no permitido. Solo JPG, PNG o WebP';
    }

    // Sin límite de tamaño
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar archivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      // Obtener token de admin
      const token = localStorage.getItem('adminToken');
      
      console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
      
      if (!token) {
        throw new Error('No estás autenticado como administrador. Por favor inicia sesión.');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Subiendo imagen a:', `${API_URL}${uploadEndpoint}`);

      // Subir al backend
      const response = await fetch(`${API_URL}${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('📥 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        console.error('❌ Error del servidor:', errorData);
        
        // Mensaje más específico para error de autenticación
        if (response.status === 403 || response.status === 401) {
          throw new Error('Sesión expirada. Cierra sesión y vuelve a iniciar sesión como administrador.');
        }
        
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Imagen subida exitosamente:', data);
      
      // Notificar al componente padre
      if (onImageUploaded) {
        onImageUploaded(data.url);
      }

    } catch (err) {
      console.error('💥 Error subiendo imagen:', err);
      setError(err.message);
      setPreview(currentImage || null); // Revertir preview
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageUploaded) {
      onImageUploaded('');
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>
        {label}
      </label>

      {/* Preview de la imagen */}
      {preview ? (
        <div 
          style={previewContainerStyle}
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
        >
          <img
            src={preview}
            alt="Preview"
            style={previewImageStyle}
            onError={() => setPreview(null)}
          />
          
          {/* Overlay con botón de eliminar */}
          <div style={{ ...overlayStyle, opacity: showOverlay ? 1 : 0 }}>
            <button
              type="button"
              onClick={handleRemoveImage}
              style={deleteButtonStyle}
              disabled={uploading}
            >
              ✕ Eliminar Imagen
            </button>
          </div>

          {/* Indicador de carga */}
          {uploading && (
            <div style={loadingOverlayStyle}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: '#e5e7eb',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Subiendo...</span>
            </div>
          )}
        </div>
      ) : (
        /* Área de drop/click */
        <div
          onClick={() => fileInputRef.current?.click()}
          style={isHovered ? uploadAreaHoverStyle : uploadAreaStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: '#e5e7eb',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Subiendo imagen...</p>
            </div>
          ) : (
            <div>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '10px',
                opacity: 0.5
              }}>
                🖼️
              </div>
              <p style={{ 
                marginTop: 0,
                marginBottom: '5px',
                marginLeft: 0,
                marginRight: 0,
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151'
              }}>
                Haz clic para subir una imagen
              </p>
              <p style={instructionsStyle}>
                PNG, JPG o WebP
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {/* Mensaje de error */}
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {/* CSS para animación de spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageUploader;
