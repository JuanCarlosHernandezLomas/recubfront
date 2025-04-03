'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  ListGroup,
} from 'react-bootstrap';
import {
  RocketTakeoff,
  Stars,
  PeopleFill,
  CheckCircleFill,
} from 'react-bootstrap-icons';
import Confetti from 'react-confetti';
import { Fade } from 'react-awesome-reveal';
import { useWindowSize } from 'react-use';
import { useTranslation } from 'react-i18next';


interface ApiForm {
  name: string;
}

export default function ManageDataPage() {
  const { t } = useTranslation();
  const [skill, setSkill] = useState<ApiForm>({ name: '' });
  const [experience, setExperience] = useState<ApiForm>({ name: '' });
  const [availability, setAvailability] = useState<ApiForm>({ name: '' });

  const [skills, setSkills] = useState<ApiForm[]>([]);
  const [experiences, setExperiences] = useState<ApiForm[]>([]);
  const [availabilities, setAvailabilities] = useState<ApiForm[]>([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    const fetchList = async (url: string, setter: (d: ApiForm[]) => void) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setter(data);
    };

    await fetchList('http://localhost:8090/api/skills', setSkills);
    await fetchList('http://localhost:8090/api/experience-level', setExperiences);
    await fetchList('http://localhost:8090/api/availability-status', setAvailabilities);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent,
    type: 'skill' | 'experience' | 'availability'
  ) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const token = localStorage.getItem('token');
    const payload =
      type === 'skill' ? skill : type === 'experience' ? experience : availability;

    const endpoint =
      type === 'skill'
        ? 'http://localhost:8090/api/skills'
        : type === 'experience'
        ? 'http://localhost:8090/api/experience-level'
        : 'http://localhost:8090/api/availability-status';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, active: true }),
      });

      if (!response.ok) throw new Error('Error al agregar los datos');

      setMessage('¡Agregado correctamente!');
      setShowConfetti(true);
      const sound = new Audio('/sound/sonido.mp3');
      sound.play().catch((err) => console.error("Error al reproducir sonido", err));
      setTimeout(() => setShowConfetti(false), 8000);
      if (type === 'skill') {
        setSkill({ name: '' });
      } else if (type === 'experience') {
        setExperience({ name: '' });
      } else {
        setAvailability({ name: '' });
      }
      fetchAll(); // actualizar en tiempo real
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Hubo un problema al enviar los datos');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center text-primary mb-4">{t("manager.title")}</h2>

      {message && (
        <Alert variant="success" className="text-center">
          <CheckCircleFill className="me-2" />
          {message}
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {showConfetti && (
  <Confetti
    width={width}
    height={height}
    numberOfPieces={300}       // más piezas
    gravity={0.2}              // caída más lenta
    recycle={false}            // no se repite
    run={true}                 // activa el efecto
  />
)}

      <Row className="g-4">
        {/* Skill */}
        <Col md={4}>
          <Card className="shadow p-4 border-0">
            <Card.Title className="text-center text-success mb-3">
              <Stars className="me-2" /> {t("manager.skills")}
            </Card.Title>
            <Form onSubmit={(e) => handleSubmit(e, 'skill')}>
              <Form.Control
                type="text"
                placeholder="Ej: Java, React"
                value={skill.name}
                onChange={(e) => setSkill({ name: e.target.value })}
                required
              />
              <Button type="submit" className="mt-3 w-100" variant="success">
                {t("manager.Button")}
              </Button>
            </Form>
            <Fade triggerOnce cascade damping={0.1}>
              <ListGroup className="mt-3">
                {skills.map((s, i) => (
                  <ListGroup.Item key={i}>{s.name}</ListGroup.Item>
                ))}
              </ListGroup>
            </Fade>
          </Card>
        </Col>

        {/* Experiencia */}
        <Col md={4}>
          <Card className="shadow p-4 border-0">
            <Card.Title className="text-center text-warning mb-3">
              <RocketTakeoff className="me-2" /> {t("manager.experience")}
            </Card.Title>
            <Form onSubmit={(e) => handleSubmit(e, 'experience')}>
              <Form.Control
                type="text"
                placeholder="Ej: Junior, Senior"
                value={experience.name}
                onChange={(e) => setExperience({ name: e.target.value })}
                required
              />
              <Button type="submit" className="mt-3 w-100" variant="warning">
              {t("manager.Button")}
              </Button>
            </Form>
            <Fade triggerOnce cascade damping={0.1}>
              <ListGroup className="mt-3">
                {experiences.map((e, i) => (
                  <ListGroup.Item key={i}>{e.name}</ListGroup.Item>
                ))}
              </ListGroup>
            </Fade>
          </Card>
        </Col>

        {/* Disponibilidad */}
        <Col md={4}>
          <Card className="shadow p-4 border-0">
            <Card.Title className="text-center text-info mb-3">
              <PeopleFill className="me-2" /> {t("manager.availability")}
            </Card.Title>
            <Form onSubmit={(e) => handleSubmit(e, 'availability')}>
              <Form.Control
                type="text"
                placeholder="Ej: Disponible, En Proyecto"
                value={availability.name}
                onChange={(e) => setAvailability({ name: e.target.value })}
                required
              />
              <Button type="submit" className="mt-3 w-100" variant="info">
              {t("manager.Button")}
              </Button>
            </Form>
            <Fade triggerOnce cascade damping={0.1}>
              <ListGroup className="mt-3">
                {availabilities.map((a, i) => (
                  <ListGroup.Item key={i}>{a.name}</ListGroup.Item>
                ))}
              </ListGroup>
            </Fade>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
