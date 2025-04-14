"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  Container,
  Table,
  Row,
  Col,
  Form,
  Spinner,
  Alert,
  Button,
  Badge,
  Modal,
} from "react-bootstrap";
import { useAuth } from "@/app/context/useAuth";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';

interface Team {
  id: number;
  name: string;
  description: string;
  projectId?: number;
  projectName: string;
  active: boolean;
}

interface ProjectOption {
  id: number;
  name: string;
}

interface EditTeamForm {
  name: string;
  description: string;
  projectId: string;
}

export default function ListTeamsPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [filters, setFilters] = useState({ name: "", project: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeamForm>();

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, [token]);

  const fetchTeams = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeams(data);
      setFilteredTeams(data);
    } catch {
      toast.error("No se pudo obtener la lista de equipos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data);
    } catch {
      toast.error("Error al cargar los proyectos");
    }
  };

  useEffect(() => {
    let filtered = teams;
    if (filters.name) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.project) {
      filtered = filtered.filter((t) =>
        t.projectName.toLowerCase().includes(filters.project.toLowerCase())
      );
    }
    setFilteredTeams(filtered);
  }, [filters, teams]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const confirmDelete = (team: Team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!teamToDelete) return;
    try {
      const res = await fetch(
        `http://localhost:8090/api/teams/${teamToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error al eliminar el equipo.");
      fetchTeams();
      toast.success(t("TeamList.deleted"));
      setShowDeleteModal(false);
    } catch {
      toast.error(t("TeamList.errorDelete"));
    }
  };

  const handleEditClick = (team: Team) => {
    setTeamToEdit(team);
    reset({
      name: team.name,
      description: team.description,
      projectId: team.projectId ? String(team.projectId) : "",
    });
    setShowEditModal(true);
  };

  const onSubmitEdit = async (data: EditTeamForm) => {
    if (!teamToEdit) return;
    const updatedTeam = {
      ...data,
      projectId: parseInt(data.projectId),
      active: true,
    };

    try {
      const res = await fetch(
        `http://localhost:8090/api/teams/${teamToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTeam),
        }
      );

      if (!res.ok) throw new Error("Error al editar el equipo");

      toast.success(t("TeamList.updated"));
      setShowEditModal(false);
      fetchTeams();
    } catch {
      toast.error(t("TeamList.errorEdit"));
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">{t("TeamList.title")}</h2>

      {/* Filtros */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            name="name"
            placeholder={t("TeamList.filtername")}
            value={filters.name}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="project"
            placeholder={t("TeamList.filterproyect")}
            value={filters.project}
            onChange={handleFilterChange}
          />
        </Col>
      </Row>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="d-none d-md-block">
            <Table bordered hover responsive className="shadow-sm text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t("TeamList.name")}</th>
                  <th>{t("TeamList.project")}</th>
                  <th>{t("TeamList.descripcion")}</th>
                  <th>{t("TeamList.status")}</th>
                  <th>{t("TeamList.Action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>{team.id}</td>
                    <td>{team.name}</td>
                    <td>{team.projectName}</td>
                    <td>{team.description}</td>
                    <td>
                      {team.active ? (
                        <Badge bg="success">{t("ListProject.Active")}</Badge>
                      ) : (
                        <Badge bg="danger">{t("ListProject.Inactive")}</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditClick(team)}
                      >
                        {t("ListProject.edit")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDelete(team)}
                      >
                        {t("TeamList.delete")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      {/* Modal de edición con validaciones */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("TeamList.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmitEdit)} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>{t("TeamList.name")}</Form.Label>
              <Form.Control
                {...register("name", { required: t("TeamList.requiredName") })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("TeamList.descripcion")}</Form.Label>
              <Form.Control
                {...register("description", {
                  required: t("TeamList.requiredDescription"),
                })}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("TeamList.project")}</Form.Label>
              <Form.Select
                {...register("projectId", {
                  required: t("TeamList.requiredProject"),
                })}
                isInvalid={!!errors.projectId}
              >
                <option value="">{t("selectProject")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.projectId?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                {t("TeamList.cancel")}
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                {t("TeamList.savechange")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de eliminación */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        backdrop="static"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>{t("warningmessage.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-3">
              {t("warningmessage.Team")} <strong>{teamToDelete?.name}</strong>?
            </p>
            <p className="text-muted small">{t("warningmessage.caution")}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t("warningmessage.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t("warningmessage.accept")}
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>
    </Container>
  );
}
