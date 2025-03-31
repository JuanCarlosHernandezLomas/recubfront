'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  PersonPlusFill,
  GearFill,
  PeopleFill,
  ClipboardData,
} from 'react-bootstrap-icons';
import Link from 'next/link';
import 'animate.css';

const Dashboard = () => {
  const modules = [
    {
      title: 'Registrar Perfil',
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: 'Crea un nuevo perfil de recurso y carga CVs.',
      path: '/Register',
      animation: 'animate__fadeInLeft',
    },
    {
      title: 'Administrar Datos',
      icon: <GearFill size={32} className="text-warning" />,
      description: 'Agrega nuevas habilidades, niveles de experiencia o disponibilidad.',
      path: '/manage-data',
      animation: 'animate__fadeInRight',
    },
    {
      title: 'Ver Perfiles',
      icon: <PeopleFill size={32} className="text-success" />,
      description: 'Consulta y gestiona los perfiles existentes.',
      path: '/profiles',
      animation: 'animate__fadeInLeft',
    },
    {
      title: 'Reportes',
      icon: <ClipboardData size={32} className="text-info" />,
      description: 'Genera reportes de asignaciones y disponibilidad.',
      path: '/reports',
      animation: 'animate__fadeInRight',
    },
  ];

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 text-primary">Bienvenido a ResourceHub</h2>
      <Row className="g-4">
        {modules.map((mod, idx) => (
          <Col key={idx} md={6}>
            <Link href={mod.path} className="text-decoration-none">
              <Card
                className={`shadow-lg p-4 border-0 h-100 animate__animated ${mod.animation}`}
                style={{ transition: 'transform 0.3s' }}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {mod.icon}
                    <Card.Title className="ms-3 text-dark">{mod.title}</Card.Title>
                  </div>
                  <Card.Text className="text-muted">{mod.description}</Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
