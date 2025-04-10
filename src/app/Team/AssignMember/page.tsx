'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Form, Button, Alert, Card
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '@/app/context/useAuth';
import { useTranslation } from 'react-i18next';


interface TeamMemberForm {
  rolEnEquipo: string;
  perfilId: string;
  teamId: string;
  active: number;
}

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
}

interface Team {
  id: number;
  name: string;
}

export default function AssignMemberPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamMemberForm>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesRes, teamsRes] = await Promise.all([
          fetch('http://localhost:8090/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8090/api/teams', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProfiles(await profilesRes.json());
        setTeams(await teamsRes.json());
      } catch {
        setError('Error al cargar perfiles o equipos.');
      }
    };
    fetchData();
  }, [token]);

  const onSubmit = async (data: TeamMemberForm) => {
    setSuccess('');
    setError('');
    try {
      const res = await fetch('http://localhost:8090/api/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          perfilId: parseInt(data.perfilId),
          teamId: parseInt(data.teamId),
          active: true
        }),
      });

      if (!res.ok) throw new Error();
      setSuccess(t('AssigmenTeam.Succes'));
      reset();
    } catch {
      setError(t('AssigmenTeam.error'));
    }
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-success mb-4">{t('AssigmenTeam.title')}</h2>

        {success && (
          <Alert variant="success" className="d-flex align-items-center gap-2">
            <FaCheckCircle /> {success}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <FaTimesCircle /> {error}
          </Alert>
        )}

        <Card className="shadow-sm border-0">
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('AssigmenTeam.profile')}</Form.Label>
                    <Form.Select
                      {...register('perfilId', { required: true })}
                      isInvalid={!!errors.perfilId}
                    >
                      <option value="">{t('AssigmenTeam.selectProfile')}</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('AssigmenTeam.Team')}</Form.Label>
                    <Form.Select
                      {...register('teamId', { required: true })}
                      isInvalid={!!errors.teamId}
                    >
                      <option value="">{t('AssigmenTeam.selectTeam')}</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>{t('AssigmenTeam.rol')}</Form.Label>
                    <Form.Control
                      placeholder="Ej. Desarrollador Frontend"
                      {...register('rolEnEquipo', { required: true })}
                      isInvalid={!!errors.rolEnEquipo}
                    />
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="success" size="lg">
                    {t('AssigmenTeam.button')}
                  </Button>
                </motion.div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
}
