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

const Profile = () => {
  const { t } = useTranslation();
  const modules = [
    {
      title:  t('dashboard.registerProfile'),
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: t('dashboard.registerProfileDesc'),
      path: '/Profile/Register',
      animation: 'animate__fadeInLeft',
    },

    {
      title: t('dashboard.viewProfiles'),
      icon: <PeopleFill size={32} className="text-success" />,
      description: t('dashboard.viewProfilesDesc'),
      path: '/Profile/view-profiles',
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

export default Profile;
