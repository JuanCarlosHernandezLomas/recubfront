"use client";

import React from "react";
import { Navbar,  Dropdown, Button } from "react-bootstrap";
import { PersonCircle, List } from "react-bootstrap-icons";
import { useAuth } from "../context/useAuth";
import { useSidebarContext } from "../context/SidebarContext";
import Link from "next/link";

export const Header = () => {
  const { token, logout } = useAuth();
  const { toggleSidebar } = useSidebarContext();

  return (
    <Navbar bg="light" className="shadow-sm px-3 justify-content-between"
    >
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

      {token && (
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-user">
            <PersonCircle className="me-2" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={logout} className="text-danger">
              Cerrar Sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </Navbar>
  );
};
