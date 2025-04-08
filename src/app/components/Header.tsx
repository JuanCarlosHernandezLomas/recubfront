"use client";

import React from "react";
import { Navbar, Dropdown, Button, ButtonGroup } from "react-bootstrap";
import { PersonCircle, List } from "react-bootstrap-icons";
import { useAuth } from "../context/useAuth";
import { useSidebarContext } from "../context/SidebarContext";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ThemeToggleButton from "./ThemeToggleButton";
import { useHasMounted } from "../hooks/useHasMounted";

export const Header = () => {
  const { user } = useAuth();
  const { token, logout } = useAuth();
  const { toggleSidebar } = useSidebarContext();
  const { i18n } = useTranslation();
  const mounted = useHasMounted();
  

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng); // Guardar preferencia
  };

  return (
    <Navbar bg="light" className="shadow-sm px-3 justify-content-between">
      <div className="d-flex align-items-center">
        <Button
          variant="outline-primary"
          className="me-3"
          onClick={toggleSidebar}
          style={{ zIndex: 1102, position: "relative" }}
        >
          <List size={22} />
        </Button>
        <Navbar.Brand as={Link} href="/" className="fw-bold text-primary">
          ResourceHub
        </Navbar.Brand>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* 🌓 Tema oscuro/claro */}
        <ThemeToggleButton />
        {/* Selector de idioma */}
        <Dropdown as={ButtonGroup}>
          <Button variant="outline-dark">
            🌐  {mounted ? i18n.language.toUpperCase() : ""}
          </Button>
          <Dropdown.Toggle split variant="outline-dark" id="dropdown-split" />
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => changeLanguage("es")}>
              🇪🇸 Español
            </Dropdown.Item>
            <Dropdown.Item onClick={() => changeLanguage("en")}>
              🇺🇸 English
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {/* Menú de usuario */}
        {token && (
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-user">
              <PersonCircle className="me-2" />
              {user ? user.split("@")[0].charAt(0).toUpperCase() + user.split("@")[0].slice(1) : "Usuario"}

            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={logout} className="text-danger">
                Cerrar Sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </Navbar>
  );
};
