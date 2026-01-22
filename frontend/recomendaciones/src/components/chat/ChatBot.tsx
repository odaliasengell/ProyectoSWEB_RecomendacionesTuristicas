import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { WebSocketMessage } from '../../services/websocket.service';
import { useConfirmation } from '../../hooks/useConfirmation';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { WebSocketStatus } from '../common/WebSocketStatus';
import './ChatBot.css';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  isLoading?: boolean;
}

interface Attachment {
  type: 'image' | 'pdf' | 'audio';
  name: string;
  url: string;
  size: number;
}

interface ChatResponse {
  message: string;
  type: 'text' | 'action' | 'recommendation';
  actions?: ChatAction[];
  data?: any;
}

interface ChatAction {
  label: string;
  action: string;
  params?: any;
}

export const ChatBot: React.FC = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [quickActions, setQuickActions] = useState<ChatAction[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Hook de confirmaciones - Semana 4
  const {
    currentConfirmation,
    isOpen: isConfirmationOpen,
    showPaymentConfirmation,
    showTourPurchaseConfirmation,
    showPartnerReservationConfirmation,
    showSystemNotification,
    close: closeConfirmation
  } = useConfirmation();

  // WebSocket para recibir notificaciones del partner - Semana 3
  const { 
    isConnected, 
    subscribe,
    getLastMessageByType 
  } = useWebSocket({ 
    autoConnect: true, 
    subscribeToAll: true,
    onMessage: handleWebSocketMessage
  });

  // Handler para mensajes del WebSocket (confirmaciones del partner)
  function handleWebSocketMessage(wsMessage: WebSocketMessage) {
    console.log('📨 [ChatBot] Mensaje WebSocket recibido:', wsMessage);

    let chatMessage: Message | null = null;

    switch (wsMessage.type) {
      case 'payment_confirmation':
        chatMessage = {
          id: `ws_payment_${Date.now()}`,
          type: 'system',
          content: `✅ **Pago Confirmado**\n\n💰 Monto: $${wsMessage.data?.amount} ${wsMessage.data?.currency || 'USD'}\n📦 Ítem: ${wsMessage.data?.item_name || 'Sin especificar'}\n🆔 ID: ${wsMessage.data?.payment_id}\n\nTu pago ha sido procesado exitosamente.`,
          timestamp: new Date()
        };
        break;

      case 'tour_purchased':
        chatMessage = {
          id: `ws_tour_${Date.now()}`,
          type: 'system',
          content: `🎯 **Tour Adquirido**\n\n📍 Tour: ${wsMessage.data?.tour_name || 'Sin especificar'}\n💰 Monto: $${wsMessage.data?.amount || 0}\n👤 Usuario: ${wsMessage.data?.user_id || 'Desconocido'}\n\n¡Disfruta tu experiencia! Se ha notificado al grupo partner.`,
          timestamp: new Date()
        };
        break;

      case 'reserva_confirmada':
        chatMessage = {
          id: `ws_reserva_${Date.now()}`,
          type: 'system',
          content: `🏨 **Reserva Confirmada - Partner**\n\n✅ El grupo Reservas ULEAM ha confirmado tu reserva\n🆔 Reserva ID: ${wsMessage.data?.reservation_id || 'N/A'}\n📅 Estado: ${wsMessage.data?.status || 'confirmado'}\n\n¡Tu itinerario está completo! ¿Te gustaría ver detalles adicionales?`,
          timestamp: new Date()
        };
        break;

      case 'partner_notification':
        chatMessage = {
          id: `ws_partner_${Date.now()}`,
          type: 'system',
          content: `🤝 **Notificación del Partner**\n\n📨 Evento: ${wsMessage.data?.event_type || 'evento'}\n🏢 Partner: ${wsMessage.data?.partner_id || 'Reservas ULEAM'}\n📊 Estado: ${wsMessage.data?.status || 'recibido'}\n\n${wsMessage.data?.message || 'Se ha procesado una actualización de nuestro socio comercial.'}`,
          timestamp: new Date()
        };
        break;

      case 'system_message':
        chatMessage = {
          id: `ws_system_${Date.now()}`,
          type: 'system',
          content: `🔔 **Mensaje del Sistema**\n\n${wsMessage.data?.message || 'Actualización del sistema'}\n\nFecha: ${new Date().toLocaleString()}`,
          timestamp: new Date()
        };
        break;

      default:
        console.log('Tipo de mensaje WebSocket no manejado:', wsMessage.type);
        return;
    }

    if (chatMessage && isOpen) {
      setMessages(prev => [...prev, chatMessage!]);
    }
  }

  // Mensaje inicial cuando se abre el chat por primera vez
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `¡Hola${user?.nombre ? `, ${user.nombre}` : ''}! 👋\n\nSoy tu asistente virtual de turismo. Puedo ayudarte con:\n\n• 🔍 Buscar destinos, tours y servicios\n• 📅 Hacer reservas y contrataciones\n• 💳 Procesar pagos\n• 📊 Ver reportes y estadísticas\n• 📋 Gestionar tus recomendaciones\n\nTambién puedo procesar imágenes 📸, PDFs 📄 y notas de voz 🎤.\n\n¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, user]);

  // Auto-scroll a los mensajes nuevos
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      attachments: await processAttachments()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const response = await sendToAIOrchestrator(userMessage);
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        type: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Ejecutar acciones si las hay
      if (response.actions) {
        await executeActions(response.actions);
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processAttachments = async (): Promise<Attachment[]> => {
    const attachments: Attachment[] = [];

    for (const file of attachedFiles) {
      try {
        // Crear FormData para subir el archivo
        const formData = new FormData();
        formData.append('file', file);

        // Subir archivo al servidor
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          attachments.push({
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type === 'application/pdf' ? 'pdf' : 'audio',
            name: file.name,
            url: url,
            size: file.size
          });
        }
      } catch (error) {
        console.error('Error subiendo archivo:', error);
      }
    }

    return attachments;
  };

  const sendToAIOrchestrator = async (message: Message): Promise<ChatResponse> => {
    // Simular llamada al AI Orchestrator (puerto 8300 según la arquitectura)
    const response = await fetch('http://localhost:8300/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: user?.id,
        message: message.content,
        attachments: message.attachments,
        context: {
          conversation_history: messages.slice(-5), // Últimos 5 mensajes
          user_data: {
            name: user?.nombre,
            email: user?.email,
            preferences: {}
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Error en AI Orchestrator');
    }

    return await response.json();
  };

  const executeActions = async (actions: ChatAction[]) => {
    for (const action of actions) {
      try {
        switch (action.action) {
          case 'search_tours':
            await searchTours(action.params);
            break;
          case 'search_services':
            await searchServices(action.params);
            break;
          case 'create_reservation':
            await createReservation(action.params);
            break;
          case 'process_payment':
            await processPayment(action.params);
            break;
          case 'get_statistics':
            await getStatistics(action.params);
            break;
          // Nuevas acciones - Semana 4
          case 'view_reservations':
            await viewReservations(action.params);
            break;
          case 'view_itinerary':
            await viewItinerary(action.params);
            break;
          case 'view_full_itinerary':
            await viewFullItinerary(action.params);
            break;
          case 'contact_partner':
            await contactPartner(action.params);
            break;
          case 'share_experience':
            await shareExperience(action.params);
            break;
          default:
            console.log('Acción no reconocida:', action.action);
        }
      } catch (error) {
        console.error(`Error ejecutando acción ${action.action}:`, error);
      }
    }
  };

  const searchTours = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tours?${new URLSearchParams(params)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tours = await response.json();
      
      const resultsMessage: Message = {
        id: `search_${Date.now()}`,
        type: 'assistant',
        content: `🎯 Encontré ${tours.length} tours que coinciden con tu búsqueda:\n\n${tours.slice(0, 3).map((tour: any) => 
          `• **${tour.nombre}** - $${tour.precio}\n  📍 ${tour.ubicacion}\n  ⭐ ${tour.calificacion || 'Sin calificar'}`
        ).join('\n\n')}${tours.length > 3 ? `\n\n... y ${tours.length - 3} más.` : ''}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, resultsMessage]);
    } catch (error) {
      console.error('Error buscando tours:', error);
    }
  };

  const searchServices = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/servicios?${new URLSearchParams(params)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const servicios = await response.json();
      
      const resultsMessage: Message = {
        id: `search_${Date.now()}`,
        type: 'assistant',
        content: `🔧 Encontré ${servicios.length} servicios disponibles:\n\n${servicios.slice(0, 3).map((servicio: any) => 
          `• **${servicio.nombre}** - $${servicio.precio}\n  📋 ${servicio.descripcion}\n  ⭐ ${servicio.calificacion || 'Sin calificar'}`
        ).join('\n\n')}${servicios.length > 3 ? `\n\n... y ${servicios.length - 3} más.` : ''}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, resultsMessage]);
    } catch (error) {
      console.error('Error buscando servicios:', error);
    }
  };

  const createReservation = async (params: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...params,
          usuario_id: user?.id
        })
      });

      if (response.ok) {
        const reservation = await response.json();
        const successMessage: Message = {
          id: `reservation_${Date.now()}`,
          type: 'assistant',
          content: `✅ ¡Reserva creada exitosamente!\n\n📋 **ID de Reserva:** ${reservation.id}\n💰 **Total:** $${reservation.precio_total}\n📅 **Fecha:** ${new Date(reservation.fecha_reserva).toLocaleDateString()}\n\n¿Te gustaría proceder con el pago?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
    }
  };

  const processPayment = async (params: any) => {
    try {
      // Redirigir a la página de pago
      window.open(`/payment/${params.type}/${params.id}?amount=${params.amount}`, '_blank');
      
      const paymentMessage: Message = {
        id: `payment_${Date.now()}`,
        type: 'assistant',
        content: `💳 Te he redirigido a la página de pago para completar la transacción de $${params.amount}. Una vez completado el pago, recibirás una notificación de confirmación.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, paymentMessage]);
    } catch (error) {
      console.error('Error procesando pago:', error);
    }
  };

  const getStatistics = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/statistics?${new URLSearchParams(params)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const stats = await response.json();
      
      const statsMessage: Message = {
        id: `stats_${Date.now()}`,
        type: 'assistant',
        content: `📊 **Estadísticas de tu cuenta:**\n\n• 🎯 **Reservas:** ${stats.reservas || 0}\n• 🔧 **Servicios contratados:** ${stats.contrataciones || 0}\n• 💰 **Total gastado:** $${stats.total_gastado || 0}\n• ⭐ **Recomendaciones dadas:** ${stats.recomendaciones || 0}\n• 📅 **Miembro desde:** ${stats.fecha_registro ? new Date(stats.fecha_registro).toLocaleDateString() : 'N/A'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, statsMessage]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  // Nuevas funciones - Semana 4
  const viewReservations = async (params: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/user/reservas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reservas = await response.json();
      
      const reservasMessage: Message = {
        id: `reservas_${Date.now()}`,
        type: 'assistant',
        content: `📅 **Tus Reservas:**\n\n${reservas.length === 0 ? 'No tienes reservas actualmente.' : reservas.slice(0, 3).map((reserva: any) => 
          `• **${reserva.tour_name || 'Tour'}**\n  📍 ${reserva.ubicacion || 'Ubicación por confirmar'}\n  📅 ${reserva.fecha ? new Date(reserva.fecha).toLocaleDateString() : 'Fecha por confirmar'}\n  ✅ Estado: ${reserva.estado || 'Pendiente'}`
        ).join('\n\n')}${reservas.length > 3 ? `\n\n... y ${reservas.length - 3} más.` : ''}\n\n🔗 Ver todas: /dashboard?tab=reservas`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reservasMessage]);
      
      // Limpiar acciones rápidas después de usarlas
      setQuickActions([]);
    } catch (error) {
      console.error('Error obteniendo reservas:', error);
    }
  };

  const viewItinerary = async (params: any) => {
    try {
      if (params.tour_id) {
        const response = await fetch(`http://localhost:8000/api/tours/${params.tour_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tour = await response.json();
        
        const itineraryMessage: Message = {
          id: `itinerary_${Date.now()}`,
          type: 'assistant',
          content: `🗺️ **Itinerario: ${tour.nombre}**\n\n📍 **Ubicación:** ${tour.ubicacion}\n⏰ **Duración:** ${tour.duracion || 'Por definir'}\n👥 **Capacidad:** ${tour.capacidad || 'Flexible'}\n\n📝 **Descripción:**\n${tour.descripcion || 'Información detallada próximamente.'}\n\n💡 El partner se pondrá en contacto contigo para coordinar horarios específicos.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, itineraryMessage]);
      }
      setQuickActions([]);
    } catch (error) {
      console.error('Error obteniendo itinerario:', error);
    }
  };

  const viewFullItinerary = async (params: any) => {
    try {
      if (params.reservation_id) {
        // Simular datos de itinerario completo
        const fullItineraryMessage: Message = {
          id: `full_itinerary_${Date.now()}`,
          type: 'assistant',
          content: `📋 **Itinerario Completo - Reserva #${params.reservation_id}**\n\n🎯 **Tour + Alojamiento Coordinado**\n\n📅 **Cronograma:**\n• ✅ Tour confirmado por nuestro sistema\n• ✅ Alojamiento confirmado por Reservas ULEAM\n• 🕐 Check-in: Por coordinar\n• 🗓️ Fecha del tour: Próxima confirmación\n\n👥 **Contactos:**\n• 🎯 Tours: Nuestro equipo\n• 🏨 Alojamiento: Grupo Reservas ULEAM\n\n💬 Ambos grupos trabajamos juntos para tu mejor experiencia.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fullItineraryMessage]);
      }
      setQuickActions([]);
    } catch (error) {
      console.error('Error obteniendo itinerario completo:', error);
    }
  };

  const contactPartner = async (params: any) => {
    try {
      const contactMessage: Message = {
        id: `contact_${Date.now()}`,
        type: 'assistant',
        content: `📞 **Contactando al Partner: ${params.partner_id === 'reservas_uleam' ? 'Reservas ULEAM' : 'Partner'}**\n\n🤝 Se ha enviado una notificación al grupo partner solicitando que se pongan en contacto contigo.\n\n📧 **Métodos de contacto disponibles:**\n• Email: reservas@uleam.edu.ec\n• WhatsApp: +593-xxx-xxxx\n• Sistema interno: Notificación enviada\n\n⏱️ Tiempo de respuesta estimado: 2-4 horas hábiles`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, contactMessage]);
      setQuickActions([]);
    } catch (error) {
      console.error('Error contactando partner:', error);
    }
  };

  const shareExperience = async (params: any) => {
    try {
      const shareText = `¡Acabo de reservar ${params.tour_name || 'un increíble tour'}! 🎯✨`;
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Mi Experiencia Turística',
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      }
      
      const shareMessage: Message = {
        id: `share_${Date.now()}`,
        type: 'assistant', 
        content: `📱 **¡Experiencia Compartida!**\n\n✅ ${typeof navigator.share !== 'undefined' ? 'Se ha abierto el menú de compartir de tu dispositivo.' : 'El enlace se ha copiado al portapapeles.'}\n\n📲 Puedes compartir tu experiencia en:\n• WhatsApp\n• Facebook\n• Instagram Stories\n• Twitter\n\n¡Que disfrutes tu aventura! 🌟`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, shareMessage]);
      setQuickActions([]);
    } catch (error) {
      console.error('Error compartiendo experiencia:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Validar tipos de archivo permitidos
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'audio/mpeg', 'audio/wav'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB max
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split(/<\/?strong>/).map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
        <br />
      </span>
    ));
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  if (!user) return null;

  return (
    <div className="chatbot-container">
      {/* Botón flotante del chat */}
      <button
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        title={isOpen ? 'Cerrar chat' : 'Abrir asistente virtual'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header del chat */}
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-avatar">🤖</span>
              <div>
                <h4>Asistente Virtual</h4>
                <p className="status">
                  En línea {isConnected && <span className="ws-status">🔗 Partner conectado</span>}
                </p>
              </div>
            </div>
            <div className="chat-controls">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? '⬆️' : '⬇️'}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Área de mensajes */}
              <div className="chat-messages" ref={chatContainerRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.type}`}
                  >
                    <div className="message-content">
                      <div className="message-text">
                        {formatMessage(message.content)}
                      </div>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="attachment">
                              <span className="attachment-icon">
                                {attachment.type === 'image' ? '🖼️' : 
                                 attachment.type === 'pdf' ? '📄' : '🎵'}
                              </span>
                              <span className="attachment-name">{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message assistant loading">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Acciones rápidas - Semana 4 */}
              {quickActions.length > 0 && (
                <div className="quick-actions">
                  <div className="quick-actions-label">
                    💡 Acciones rápidas:
                  </div>
                  <div className="quick-actions-buttons">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="quick-action-btn"
                        onClick={async () => {
                          await executeActions([action]);
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Archivos adjuntos */}
              {attachedFiles.length > 0 && (
                <div className="chat-attachments">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="attached-file">
                      <span className="file-icon">
                        {file.type.startsWith('image/') ? '🖼️' : 
                         file.type === 'application/pdf' ? '📄' : '🎵'}
                      </span>
                      <span className="file-name">{file.name}</span>
                      <button 
                        onClick={() => removeAttachment(index)}
                        className="remove-file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input del chat */}
              <div className="chat-input">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf,audio/*"
                  multiple
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="attachment-btn"
                  title="Adjuntar archivo"
                >
                  📎
                </button>
                
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                  rows={1}
                  disabled={isLoading}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
                  className="send-btn"
                  title="Enviar mensaje"
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Modal de confirmación - Semana 4 */}
      <ConfirmationModal
        confirmation={currentConfirmation}
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
      />
    </div>
  );
};