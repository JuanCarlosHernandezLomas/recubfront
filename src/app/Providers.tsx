'use client';

import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { AppShell } from './components/AppShell';
import i18n from '@/config/i18n';
import { AOSInit } from './components/AOSInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <SidebarProvider>
          <AOSInit />
          <AppShell>{children}</AppShell>
        </SidebarProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
