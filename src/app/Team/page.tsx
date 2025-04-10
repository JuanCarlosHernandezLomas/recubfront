'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  PersonPlusFill,
  PeopleFill,
} from 'react-bootstrap-icons';
import Link from 'next/link';
import 'animate.css';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const modules = [
    {
      title: t('TeamCard.Teamtitle'),
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: t('TeamCard.TeamDesc'),
      path: '/Team/CreateTeam',
      animation: 'animate__fadeInLeft',
    },

    {
      title: t('TeamCard.Teamlist'),
      icon: <PeopleFill size={32} className="text-success" />,
      description: t('TeamCard.TeamlistDesc'),
      path: '/Team/ListTeam',
      animation: 'animate__fadeInRight',
    },

    {
      title: t('TeamCard.AssignTeamDesc'),
      icon: <PersonPlusFill size={32} className="text-primary" />,
      description: t('TeamCard.AssignTeamDesc'),
      path: '/Team/AssignMember',
      animation: 'animate__fadeInLeft',
    },

    {
      title: t('TeamCard.AssignTeamList'),
      icon: <PeopleFill size={32} className="text-success" />,
      description: t('TeamCard.AssignTeamListDesc'),
      path: '/Team/ListTeamMembers',
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
                    <Card.Title className="ms-3 text-mted">{mod.title}</Card.Title>
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
