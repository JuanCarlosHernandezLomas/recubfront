'use client';

import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Form, Button, Table, Badge, Modal, Alert,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/useAuth';

interface ProjectForm {
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  name: string;
  clientId: string;
  ownerId: string;
  active: boolean;
  skillIds: string[];
}

interface Option {
  id: number;
  name: string;
}

interface ProjectView {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  name: string;
  clienteName: string;
  wonerName: string;
  active: boolean;
  skillName: string[];
}

export default function ProjectsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState<ProjectForm>({
    description: '',
    startDate: null,
    endDate: null,
    name: '',
    clientId: '',
    ownerId: '',
    active: true,
    skillIds: [],
  });
  const [filters, setFilters] = useState({
    name: '',
    client: '',
    owner: '',
    active: '',
    skill: '',
    startDate: '',
    endDate: '',
  });

  const [skills, setSkills] = useState<Option[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [owners, setOwners] = useState<Option[]>([]);
  const [projects, setProjects] = useState<ProjectView[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<ProjectView[]>([]);

 ;

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const get = async (url: string) => fetch(url, { headers }).then(res => res.json());

    const [skillsData, clientsData, ownersData, projectsData] = await Promise.all([
      get('http://localhost:8090/api/skills'),
      get('http://localhost:8090/api/clients'),
      get('http://localhost:8090/api/users'),
      get('http://localhost:8090/api/projects'),
    ]);

    setSkills(skillsData);
    setClients(clientsData);
    setOwners(ownersData);
    setProjects(projectsData);
    setFilteredProjects(projectsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (filters.name) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.client) {
      filtered = filtered.filter(p => p.clienteName === filters.client);
    }

    if (filters.owner) {
      filtered = filtered.filter(p => p.wonerName === filters.owner);
    }

    if (filters.skill) {
      filtered = filtered.filter(p => p.skillName.includes(filters.skill));
    }

    if (filters.startDate) {
      filtered = filtered.filter(p => p.startDate >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(p => p.endDate <= filters.endDate);
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(prev => ({ ...prev, skillIds: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      startDate: form.startDate?.toISOString().split('T')[0],
      endDate: form.endDate?.toISOString().split('T')[0],
    };

    const url = editId
      ? `http://localhost:8090/api/projects/${editId}`
      : 'http://localhost:8090/api/projects';

    const method = editId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setAlertMsg(editId ? 'Proyecto actualizado' : 'Proyecto creado');
      fetchData();
      resetForm();
    } else {
      alert('Error al guardar el proyecto');
    }
  };

  const resetForm = () => {
    setForm({
      description: '',
      startDate: null,
      endDate: null,
      name: '',
      clientId: '',
      ownerId: '',
      active: true,
      skillIds: [],
    });
    setEditId(null);
  };

  const handleEdit = (project: ProjectView) => {
    setForm({
      description: project.description,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      name: project.name,
      clientId: clients.find(c => c.name === project.clienteName)?.id.toString() || '',
      ownerId: owners.find(o => o.name === project.wonerName)?.id.toString() || '',
      active: project.active,
      skillIds: skills.filter(s => project.skillName.includes(s.name)).map(s => s.id.toString()),
    });
    setEditId(project.id);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('¿Eliminar este proyecto?');
    if (!confirm) return;

    const response = await fetch(`http://localhost:8090/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      fetchData();
    } else {
      alert('Error al eliminar');
    }
  };


  return (
    <Container className="py-5">
      <h2 className="text-primary mb-4">Gestión de Proyectos</h2>

      {alertMsg && <Alert variant="success">{alertMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control name="description" value={form.description} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha Inicio</Form.Label>
              <DatePicker
                selected={form.startDate}
                onChange={date => setForm(prev => ({ ...prev, startDate: date }))}
                className="form-control"
                dateFormat="yyyy-MM-dd"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha Fin</Form.Label>
              <DatePicker
                selected={form.endDate}
                onChange={date => setForm(prev => ({ ...prev, endDate: date }))}
                className="form-control"
                dateFormat="yyyy-MM-dd"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Cliente</Form.Label>
              <Form.Select name="clientId" value={form.clientId} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Dueño</Form.Label>
              <Form.Select name="ownerId" value={form.ownerId} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Skills</Form.Label>
              <Form.Select multiple value={form.skillIds} onChange={handleSkillChange}>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Check
          type="checkbox"
          label="Activo"
          name="active"
          checked={form.active}
          onChange={handleChange}
        />

        <Button type="submit" className="mt-3">{editId ? 'Actualizar' : 'Crear Proyecto'}</Button>
      </Form>
       {/* Filtros */}
       <h5 className="mt-5">Filtros</h5>
      <Row className="mb-3">
        <Col md={2}><Form.Control placeholder="Nombre" name="name" onChange={handleFilterChange} /></Col>
        <Col md={2}>
          <Form.Select name="cliente" onChange={handleFilterChange}>
            <option value="">Cliente</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select name="owner" onChange={handleFilterChange}>
            <option value="">Dueño</option>
            {owners.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select name="skill" onChange={handleFilterChange}>
            <option value="">Habilidad</option>
            {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}><Form.Control type="date" name="startDate" onChange={handleFilterChange} /></Col>
        <Col md={2}><Form.Control type="date" name="endDate" onChange={handleFilterChange} /></Col>
      </Row>


      {/* Tabla de proyectos */}
      <h4 className="mt-5 mb-3">Proyectos Registrados</h4>
      <Table striped bordered hover responsive>
        <thead className="text-center">
          <tr>
            <th>Nombre</th>
            <th>Cliente</th>
            <th>Dueño</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Activo</th>
            <th>Skills</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map(proj => (
            <tr key={proj.id}>
              <td>{proj.name}</td>
              <td>{proj.clienteName}</td>
              <td>{proj.wonerName}</td>
              <td>{proj.startDate}</td>
              <td>{proj.endDate}</td>
              <td>
                <Badge bg={proj.active ? 'success' : 'danger'}>
                  {proj.active ? 'Sí' : 'No'}
                </Badge>
              </td>
              <td>{proj.skillName.join(', ')}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(proj)} className="me-2">
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(proj.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
