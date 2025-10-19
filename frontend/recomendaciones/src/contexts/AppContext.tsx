import React, { createContext, useContext, useState } from 'react';

type AppContextState = {
  user: { id?: string; name?: string } | null;
  setUser: (u: { id?: string; name?: string } | null) => void;
  filters: Record<string, any>;
  setFilters: (f: Record<string, any>) => void;
};

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id?: string; name?: string } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  return (
    <AppContext.Provider value={{ user, setUser, filters, setFilters }}>
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
