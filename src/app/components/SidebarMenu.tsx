'use client';


import { House, People, Gear,   PersonPlusFill,
  GearFill,
  ClipboardData,
  GeoAltFill,
  PersonSquare, } from "react-bootstrap-icons";
import Link from 'next/link';
import { useSidebarContext } from '../context/SidebarContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from "react-i18next";
import { ClipboardList, FolderClosed } from "lucide-react";


export const SidebarMenu = () => {
  const { t } = useTranslation();
  const { collapsed } = useSidebarContext();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  

  return (
    <aside
    className={`sidebar bg-body text-body shadow-sm p-3 ${collapsed ? "collapsed" : "expanded"}`}
  >
    <nav className="nav flex-column">
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/dashboard') ? 'active' : ''}`}
        href="/dashboard"
      >
        <House className="me-2" />
        {!collapsed && t('sidebar.Home')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/Register') ? 'active' : ''}`}
        href="/Profile"
      >
        <People className="me-2" />
        {!collapsed && t('sidebar.Profile')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/manage-data') ? 'active' : ''}`}
        href="/manage-data"
      >
        <Gear className="me-2" />
        {!collapsed && t('sidebar.Skill')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/reports') ? 'active' : ''}`}
        href="/reports"
      >
        <ClipboardData  className="me-2" />
        {!collapsed && t('sidebar.report')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/location') ? 'active' : ''}`}
        href="/location"
      >
        <GeoAltFill  className="me-2" />
        {!collapsed && t('sidebar.Location')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/cliente') ? 'active' : ''}`}
        href="/cliente"
      >
        <PersonSquare  className="me-2" />
        {!collapsed && t('sidebar.client')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/project') ? 'active' : ''}`}
        href="/project"
      >
         <FolderClosed className="me-2"/>
        {!collapsed && t('sidebar.Project')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/Assignments') ? 'active' : ''}`}
        href="/Assignments"
      >
        <ClipboardList className="me-2"/>
        {!collapsed && t('sidebar.ProjectAssigned')}
      </Link>
      <Link
        className={`nav-link d-flex align-items-center ${isActive('/Team') ? 'active' : ''}`}
        href="/Team"
      >
        <PersonSquare className="me-2" />
        {!collapsed && t('sidebar.Team')}
      </Link>
    </nav>
  </aside>
);
};