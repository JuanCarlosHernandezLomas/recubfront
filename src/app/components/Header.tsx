// src/app/components/Header.tsx
"use client";

import React, { useState } from "react";
import { Navbar,  Container, Dropdown, Button } from "react-bootstrap";
import { PersonCircle, List } from "react-bootstrap-icons";
import { useAuth } from "../context/useAuth";
import Link from "next/link";

export const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { token, logout } = useAuth();


  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-4">
      <Container fluid>
        <Button
          variant="outline-primary"
          className="me-3 d-lg-none"
          onClick={() => setShowMenu(!showMenu)}
        >
          <List />
        </Button>

        <Navbar.Brand href="/">ResourceHub</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {token && (
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-user">
                <PersonCircle className="me-2" />
               
              </Dropdown.Toggle>

              <Dropdown.Menu>
              <Dropdown.Item as={Link} href="/Register">Registrar Perfil</Dropdown.Item>
              <Dropdown.Item as={Link} href="/manage-data">Administrar Datos</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout} className="text-danger">
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
