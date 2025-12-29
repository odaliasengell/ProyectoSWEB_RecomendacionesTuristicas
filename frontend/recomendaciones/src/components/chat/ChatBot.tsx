import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
                <p className="status">En línea</p>
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
    </div>
  );
};