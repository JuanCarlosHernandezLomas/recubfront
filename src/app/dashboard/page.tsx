'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  PersonPlusFill,
  GearFill,
  PeopleFill,
  ClipboardData,
  GeoAltFill,
  PersonSquare,
} from 'react-bootstrap-icons';
import Link from 'next/link';
import 'animate.css';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const modules = [
    {
      title:  t('dashboard.registerProfile'),
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: t('dashboard.registerProfileDesc'),
      path: '/Register',
      animation: 'animate__fadeInLeft',
    },
    {
      title: t('dashboard.manageData'),
      icon: <GearFill size={32} className="text-warning" />,
      description: t('dashboard.manageDataDesc'),
      path: '/manage-data',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.viewProfiles'),
      icon: <PeopleFill size={32} className="text-success" />,
      description: t('dashboard.viewProfilesDesc'),
      path: '/view-profiles',
      animation: 'animate__fadeInLeft',
    },
    {
      title: t('dashboard.reports'),
      icon: <ClipboardData size={32} className="text-info" />,
      description: t('dashboard.reportsDesc'),
      path: '/reports',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.locations'),
      icon: <GeoAltFill size={32} className="text-info" />,
      description: t('dashboard.locationsDesc'),
      path: '/location',
      animation: 'animate__fadeInLeft',
    },
    {
      title: t('dashboard.clients'),
      icon: <PersonSquare size={32} className="text-info" />,
      description: t('dashboard.clientsDesc'),
      path: '/cliente',
      animation: 'animate__fadeInRight',
    },
    {
      title: "proyect",
      icon: <PersonSquare size={32} className="text-info" />,
      description: "creacion de projecto",
      path: '/project',
      animation: 'animate__fadeInRight',
    },
  ];

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 text-primary">{t('dashboard.welcome')}</h2>
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
