'use client';


import { House, People, Gear } from "react-bootstrap-icons";
import Link from 'next/link';
import { useSidebarContext } from '../context/SidebarContext';
import { usePathname } from 'next/navigation';

export const SidebarMenu = () => {
  const { collapsed } = useSidebarContext();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  

  return (
    <aside
    className={`sidebar bg-white shadow-sm p-3 ${collapsed ? "collapsed" : "expanded"}`}
  >
    <nav className="nav flex-column">
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/dashboard') ? 'active' : ''}`}
        href="/dashboard"
      >
        <House className="me-2" />
        {!collapsed && "Inicio"}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/Register') ? 'active' : ''}`}
        href="/Register"
      >
        <People className="me-2" />
        {!collapsed && "Registro"}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/manage-data') ? 'active' : ''}`}
        href="/manage-data"
      >
        <Gear className="me-2" />
        {!collapsed && "Administrar"}
      </Link>
    </nav>
  </aside>
);
};