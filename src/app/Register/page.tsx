'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  FloatingLabel,
  Alert,
  Spinner,
} from 'react-bootstrap';
import {
  Briefcase,
  FileEarmarkText,
  GeoAlt,
  People,
  PersonBadge,
  PersonVcard,
  Stars,
  Clipboard2Check,
  CheckCircleFill,
} from 'react-bootstrap-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Page = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    resume: null as File | null,
    availabilityStatusId: '',
    experienceLevelId: '',
    locationId: '',
    userId: '',
    skillIds: [] as number[],
  });

  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [availabilityStatuses, setAvailabilityStatuses] = useState<{ id: number; name: string }[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<{ id: number; name: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init();
    setSkills([{ id: 1, name: 'Java' }, { id: 2, name: 'Spring Boot' }]);
    setLocations([{ id: 1, name: 'Madrid' }, { id: 2, name: 'Barcelona' }]);
    setAvailabilityStatuses([{ id: 1, name: 'BENCH' }, { id: 2, name: 'ASSIGNED' }]);
    setExperienceLevels([{ id: 1, name: 'Junior' }, { id: 2, name: 'Senior' }]);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;

    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
    } else if (name === 'skillIds') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map((opt) =>
        Number(opt.value)
      );
      setFormData((prev) => ({ ...prev, skillIds: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    type ProfileFormFields = typeof formData;

    Object.keys(formData).forEach((key) => {
      const typedKey = key as keyof ProfileFormFields;
      if (typedKey === 'skillIds') {
        formData.skillIds.forEach((id) => data.append('skillIds', id.toString()));
      } else if (typedKey === 'resume' && formData.resume instanceof File) {
        data.append('resume', formData.resume);
      } else {
        data.append(typedKey, formData[typedKey]?.toString() || '');
      }
    });

    console.log('Datos enviados:', formData);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }, 2000);
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 rounded-4 bg-light" data-aos="fade-up">
        <Card.Body className="p-5">
          <h2 className="text-center text-primary mb-4 fw-bold">
            <PersonBadge className="me-2" /> Registro de Perfil Profesional
          </h2>

          {submitted && (
            <Alert variant="success" className="text-center">
              <CheckCircleFill className="me-2 text-success" /> Registro completado con éxito
            </Alert>
          )}

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <div className="mt-2 text-muted">Registrando información...</div>
            </div>
          )}

          {!loading && (
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Row className="mb-3">
                <Col md={6} data-aos="fade-right">
                  <FloatingLabel label={<><PersonVcard className="me-2" />ID de Empleado</>}>
                    <Form.Control type="text" name="employeeId" required onChange={handleChange} />
                  </FloatingLabel>
                </Col>
                <Col md={6} data-aos="fade-left">
                  <FloatingLabel label={<><Briefcase className="me-2" />Puesto</>}>
                    <Form.Control type="text" name="jobTitle" required onChange={handleChange} />
                  </FloatingLabel>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6} data-aos="fade-right">
                  <FloatingLabel label={<><PersonVcard className="me-2" />Nombre</>}>
                    <Form.Control type="text" name="firstName" required onChange={handleChange} />
                  </FloatingLabel>
                </Col>
                <Col md={6} data-aos="fade-left">
                  <FloatingLabel label={<><PersonVcard className="me-2" />Apellido</>}>
                    <Form.Control type="text" name="lastName" required onChange={handleChange} />
                  </FloatingLabel>
                </Col>
              </Row>

              <Form.Group controlId="formFile" className="mb-3" data-aos="fade-up">
                <Form.Label className="fw-semibold"><FileEarmarkText className="me-2" />CV (PDF, DOC, DOCX)</Form.Label>
                <Form.Control type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} />
              </Form.Group>

              <Row className="mb-3">
                <Col md={4} data-aos="fade-right">
                  <FloatingLabel label={<><Clipboard2Check className="me-2" />Disponibilidad</>}>
                    <Form.Select name="availabilityStatusId" onChange={handleChange} required>
                      <option value="">--Selecciona--</option>
                      {availabilityStatuses.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
                <Col md={4} data-aos="fade-up">
                  <FloatingLabel label={<><Stars className="me-2" />Nivel de Experiencia</>}>
                    <Form.Select name="experienceLevelId" onChange={handleChange} required>
                      <option value="">--Selecciona--</option>
                      {experienceLevels.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
                <Col md={4} data-aos="fade-left">
                  <FloatingLabel label={<><GeoAlt className="me-2" />Ubicación</>}>
                    <Form.Select name="locationId" onChange={handleChange} required>
                      <option value="">--Selecciona--</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>

              <FloatingLabel label={<><People className="me-2" />ID de Usuario</>} className="mb-3" data-aos="fade-up">
                <Form.Control type="number" name="userId" required onChange={handleChange} />
              </FloatingLabel>

              <Form.Group className="mb-4" data-aos="fade-up">
                <Form.Label className="fw-semibold"><Stars className="me-2" />Habilidades</Form.Label>
                <Form.Select name="skillIds" multiple required onChange={handleChange}>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </Form.Select>
                <Form.Text muted>Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples</Form.Text>
              </Form.Group>

              <div className="text-center" data-aos="zoom-in">
                <Button type="submit" variant="success" size="lg" className="px-5 rounded-pill shadow">
                  <PersonBadge className="me-2" />Registrar
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Page;
