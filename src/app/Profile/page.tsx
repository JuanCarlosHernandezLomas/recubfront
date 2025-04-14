'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  PersonPlusFill,
  PeopleFill,
} from 'react-bootstrap-icons';
import Link from 'next/link';
import 'animate.css';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  const modules = [
    {
      title: t('dashboard.registerProfile'),
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
        useEffect(() => {
          modules.forEach((mod) => {
            router.prefetch(mod.path);
            console.log(`✅ Precargando ruta: ${mod.path}`);
          });
        }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 text-primary">{t('dashboard.welcome')}</h2>
      <Row className="g-4">
        {modules.map((mod, idx) => (
          <Col key={idx} md={6}>
                          <div
                onClick={() => {
                  setClickedPath(mod.path);
                  router.push(mod.path);
                }}
                style={{ cursor: "pointer" }}
              >
              <Card
                className={`shadow-lg p-4 border-0 h-100 animate__animated ${mod.animation} ${clickedPath === mod.path ? 'clicked-card' : ''}`}
                style={{ transition: 'transform 0.3s' }}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {mod.icon}
                    <Card.Title className="ms-3 text-mtud">{mod.title}</Card.Title>
                  </div>
                  <Card.Text className="text-muted">{mod.description}</Card.Text>
                </Card.Body>
              </Card>
              </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Profile;
