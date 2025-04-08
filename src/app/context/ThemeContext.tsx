'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (user) {
      const storedTheme = localStorage.getItem(`theme-${user}`) as Theme;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
      const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      document.body.setAttribute('data-bs-theme', initialTheme);
    } else {
      // Si no hay usuario, usamos el tema por defecto
      setTheme('light');
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      localStorage.setItem(`theme-${user}`, newTheme); 
    }
    document.body.setAttribute('data-bs-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};
