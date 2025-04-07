'use client';

import {
  Container, Form, Button, Row, Col, Alert, Card
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Option {
  id: number;
  firstName?: string;
  name: string;
}

interface AssignmentForm {
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  profileId: string;
  projectId: string;
  active: boolean;
}

export default function AssignProjectPage() {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [profiles, setProfiles] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm<AssignmentForm>();

  const startDate = watch("startDate");

  useEffect(() => {
    const fetchOptions = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const get = (url: string) => fetch(url, { headers }).then(res => res.json());

      const [profilesRes, projectsRes] = await Promise.all([
        get('http://localhost:8090/api/profile'),
        get('http://localhost:8090/api/projects')
      ]);

      setProfiles(profilesRes);
      setProjects(projectsRes);
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: AssignmentForm) => {
    const payload = {
      ...data,
      profileId: parseInt(data.profileId),
      projectId: parseInt(data.projectId),
      startDate: data.startDate?.toISOString().split('T')[0],
      endDate: data.endDate?.toISOString().split('T')[0]
    };

    const response = await fetch('http://localhost:8090/api/resource-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Error al asignar proyecto');
    }
  };

  return (
    <Container className="py-5">
      <motion.h2
        className="text-center text-primary mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
       {t('AssignProfiletoProject.title')}
      </motion.h2>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.4 }}
          >
            <Alert variant="success" className="text-center fw-bold">
              ✅ Asignación guardada exitosamente
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('AssignProfiletoProject.profile')}</Form.Label>
                  <Form.Select {...register('profileId', { required: true })} isInvalid={!!errors.profileId}>
                    <option value="">{t('AssignProfiletoProject.selectProfile')}</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.firstName}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Campo requerido</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('AssignProfiletoProject.project')}</Form.Label>
                  <Form.Select {...register('projectId', { required: true })} isInvalid={!!errors.projectId}>
                    <option value="">{t('AssignProfiletoProject.selectProject')}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Campo requerido</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('AssignProfiletoProject.starDate')}</Form.Label>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePicker className="form-control" selected={field.value} onChange={field.onChange} placeholderText={t('AssignProfiletoProject.selecDate')} />
                    )}
                  />
                  {errors.startDate && <div className="text-danger">Campo requerido</div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('AssignProfiletoProject.EndDate')}</Form.Label>
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{
                      required: true,
                      validate: (value) => {
                        if (!value || !startDate) return true;
                        return value >= startDate || 'La fecha de fin no puede ser anterior a la fecha de inicio';
                      }
                    }}
                    render={({ field }) => (
                      <DatePicker
                        className="form-control"
                        selected={field.value}
                        onChange={field.onChange}
                        placeholderText={t('AssignProfiletoProject.selecDateEnd')}
                        minDate={startDate || undefined}
                      />
                    )}
                  />
                  {errors.endDate && (
                    <div className="text-danger">{errors.endDate.message || 'Campo requerido'}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('AssignProfiletoProject.status')}</Form.Label>
                  <Form.Select {...register('status', { required: true })} isInvalid={!!errors.status}>
                    <option value="">{t('AssignProfiletoProject.selecStatus')}</option>
                    <option value="APPROVED">Aprobado</option>
                    <option value="FINISHED">Finalizado</option>
                    <option value="PENDING">En espera</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Campo requerido</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check type="checkbox" label="Activo" {...register('active')} />
              </Col>
            </Row>

            <div className="text-end">
              <Button type="submit" variant="primary" className="px-4">
              {t('AssignProfiletoProject.button')}
              </Button>
            </div>
          </Form>
        </Card>
      </motion.div>
    </Container>
  );
}
