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

interface Team {
  id: number;
  name: string;
  description: string;
  projectName: string;
  active: boolean;
}

export default function ListTeamsPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [filters, setFilters] = useState({ name: "", project: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo obtener la lista de equipos.");
      const data = await res.json();
      setTeams(data);
      setFilteredTeams(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [token]);

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
      const res = await fetch(`http://localhost:8090/api/teams/${teamToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar el equipo.");
      fetchTeams(); // refresca la lista
      setShowDeleteModal(false);
    } catch {
      alert("Error al eliminar.");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">🏢 Equipos Creados</h2>

      {/* Filtros */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            name="name"
            placeholder="Buscar por nombre del equipo"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="project"
            placeholder="Buscar por proyecto"
            value={filters.project}
            onChange={handleFilterChange}
          />
        </Col>
      </Row>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          {/* Cards en móviles */}
          <div className="d-md-none">
            {filteredTeams.map((t) => (
              <div key={t.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{t.name}</h5>
                  <p><strong>Proyecto:</strong> {t.projectName}</p>
                  <p><strong>Descripción:</strong> {t.description}</p>
                  <p><strong>Estado:</strong>{" "}
                    {t.active ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="danger">Inactivo</Badge>
                    )}
                  </p>
                  <Button variant="danger" size="sm" onClick={() => confirmDelete(t)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla en escritorio */}
          <div className="d-none d-md-block">
            <Table bordered hover responsive className="shadow-sm text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Proyecto</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.projectName}</td>
                    <td>{t.description}</td>
                    <td>
                      {t.active ? (
                        <Badge bg="success">Activo</Badge>
                      ) : (
                        <Badge bg="danger">Inactivo</Badge>
                      )}
                    </td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => confirmDelete(t)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      {/* Modal confirmación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>⚠️ Confirmar eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Deseas eliminar el equipo <strong>{teamToDelete?.name}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>
    </Container>
  );
}
