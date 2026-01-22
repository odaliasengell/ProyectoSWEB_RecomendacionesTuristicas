import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, MinusIcon, Image, FileText } from 'lucide-react';

const AI_ORCHESTRATOR_URL = 'http://localhost:8004';

// Estilos para el placeholder del input
const chatInputStyles = `
  .chat-input-placeholder::placeholder {
    color: #374151 !important;
    opacity: 1 !important;
  }
`;

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hola! ¿En qué puedo ayudarte hoy? Puedes enviarme texto, imágenes 📷 o PDFs 📄', 
      timestamp: new Date() 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [conversationId, setConversationId] = useState(null);
  
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const endRef = useRef(null);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Obtener usuario_id del localStorage
  const getUserId = () => {
    try {
      const userDataStr = localStorage.getItem('userData') || localStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return userData.id || userData.usuario_id || null;
      }
    } catch (e) {
      console.error('Error obteniendo usuario:', e);
    }
    return null;
  };

  const handleSend = async () => {
    const content = inputMessage.trim();
    if (!content || isLoading) return;

    const userMsg = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userId = getUserId();
      const res = await fetch(`${AI_ORCHESTRATOR_URL}/chat/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          provider, 
          conversation_id: conversationId, 
          use_tools: true,
          usuario_id: userId
        })
      });
      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);
      const botMsg = { 
        role: 'assistant', 
        content: data.response || 'Entendido ✓', 
        timestamp: new Date(),
        tools: data.tools_used 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error. Intenta nuevamente.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Manejar subida de imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const userMsg = { 
      role: 'user', 
      content: `📷 Imagen: ${file.name}`, 
      timestamp: new Date(),
      isFile: true 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('message', inputMessage || 'Analiza esta imagen');
      formData.append('provider', provider);
      if (conversationId) formData.append('conversation_id', conversationId);

      const res = await fetch(`${AI_ORCHESTRATOR_URL}/chat/image`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.analysis || 'Imagen procesada ✓', 
        timestamp: new Date() 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al procesar la imagen. Intenta nuevamente.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
      e.target.value = '';
    }
  };

  // Manejar subida de PDF
  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const userMsg = { 
      role: 'user', 
      content: `📄 PDF: ${file.name}`, 
      timestamp: new Date(),
      isFile: true 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('message', inputMessage || 'Extrae la información de este PDF');
      formData.append('provider', provider);
      if (conversationId) formData.append('conversation_id', conversationId);

      const res = await fetch(`${AI_ORCHESTRATOR_URL}/chat/pdf`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.extracted_text || 'PDF procesado ✓', 
        timestamp: new Date() 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al procesar el PDF. Intenta nuevamente.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
      e.target.value = '';
    }
  };

  const clearConversation = async () => {
    if (conversationId) {
      try {
        await fetch(`${AI_ORCHESTRATOR_URL}/conversation/${conversationId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error al limpiar conversación:', err);
      }
    }
    setConversationId(null);
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hola! ¿En qué puedo ayudarte hoy?', 
        timestamp: new Date() 
      }
    ]);
  };

  const chatWidget = (
    <>
      <style>{chatInputStyles}</style>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 9999,
            width: '70px',
            height: '70px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            transition: 'all 0.3s ease',
            outline: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
          }}
          aria-label="Abrir chat"
        >
          🤖
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            backgroundColor: '#10b981',
            border: '3px solid white',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
        </button>
      ) : (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 9999, 
      width: '400px',
      height: isMinimized ? 'auto' : '580px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      borderRadius: '8px 8px 0 0',
      overflow: 'hidden',
      backgroundColor: '#fff',
      border: '1px solid #d1d5db'
    }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>Asistente TurismoBot</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={clearConversation}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s',
              fontSize: '18px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Nueva conversación"
          >
            🔄
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Minimizar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mensajes */}
          <div style={{
            flex: 1,
            backgroundColor: '#f9fafb',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    fontSize: '20px'
                  }}>
                    👤
                  </div>
                )}
                <div style={{ 
                  flex: 1, 
                  marginLeft: msg.role === 'user' ? '48px' : '0' 
                }}>
                  <div style={{
                    borderRadius: '8px',
                    padding: '12px 16px',
                    backgroundColor: msg.role === 'user' ? '#2563eb' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                    border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                    maxWidth: msg.role === 'user' ? '85%' : '100%',
                    marginLeft: msg.role === 'user' ? 'auto' : '0',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </div>
                  {msg.tools && msg.tools.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔧</span>
                      <span>{msg.tools.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  fontSize: '20px'
                }}>
                  👤
                </div>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0ms' }}></div>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '150ms' }}></div>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            {/* Botones de archivos */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf"
                onChange={handlePDFUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#4b5563',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
                title="Subir imagen para análisis"
              >
                <Image size={14} /> Imagen
              </button>
              <button
                onClick={() => pdfInputRef.current?.click()}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#4b5563',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
                title="Subir PDF para extracción"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '10px 12px',
              transition: 'border-color 0.2s'
            }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta"
                maxLength={100}
                className="chat-input-placeholder"
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#000000'
                }}
                disabled={isLoading}
              />
              <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {inputMessage.length}/100
              </span>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  color: '#2563eb',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: inputMessage.trim() && !isLoading ? 1 : 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                aria-label="Enviar"
              >
                <Send size={20} />
              </button>
            </div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <button
                onClick={() => setProvider(provider === 'gemini' ? 'groq' : 'gemini')}
                style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Powered by {provider === 'gemini' ? 'Gemini AI' : 'Groq (Llama 3.3)'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
      )}
    </>
  );

  return createPortal(chatWidget, document.body);
};

export default FloatingChatWidget;
