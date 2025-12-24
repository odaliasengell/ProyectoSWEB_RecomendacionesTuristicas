import React from 'react';
import './App.css';

// Importar contexto y router
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
