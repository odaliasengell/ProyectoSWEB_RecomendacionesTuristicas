import React from 'react';
import './App.css';

// Importar contexto y router
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AppRouter from './router';
import FloatingChatWidget from './components/FloatingChatWidget';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppRouter />
        <FloatingChatWidget />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
