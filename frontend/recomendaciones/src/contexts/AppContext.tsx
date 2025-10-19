import React, { createContext, useContext, useState, useEffect } from 'react';

type AppContextState = {
  user: { id?: string; name?: string } | null;
  setUser: (u: { id?: string; name?: string } | null) => void;
  filters: Record<string, any>;
  setFilters: (f: Record<string, any>) => void;
};

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ id?: string; name?: string } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Restaurar usuario desde localStorage cuando la app se monta
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Error al restaurar usuario:', err);
    }
  }, []);

  // Guardar usuario en localStorage cuando cambia
  const handleSetUser = (u: { id?: string; name?: string } | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('user_data', JSON.stringify(u));
    } else {
      localStorage.removeItem('user_data');
    }
  };

  return (
    <AppContext.Provider
      value={{ user, setUser: handleSetUser, filters, setFilters }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export default AppContext;
