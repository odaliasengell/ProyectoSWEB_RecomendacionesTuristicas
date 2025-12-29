import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentForm } from '../components/payment/PaymentForm';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import './PaymentPage.css';

interface ItemDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'tour' | 'servicio';
  provider: string;
  duration?: string;
  location?: string;
  image?: string;
}

export const PaymentPage: React.FC = () => {
  const { itemId, itemType } = useParams<{ itemId: string; itemType: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Obtener cantidad y precio desde URL params si vienen de un carrito
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const customPrice = parseFloat(searchParams.get('price') || '0');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { state: { from: `/payment/${itemType}/${itemId}` } });
      return;
    }

    fetchItemDetails();
  }, [itemId, itemType, user, token]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      const baseURL = 'http://localhost:8000/api';
      
      if (itemType === 'tour') {
        endpoint = `${baseURL}/tours/${itemId}`;
      } else if (itemType === 'servicio') {
        endpoint = `${baseURL}/servicios/${itemId}`;
      } else {
        throw new Error('Tipo de item no válido');
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar la información del item');
      }

      const data = await response.json();
      
      const details: ItemDetails = {
        id: data.id || data.tour_id || data.servicio_id,
        name: data.nombre || data.name,
        description: data.descripcion || data.description,
        price: customPrice || data.precio || data.price || 0,
        type: itemType as 'tour' | 'servicio',
        provider: data.proveedor || data.provider || 'Sistema de Recomendaciones',
        duration: data.duracion || data.duration,
        location: data.ubicacion || data.location,
        image: data.imagen || data.image
      };

      setItemDetails(details);
    } catch (error) {
      console.error('Error al cargar item:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('✅ Pago exitoso:', paymentData);
      setPaymentResult(paymentData);
      setPaymentSuccess(true);

      // Registrar la compra/reserva en el sistema
      await registerPurchase(paymentData);

      // Mostrar notificación de éxito
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { 
            message: `¡Pago exitoso! Tu ${itemType} "${itemDetails?.name}" ha sido confirmado.`,
            type: 'success'
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Error post-pago:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Error en pago:', error);
    setError(error);
    
    // Auto-limpiar error después de 5 segundos
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  const registerPurchase = async (paymentData: any) => {
    try {
      const baseURL = 'http://localhost:8000/api';
      let endpoint = '';
      let body: any = {
        usuario_id: user?.id,
        payment_id: paymentData.payment_id,
        amount: paymentData.amount,
        currency: 'USD',
        status: 'confirmed',
        payment_method: paymentData.payment_method || 'mock'
      };

      if (itemType === 'tour') {
        endpoint = `${baseURL}/reservas`;
        body.tour_id = itemId;
        body.fecha_reserva = new Date().toISOString();
        body.cantidad_personas = quantity;
      } else if (itemType === 'servicio') {
        endpoint = `${baseURL}/contrataciones`;
        body.servicio_id = itemId;
        body.fecha_contratacion = new Date().toISOString();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('Error al registrar compra, pero pago exitoso');
      } else {
        console.log('✅ Compra registrada exitosamente');
      }
    } catch (error) {
      console.error('Error al registrar compra:', error);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando información del pago...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !itemDetails) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-error">
          <div className="error-container">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => navigate(-1)} className="btn-secondary">
                ← Volver
              </button>
              <button onClick={() => window.location.reload()} className="btn-primary">
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentSuccess && paymentResult) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="payment-success">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h1>¡Pago Exitoso!</h1>
            <p className="success-message">
              Tu pago por <strong>{itemDetails?.name}</strong> ha sido procesado correctamente.
            </p>
            
            <div className="payment-details">
              <h3>Detalles del Pago</h3>
              <div className="detail-row">
                <span>ID de Pago:</span>
                <span>{paymentResult.payment_id}</span>
              </div>
              <div className="detail-row">
                <span>Monto:</span>
                <span>${(paymentResult.amount / 100).toFixed(2)} USD</span>
              </div>
              <div className="detail-row">
                <span>Método:</span>
                <span>{paymentResult.payment_method || 'Mock'}</span>
              </div>
              <div className="detail-row">
                <span>Estado:</span>
                <span className="status-confirmed">Confirmado</span>
              </div>
            </div>

            <div className="success-actions">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn-primary"
              >
                🏠 Ir al Dashboard
              </button>
              <button 
                onClick={() => navigate(`/${itemType}s`)} 
                className="btn-secondary"
              >
                Ver más {itemType === 'tour' ? 'Tours' : 'Servicios'}
              </button>
            </div>

            <p className="redirect-note">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalAmount = itemDetails ? itemDetails.price * quantity : 0;

  return (
    <div className="payment-page">
      <Navbar />
      
      <main className="payment-main">
        <div className="payment-container">
          {/* Información del Item */}
          <div className="item-summary">
            <h1>Finalizar Pago</h1>
            
            {itemDetails && (
              <div className="item-card">
                {itemDetails.image && (
                  <div className="item-image">
                    <img src={itemDetails.image} alt={itemDetails.name} />
                  </div>
                )}
                
                <div className="item-info">
                  <h2>{itemDetails.name}</h2>
                  <p className="item-type">
                    {itemType === 'tour' ? '🎯 Tour' : '🔧 Servicio'}
                  </p>
                  <p className="item-description">{itemDetails.description}</p>
                  
                  <div className="item-details">
                    {itemDetails.provider && (
                      <div className="detail-item">
                        <span>Proveedor:</span>
                        <span>{itemDetails.provider}</span>
                      </div>
                    )}
                    
                    {itemDetails.duration && (
                      <div className="detail-item">
                        <span>Duración:</span>
                        <span>{itemDetails.duration}</span>
                      </div>
                    )}
                    
                    {itemDetails.location && (
                      <div className="detail-item">
                        <span>Ubicación:</span>
                        <span>{itemDetails.location}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span>Precio unitario:</span>
                      <span>${itemDetails.price.toFixed(2)} USD</span>
                    </div>
                    
                    {quantity > 1 && (
                      <div className="detail-item">
                        <span>Cantidad:</span>
                        <span>{quantity}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="total-amount">
                    <span>Total a pagar:</span>
                    <span className="amount">${totalAmount.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de Pago */}
          {itemDetails && (
            <PaymentForm
              tourId={itemType === 'tour' ? itemId : undefined}
              servicioId={itemType === 'servicio' ? itemId : undefined}
              amount={totalAmount}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}

          {/* Mostrar errores */}
          {error && (
            <div className="payment-error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span className="error-message">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="error-close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};