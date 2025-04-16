'use client';

import { useState, useEffect, JSX } from 'react';
import {
  Container, Form, Button, Row, Col, Card, ListGroup, Modal, Spinner
} from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, ArrowBarLeft } from 'react-bootstrap-icons';
import {
  RocketTakeoff, Stars, PeopleFill, PencilFill, Trash
} from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import { Fade } from 'react-awesome-reveal';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { toast } from 'react-toastify';

interface ApiItem {
  id: number;
  name: string;
}

export default function ManageDataPage() {
  const { t } = useTranslation();
  const { roles } = useAuth();
  const { width, height } = useWindowSize();

  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');

  const [skills, setSkills] = useState<ApiItem[]>([]);
  const [experiences, setExperiences] = useState<ApiItem[]>([]);
  const [availabilities, setAvailabilities] = useState<ApiItem[]>([]);

  const [filteredSkills, setFilteredSkills] = useState<ApiItem[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<ApiItem[]>([]);
  const [filteredAvailabilities, setFilteredAvailabilities] = useState<ApiItem[]>([]);

  const [filterSkill, setFilterSkill] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');
  const [currentPage, setCurrentPage] = useState({ skill: 1, experience: 1, availability: 1 });
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editModal, setEditModal] = useState<{ show: boolean, type: string, item: ApiItem | null }>({ show: false, type: '', item: null });
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, type: string, item: ApiItem | null }>({ show: false, type: '', item: null });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const hasRole = (allowedRoles: string[]) => allowedRoles.some(role => roles.includes(role));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [skillsRes, expRes, availRes] = await Promise.all([
        fetch('http://localhost:8090/api/skills', { headers }),
        fetch('http://localhost:8090/api/experience-level', { headers }),
        fetch('http://localhost:8090/api/availability-status', { headers }),
      ]);
      const [skillsData, expData, availData] = await Promise.all([
        skillsRes.json(), expRes.json(), availRes.json()
      ]);
      setSkills(skillsData); setFilteredSkills(skillsData);
      setExperiences(expData); setFilteredExperiences(expData);
      setAvailabilities(availData); setFilteredAvailabilities(availData);
    } catch {
      toast.error(t('manager.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    setFilteredSkills(skills.filter(s => s.name.toLowerCase().includes(filterSkill.toLowerCase())));
  }, [filterSkill, skills]);

  useEffect(() => {
    setFilteredExperiences(experiences.filter(e => e.name.toLowerCase().includes(filterExperience.toLowerCase())));
  }, [filterExperience, experiences]);

  useEffect(() => {
    setFilteredAvailabilities(availabilities.filter(a => a.name.toLowerCase().includes(filterAvailability.toLowerCase())));
  }, [filterAvailability, availabilities]);

  const handleSubmit = async (type: string, value: string) => {
    const endpoint = type === 'skill' ? 'skills' : type === 'experience' ? 'experience-level' : 'availability-status';
    try {
      const res = await fetch(`http://localhost:8090/api/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: value, active: true })
      });
      if (!res.ok) throw new Error();
      toast.success(t('manager.message'));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
      fetchAll();
      type === 'skill' ? setSkill('') : type === 'experience' ? setExperience('') : setAvailability('');
    } catch {
      toast.error(t('manager.error'));
    }
  };

  const handleUpdate = async () => {
    const { type, item } = editModal;
    if (!item) return;
    const endpoint = type === 'skill' ? 'skills' : type === 'experience' ? 'experience-level' : 'availability-status';
    try {
      await fetch(`http://localhost:8090/api/${endpoint}/${item.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: item.name, active: true })
      });
      toast.success(t('manager.updated'));
      fetchAll();
      setEditModal({ show: false, type: '', item: null });
    } catch {
      toast.error(t('manager.errorUpdate'));
    }
  };

  const handleDelete = async () => {
    const { type, item } = deleteModal;
    if (!item) return;
    const endpoint = type === 'skill' ? 'skills' : type === 'experience' ? 'experience-level' : 'availability-status';
    try {
      await fetch(`http://localhost:8090/api/${endpoint}/${item.id}`, {
        method: 'DELETE',
        headers
      });
      toast.success(t('manager.deleted'));
      fetchAll();
      setDeleteModal({ show: false, type: '', item: null });
    } catch {
      toast.error(t('manager.errorDelete'));
    }
  };

  const paginate = (list: ApiItem[], page: number) => {
    const start = (page - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  };

  const renderPaginationControls = (
    type: keyof typeof currentPage,
    list: ApiItem[]
  ) => {
    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const current = currentPage[type];

    return (
      <div className="d-flex flex-wrap justify-content-center mt-3 overflow-hidden">
        <ButtonGroup className="flex-wrap">
          {current > 1 && (
            <>
              <Button
                variant="outline-secondary"
                size="sm"
                className="mb-1"
                onClick={() =>
                  setCurrentPage((prev) => ({ ...prev, [type]: 1 }))
                }
              >
                ⏮ {t("pagination.first")}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="mb-1"
                onClick={() =>
                  setCurrentPage((prev) => ({
                    ...prev,
                    [type]: prev[type] - 1,
                  }))
                }
              >
                ← {t("pagination.prev")}
              </Button>
            </>
          )}

          <Button
            variant="light"
            size="sm"
            disabled
            className="fw-bold text-dark mb-1"
          >
            {t("pagination.page")} {current}
          </Button>

          {current < totalPages && (
            <Button
              variant="secondary"
              size="sm"
              className="mb-1"
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [type]: prev[type] + 1,
                }))
              }
            >
              {t("pagination.next")} →
            </Button>
          )}
        </ButtonGroup>
      </div>
    );
  };

  const renderCard = (
    title: string,
    icon: JSX.Element,
    value: string,
    setter: (v: string) => void,
    filterValue: string,
    setFilterValue: (v: string) => void,
    list: ApiItem[],
    type: 'skill' | 'experience' | 'availability',
    color: string
  ) => {
    const paginatedList = paginate(list, currentPage[type]);

    return (
      <Col md={4}>
        <Card className="shadow p-4 border-0">
          <Card.Title className={`text-center text-${color} mb-3`}>
            {icon} {title}
          </Card.Title>

          {hasRole(['ROLE_ADMINS']) && (
            <Form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(type, value);
            }}>
              <Form.Control
                placeholder={t(`manager.placeholder.${type}`)}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
              />
              <Button type="submit" className="mt-3 w-100" variant={color}>
                {t('manager.Button')}
              </Button>
            </Form>
          )}

          <Fade triggerOnce cascade damping={0.1}>
            <Form.Control
              type="text"
              placeholder={t("manager.filter")}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="mt-3"
            />

            <ListGroup className="mt-3">
              {paginatedList.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {item.name}
                  {hasRole(['ROLE_ADMINS']) && (
                    <div>
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => setEditModal({ show: true, type, item })}>
                        <PencilFill />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setDeleteModal({ show: true, type, item })}>
                        <Trash />
                      </Button>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Fade>
          <div>
            {renderPaginationControls(type, list)}
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <Container className="py-5">
      <h2 className="text-center text-primary mb-4">
        {roles.includes("ROLE_ADMINS") ? t("manager.titleAdmin") : t("manager.titleUser")}
      </h2>

      {showConfetti && <Confetti width={width} height={height} numberOfPieces={250} recycle={false} />}

      {loading ? (
        <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Row className="g-4">
          {renderCard(t("manager.skills"), <Stars className="me-2" />, skill, setSkill, filterSkill, setFilterSkill, filteredSkills, 'skill', 'success')}
          {renderCard(t("manager.experience"), <RocketTakeoff className="me-2" />, experience, setExperience, filterExperience, setFilterExperience, filteredExperiences, 'experience', 'warning')}
          {renderCard(t("manager.availability"), <PeopleFill className="me-2" />, availability, setAvailability, filterAvailability, setFilterAvailability, filteredAvailabilities, 'availability', 'info')}
        </Row>
      )}

      {/* Modal de Edición */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, type: '', item: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("manager.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <Form.Group>
              <Form.Label>{t("manager.editField")}</Form.Label>
              <Form.Control
                value={editModal.item?.name || ''}
                onChange={(e) => {
                  if (editModal.item) {
                    setEditModal(prev => ({ ...prev, item: { ...prev.item!, name: e.target.value } }));
                  }
                }}
                required
              />
            </Form.Group>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={() => setEditModal({ show: false, type: '', item: null })}>
                {t("cancel")}
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                {t("save")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, type: '', item: null })} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>{t("warningmessage.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            {t("warningmessage.confirmDelete")} <strong>{deleteModal.item?.name}</strong>?
          </p>
          <p className="text-muted small">{t("warningmessage.caution")}</p>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, type: '', item: null })}>
            {t("warningmessage.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("warningmessage.accept")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
