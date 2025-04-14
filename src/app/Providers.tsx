"use client";

import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import { AppShell } from "./components/AppShell";
import i18n from "@/config/i18n";
import { AOSInit } from "./components/AOSInit";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import { Container } from "react-bootstrap";
import BackButton from "./components/BackButton";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AOSInit />
            <AppShell>
              <Suspense fallback={null}>
                <Container className='pt-3 px-4'>
                  <BackButton/>
                  </Container>
                  </Suspense>
              {children}
              <ToastContainer
                position= "top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
                toastClassName="custom-toast"
              />
            </AppShell>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
