'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Form, Button, Row, Col, Alert, Card,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/context/useAuth';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface TeamForm {
  name: string;
  description: string;
  projectId: string;
}

interface ProjectOption {
  id: number;
  name: string;
}

export default function CreateTeamPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamForm>();

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onSubmit = async (data: TeamForm) => {
    try {
      const response = await fetch('http://localhost:8090/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          projectId: parseInt(data.projectId),
          active: true
        }),
      });

      if (!response.ok) throw new Error('Error al crear el equipo.');

      setSuccessMessage(t('Team.success'));
      setErrorMessage('');
      reset();
    } catch (err) {
      setSuccessMessage('');
      setErrorMessage(t('Team.error'));
    }
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-primary mb-4">{t('Team.Teamtitle')}</h2>

        {successMessage && (
          <Alert variant="success" className="d-flex align-items-center gap-2">
            <FaCheckCircle /> {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="danger" className="d-flex align-items-center gap-2">
            <FaTimesCircle /> {errorMessage}
          </Alert>
        )}

        <Card className="shadow-sm border-0">
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('Team.name')}</Form.Label>
                    <Form.Control
                      placeholder="Ej. Backend Squad"
                      {...register('name', {
                        required: t('Team.requiredName'),
                        minLength: { value: 3, message: t('Team.minName') }
                      })}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('Team.description')}</Form.Label>
                    <Form.Control
                      placeholder="Breve descripción"
                      {...register('description', {
                        required: t('Team.requiredDescription'),
                        minLength: { value: 10, message: t('Team.minDescription') }
                      })}
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>{t('Team.proyect')}</Form.Label>
                    <Form.Select
                      {...register('projectId', { required: t('Team.requiredProject') })}
                      isInvalid={!!errors.projectId}
                    >
                      <option value="">{t('Team.select')}</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.projectId?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="primary" size="lg">
                    {t('Team.button')}
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
