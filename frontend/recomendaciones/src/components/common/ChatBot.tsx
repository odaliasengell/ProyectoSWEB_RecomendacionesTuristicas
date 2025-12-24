/**
 * Componente base para el Chat Interactivo
 * Preparado para MCP (Model Context Protocol) - Pilar 3
 */

import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'pdf' | 'audio';
    name: string;
    url: string;
  };
}

interface ChatBotProps {
  isActive?: boolean;
  onToggle?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isActive = false, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '🤖 ¡Hola! Soy tu asistente de turismo inteligente. Puedo ayudarte con recomendaciones, reservas y pagos. ¿En qué puedo asistirte?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      attachment: selectedFile ? {
        type: selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type === 'application/pdf' ? 'pdf' : 'audio',
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile)
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsLoading(true);

    // TODO Semana 3: Integrar con AI Orchestrator
    // Simular respuesta del bot por ahora
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `He recibido tu mensaje: "${inputValue.trim()}". En las próximas semanas implementaré mi conexión con IA para darte respuestas más inteligentes! 🚀`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const quickActions = [
    { label: 'Ver tours disponibles', action: () => setInputValue('Muéstrame tours disponibles') },
    { label: 'Hacer una reserva', action: () => setInputValue('Quiero hacer una reserva') },
    { label: 'Estado de mi pago', action: () => setInputValue('¿Cuál es el estado de mi pago?') },
    { label: 'Recomendaciones', action: () => setInputValue('Dame recomendaciones de destinos') }
  ];

  if (!isActive) {
    return (
      <div className="chatbot-minimized" onClick={onToggle}>
        <div className="chat-icon">
          <span>💬</span>
          <div className="notification-dot"></div>
        </div>
        <span className="chat-label">Chat IA</span>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="bot-avatar">🤖</span>
          <div className="title-info">
            <h3>Asistente Turístico</h3>
            <p className="status">Conectado - MCP Ready</p>
          </div>
        </div>
        <button className="minimize-btn" onClick={onToggle}>
          <span>−</span>
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === 'bot' && (
              <div className="message-avatar">🤖</div>
            )}
            <div className="message-content">
              <p className="message-text">{message.content}</p>
              {message.attachment && (
                <div className="message-attachment">
                  <div className="attachment-info">
                    <span className="attachment-icon">
                      {message.attachment.type === 'image' ? '🖼️' : 
                       message.attachment.type === 'pdf' ? '📄' : '🎵'}
                    </span>
                    <span className="attachment-name">{message.attachment.name}</span>
                  </div>
                </div>
              )}
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {message.type === 'user' && (
              <div className="message-avatar user-avatar">👤</div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button 
            key={index} 
            className="quick-action-btn"
            onClick={action.action}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="chatbot-input">
        {selectedFile && (
          <div className="selected-file">
            <span className="file-info">
              📎 {selectedFile.name}
            </span>
            <button className="remove-file" onClick={removeFile}>×</button>
          </div>
        )}
        
        <div className="input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,audio/*"
            className="file-input"
            style={{ display: 'none' }}
          />
          
          <button 
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje... (Soporta imágenes, PDFs y audio)"
            className="message-input"
            rows={1}
          />
          
          <button 
            className="send-btn"
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedFile) || isLoading}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;