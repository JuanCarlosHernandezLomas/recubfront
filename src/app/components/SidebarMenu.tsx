'use client';


import {
  House, People, Gear, PersonPlusFill,
  GearFill,
  ClipboardData,
  GeoAltFill,
  PersonSquare,
} from "react-bootstrap-icons";
import Link from 'next/link';
import { useSidebarContext } from '../context/SidebarContext';
import { usePathname } from 'next/navigation';
import { useTranslation } from "react-i18next";
import { ClipboardList, FolderClosed, Handshake } from "lucide-react";
import { useAuth } from '../context/useAuth';


export const SidebarMenu = () => {
  const { t } = useTranslation();
  const { collapsed } = useSidebarContext();
  const pathname = usePathname();
  const { roles } = useAuth();

  const hasRole = (allowedRoles: string[]) => {
    return allowedRoles.some(role => roles.includes(role));
  };

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
          className={`nav-link d-flex align-items-center ${isActive('/Profile') ? 'active' : ''}`}
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
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/reports') ? 'active' : ''}`}
            href="/reports"
          >
            <ClipboardData className="me-2" />
            {!collapsed && t('sidebar.report')}
          </Link>
        )}
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/location') ? 'active' : ''}`}
            href="/location"
          >

            <GeoAltFill className="me-2" />
            {!collapsed && t('sidebar.Location')}
          </Link>
        )}
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/cliente') ? 'active' : ''}`}
            href="/cliente"
          >
            <PersonSquare className="me-2" />
            {!collapsed && t('sidebar.client')}
          </Link>
        )}
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/project') ? 'active' : ''}`}
            href="/project"
          >
            <FolderClosed className="me-2" />
            {!collapsed && t('sidebar.Project')}
          </Link>
        )}
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/Assignments') ? 'active' : ''}`}
            href="/Assignments"
          >
            <ClipboardList className="me-2" />
            {!collapsed && t('sidebar.ProjectAssigned')}
          </Link>
        )}
        {hasRole(['ROLE_ADMINS']) && (
          <Link
            className={`nav-link d-flex align-items-center ${isActive('/Team') ? 'active' : ''}`}
            href="/Team"
          >
            <Handshake className="me-2" />
            {!collapsed && t('sidebar.Team')}
          </Link>
        )}
      </nav>
    </aside>
  );
};