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
import { useAuth } from '../context/useAuth';

const Dashboard = () => {
  const { t } = useTranslation();
  const { roles } = useAuth();

  const hasRole = (allowedRoles: string[], userRoles: string[]) => {
    return allowedRoles.some(role => userRoles.includes(role));
  };
  const modules = [
    {
      title:  t('dashboard.registerProfile'),
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: t('dashboard.registerProfileDesc'),
      allowedRoles: ['ROLE_ADMINS', "ROLE_USERS"],
      path: '/Profile',
      animation: 'animate__fadeInLeft',
    },
    {
      title: t('dashboard.manageData'),
      icon: <GearFill size={32} className="text-warning" />,
      description: t('dashboard.manageDataDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/manage-data',
      animation: 'animate__fadeInRight',
    },

    {
      title: t('dashboard.reports'),
      icon: <ClipboardData size={32} className="text-info" />,
      description: t('dashboard.reportsDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/reports',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.locations'),
      icon: <GeoAltFill size={32} className="text-info" />,
      description: t('dashboard.locationsDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/location',
      animation: 'animate__fadeInLeft',
    },
    {
      title: t('dashboard.clients'),
      icon: <PersonSquare size={32} className="text-info" />,
      description: t('dashboard.clientsDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/cliente',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.Project'),
      icon: <PersonSquare size={32} className="text-info" />,
      description: t('dashboard.ProjectDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/project',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.ProjectAssigned'),
      icon: <PersonSquare size={32} className="text-info" />,
      description: t('dashboard.ProjectAssignedDesc'),
      allowedRoles: ['ROLE_ADMINS','ROLE_USERS'],
      path: '/Assignments',
      animation: 'animate__fadeInRight',
    },
    {
      title: t('dashboard.Team'),
      icon: <PersonSquare size={32} className="text-info" />,
      description: t('dashboard.TeamDesc'),
      allowedRoles: ['ROLE_ADMINS'],
      path: '/Team',
      animation: 'animate__fadeInRight',
    },
  ];

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 text-primary">{t('dashboard.welcome')}</h2>
      <Row className="g-4">
      {modules
          .filter((mod) => hasRole(mod.allowedRoles, roles))
          .map((mod, idx) => (
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
