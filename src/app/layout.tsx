import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './Providers';


export const metadata: Metadata = {
  title: 'Registro de Perfil',
  description: 'Formulario para registrar perfiles profesionales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
