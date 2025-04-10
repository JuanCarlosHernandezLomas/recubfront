'use client';

import { CalendarDays, FolderUp, GraduationCap, Pencil, User } from 'lucide-react';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
} from 'react-bootstrap';
import { PersonSquare } from 'react-bootstrap-icons';
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
  const [validated, setValidated] = useState(false);

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
    setValidated(true);

    const isInvalid =
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.clientId ||
      !formData.ownerId ||
      !formData.startDate ||
      !formData.endDate ||
      formData.skillIds.length === 0;

    if (isInvalid) return;

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
      setValidated(false);
    } catch (err) {
      setError('Error al enviar los datos');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-primary mb-4 text-center">  <FolderUp size={43} />{t('Project.title')}</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>  <Pencil />{t('Project.name')}</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange}
                required
                isInvalid={validated && !formData.name.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {t("Project.requiredName")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <PersonSquare size={22} className="text-info" /> {t('Project.client')}
              </Form.Label>
              <Form.Select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.clientId}
              >
                <option value="">{t('Project.clientSelect')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t('Project.requiredClient')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>  <Pencil />{t('Project.description')}</Form.Label>
          <Form.Control
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleChange}
            required
            isInvalid={validated && !formData.description.trim()}
          />
          <Form.Control.Feedback type="invalid">
            {t("Project.requireddescription")}
          </Form.Control.Feedback>
        </Form.Group>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><CalendarDays /> {t('Project.startDate')}</Form.Label>
              <div>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                  dateFormat="yyyy-MM-dd"
                  className={`form-control ${validated && !formData.startDate ? 'is-invalid' : ''}`}
                  placeholderText={t("Project.startDatePlaceholder")}
                />
                {validated && !formData.startDate && (
                  <div className="invalid-feedback">
                    {t("Project.requiredStartDate")}
                  </div>
                )}
              </div>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label><CalendarDays /> {t('Project.EndDate')}</Form.Label>
              <div>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                  dateFormat="yyyy-MM-dd"
                  className={`form-control ${validated && !formData.endDate ? 'is-invalid' : ''}`}
                  placeholderText={t("Project.endDatePlaceholder")}
                  minDate={formData.startDate || undefined}
                />
                {validated && !formData.endDate && (
                  <div className="invalid-feedback">
                    {t("Project.requiredEndDate")}
                  </div>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><User size={33} /> {t('Project.owner')}</Form.Label>
              <Form.Select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.ownerId}
              >
                <option value="">{t('Project.ownerSelect')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("Project.requiredOwner")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <GraduationCap size={30} strokeWidth={2} color="#ff8800" /> {t('Project.skill')}
              </Form.Label>
              <Form.Select
                name="skillIds"
                multiple
                value={formData.skillIds}
                onChange={handleChange}
                isInvalid={validated && formData.skillIds.length === 0}
              >
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("Project.requiredSkill")}
              </Form.Control.Feedback>
            </Form.Group>

          </Col>
        </Row>
        <Button variant="primary" type="submit">{t('Project.button')}</Button>
      </Form>
    </Container>
  );
}
