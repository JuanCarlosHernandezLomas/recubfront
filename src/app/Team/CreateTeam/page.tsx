'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Form, Button, Row, Col, Alert, Card,
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/context/useAuth';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface TeamForm {
  name: string;
  description: string;
  projectId: string;
  active: boolean;
}

interface ProjectOption {
  id: number;
  name: string;
}

export default function CreateTeamPage() {
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
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...data, projectId: parseInt(data.projectId) }),
      });

      if (!response.ok) throw new Error('Error al crear el equipo.');

      setSuccessMessage('¡Equipo creado exitosamente!');
      setErrorMessage('');
      reset();
    } catch (err) {
      setSuccessMessage('');
      setErrorMessage('No se pudo crear el equipo.');
    }
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-primary mb-4">🚀 Crear Nuevo Equipo</h2>

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
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>📛 Nombre del Equipo</Form.Label>
                    <Form.Control
                      placeholder="Ej. Backend Squad"
                      {...register('name', { required: true })}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>📝 Descripción</Form.Label>
                    <Form.Control
                      placeholder="Breve descripción"
                      {...register('description', { required: true })}
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>📁 Proyecto</Form.Label>
                    <Form.Select
                      {...register('projectId', { required: true })}
                      isInvalid={!!errors.projectId}
                    >
                      <option value="">Seleccione un proyecto</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Campo requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="d-flex align-items-end">
                  <Form.Check
                    type="switch"
                    label="✅ Activo"
                    {...register('active')}
                    defaultChecked
                  />
                </Col>
              </Row>

              <div className="text-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" variant="primary" size="lg">
                    Crear Equipo
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
