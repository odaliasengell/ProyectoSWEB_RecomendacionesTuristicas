import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, MapPin, Edit2, Save, X, Camera, Shield, Heart, Star, Award, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, isAuthenticated, showNotification, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    birthDate: '',
    bio: '',
    favoriteDestination: '',
    travelStyle: 'aventura'
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        birthDate: user.birthDate || '',
        bio: user.bio || '',
        favoriteDestination: user.favoriteDestination || '',
        travelStyle: user.travelStyle || 'aventura'
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres';
    }

    if (!formData.birthDate) {
      errors.birthDate = 'La fecha de nacimiento es requerida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      // Usar la función updateProfile del contexto
      const result = await updateProfile(formData);
      
      if (result.success) {
        showNotification('¡Perfil actualizado exitosamente!', 'success');
        setIsEditing(false);
      } else {
        showNotification(result.error || 'Error al actualizar el perfil', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showNotification('Error al actualizar el perfil. Intenta de nuevo.', 'error');
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      birthDate: user.birthDate || '',
      bio: user.bio || '',
      favoriteDestination: user.favoriteDestination || '',
      travelStyle: user.travelStyle || 'aventura'
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Estilos
  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
    paddingTop: '80px',
    paddingBottom: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif'
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '2rem'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 auto 1.5rem',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    backgroundColor: 'white'
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  };

  const labelStyle = {
    display: 'block',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: 'none'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #d1d5db'
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  const backButtonStyle = {
    position: 'fixed',
    top: '100px',
    left: '2rem',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(5, 150, 105, 0.3)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 100,
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    color: '#059669'
  };

  const backButtonHoverStyle = {
    ...backButtonStyle,
    background: '#059669',
    color: 'white',
    transform: 'scale(1.1)',
    boxShadow: '0 20px 30px -5px rgba(5, 150, 105, 0.3)'
  };

  const statCardStyle = {
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  };

  if (isLoading) {
    return (
      <div style={{...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🔄</div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={pageStyle}>
      {/* Botón de regreso al inicio */}
      <Link 
        to="/"
        style={backButtonStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, backButtonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, backButtonStyle)}
        title="Regresar al inicio"
      >
        <ArrowLeft size={20} />
      </Link>

      <div style={containerStyle} className="profile-container">
        {/* Panel Izquierdo - Info Principal */}
        <div style={cardStyle}>
          <div style={avatarStyle}>
            {user.firstName?.charAt(0) || 'U'}
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#059669',
              borderRadius: '50%',
              padding: '0.5rem',
              border: '3px solid white'
            }}>
              <Camera size={16} />
            </div>
          </div>

          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {user.firstName} {user.lastName}
            </h1>
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>
              @{user.username}
            </p>
            {user.birthDate && (
              <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                {calculateAge(user.birthDate)} años
              </p>
            )}
          </div>

          {/* Estadísticas */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem'}}>
            <div style={statCardStyle}>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#059669'}}>5</div>
              <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Destinos Visitados</div>
            </div>
            <div style={statCardStyle}>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#059669'}}>12</div>
              <div style={{fontSize: '0.8rem', color: '#6b7280'}}>Reseñas Escritas</div>
            </div>
          </div>

          {/* Información Rápida */}
          <div style={{space: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6'}}>
              <Mail size={16} style={{color: '#6b7280'}} />
              <span style={{fontSize: '0.875rem', color: '#374151'}}>{user.email}</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6'}}>
              <Calendar size={16} style={{color: '#6b7280'}} />
              <span style={{fontSize: '0.875rem', color: '#374151'}}>
                Miembro desde {formatDate(user.createdAt)}
              </span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0'}}>
              <MapPin size={16} style={{color: '#6b7280'}} />
              <span style={{fontSize: '0.875rem', color: '#374151'}}>
                {user.favoriteDestination || 'Ecuador 🇪🇨'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario de Edición */}
        <div style={cardStyle}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'}}>
              Información Personal
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={primaryButtonStyle}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <Edit2 size={16} />
                Editar
              </button>
            ) : (
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button
                  onClick={handleSave}
                  style={primaryButtonStyle}
                >
                  <Save size={16} />
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  style={secondaryButtonStyle}
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div style={{display: 'grid', gap: '1.5rem'}}>
            {/* Nombres */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={validationErrors.firstName ? inputErrorStyle : inputStyle}
                />
                {validationErrors.firstName && (
                  <div style={errorStyle}>{validationErrors.firstName}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={validationErrors.lastName ? inputErrorStyle : inputStyle}
                />
                {validationErrors.lastName && (
                  <div style={errorStyle}>{validationErrors.lastName}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={validationErrors.email ? inputErrorStyle : inputStyle}
              />
              {validationErrors.email && (
                <div style={errorStyle}>{validationErrors.email}</div>
              )}
            </div>

            {/* Username y Fecha */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={validationErrors.username ? inputErrorStyle : inputStyle}
                />
                {validationErrors.username && (
                  <div style={errorStyle}>{validationErrors.username}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  style={validationErrors.birthDate ? inputErrorStyle : inputStyle}
                />
                {validationErrors.birthDate && (
                  <div style={errorStyle}>{validationErrors.birthDate}</div>
                )}
              </div>
            </div>

            {/* Biografía */}
            <div>
              <label style={labelStyle}>Biografía</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Cuéntanos sobre ti y tus aventuras..."
                style={{
                  ...inputStyle,
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Destino Favorito */}
            <div>
              <label style={labelStyle}>Destino Favorito</label>
              <input
                type="text"
                name="favoriteDestination"
                value={formData.favoriteDestination}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="¿Cuál es tu lugar favorito en Ecuador?"
                style={inputStyle}
              />
            </div>

            {/* Estilo de Viaje */}
            <div>
              <label style={labelStyle}>Estilo de Viaje</label>
              <select
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleInputChange}
                disabled={!isEditing}
                style={inputStyle}
              >
                <option value="aventura">Aventura</option>
                <option value="cultural">Cultural</option>
                <option value="relajante">Relajante</option>
                <option value="gastronomico">Gastronómico</option>
                <option value="ecologico">Ecológico</option>
                <option value="fotografico">Fotográfico</option>
              </select>
            </div>
          </div>

          {/* Logros */}
          <div style={{marginTop: '3rem'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem'}}>
              Logros y Insignias
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
              <div style={{...statCardStyle, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                <Award size={24} style={{color: '#f59e0b', margin: '0 auto 0.5rem'}} />
                <div style={{fontSize: '0.8rem', color: '#92400e'}}>Explorador Novato</div>
              </div>
              <div style={{...statCardStyle, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                <Heart size={24} style={{color: '#ef4444', margin: '0 auto 0.5rem'}} />
                <div style={{fontSize: '0.8rem', color: '#991b1b'}}>Amante de Ecuador</div>
              </div>
              <div style={{...statCardStyle, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                <Star size={24} style={{color: '#3b82f6', margin: '0 auto 0.5rem'}} />
                <div style={{fontSize: '0.8rem', color: '#1e40af'}}>Reseñador</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para responsive */}
      <style jsx="true">{`
        @media (max-width: 768px) {
          .profile-container {
            grid-template-columns: 1fr !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;