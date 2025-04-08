'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';


interface Option {
  id: number;
  name: string;
  firstName: string;
}

interface ProjectForm {
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  clientId: string;
  ownerId: string;
  active: boolean;
  skillIds: string[];
}

export default function CreateProjectPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    clientId: '',
    ownerId: '',
    active: true,
    skillIds: [],
  });

  const [clients, setClients] = useState<Option[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOptions('/api/clients', setClients);
    fetchOptions('/api/skills', setSkills);
    fetchOptions('/api/profile', setUsers);
  }, []);

  const fetchOptions = async (url: string, setter: (data: Option[]) => void) => {
    try {
      const res = await fetch(`http://localhost:8090${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setter(data);
    } catch (err) {
      setError('Error al cargar opciones');
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'skillIds' && e.target instanceof HTMLSelectElement) {
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, skillIds: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const payload = {
      ...formData,
      startDate: formData.startDate?.toISOString().split('T')[0],
      endDate: formData.endDate?.toISOString().split('T')[0],
    };

    try {
      const res = await fetch('http://localhost:8090/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al crear el proyecto');

      setMessage('¡Proyecto creado exitosamente!');
      setFormData({
        name: '',
        description: '',
        startDate: null,
        endDate: null,
        clientId: '',
        ownerId: '',
        active: true,
        skillIds: [],
      });
    } catch (err) {
      setError('Error al enviar los datos');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-primary mb-4 text-center">{t('Project.title')}</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.name')}</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.client')}</Form.Label>
              <Form.Select name="clientId" value={formData.clientId} onChange={handleChange} required>
                <option value="">{t('Project.clientSelect')}</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t('Project.description')}</Form.Label>
          <Form.Control
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.startDate')}</Form.Label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="Selecciona fecha"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.EndDate')}</Form.Label>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                dateFormat="yyyy-MM-dd"
                className="form-control"
                placeholderText="Selecciona fecha"
                minDate={formData.startDate || undefined}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.owner')}</Form.Label>
              <Form.Select name="ownerId" value={formData.ownerId} onChange={handleChange} required>
                <option value="">{t('Project.ownerSelect')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('Project.skill')}</Form.Label>
              <Form.Select
                name="skillIds"
                multiple
                value={formData.skillIds}
                onChange={handleChange}
              >
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">{t('Project.button')}</Button>
      </Form>
    </Container>
  );
}
