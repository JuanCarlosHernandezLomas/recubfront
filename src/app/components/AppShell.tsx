// src/app/components/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { SidebarMenu } from "./SidebarMenu";
import { useSidebarContext } from "../context/SidebarContext";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();

  const hideLayout = pathname === "/"; // ocultar en la ruta raíz (login)

  if (hideLayout) return <>{children}</>;

  return (
    <div style={{ display: "flex" }}>
      <SidebarMenu />
      <div className={`flex-grow-1 ${collapsed ? "" : "main-expanded"}`}>
        <Header />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};
