// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { AOSInit } from './components/AOSInit';
import { Header } from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: 'Registro de Perfil',
  description: 'Formulario para registrar perfiles profesionales',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AOSInit />
        <AuthProvider>
        <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}