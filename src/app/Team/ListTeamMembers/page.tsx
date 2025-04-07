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

interface TeamMember {
  id: number;
  rolEnEquipo: string;
  perfilId: number;
  perfilName: string;
  teamId: number;
  teamName: string;
  active: boolean;
}

export default function ListTeamMembersPage() {
  const { token } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [filters, setFilters] = useState({ profileName: "", teamName: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/team-members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo obtener los miembros del equipo.");
      const data = await res.json();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  useEffect(() => {
    let filtered = members;

    if (filters.profileName) {
      filtered = filtered.filter((m) =>
        m.perfilName.toLowerCase().includes(filters.profileName.toLowerCase())
      );
    }

    if (filters.teamName) {
      filtered = filtered.filter((m) =>
        m.teamName.toLowerCase().includes(filters.teamName.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [filters, members]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const confirmDelete = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      const res = await fetch(`http://localhost:8090/api/team-members/${memberToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al eliminar la asignación.");
      fetchMembers(); // refresca la lista
      setShowDeleteModal(false);
    } catch {
      alert("Error al eliminar.");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">👥 Asignaciones de Miembros a Equipos</h2>

      {/* Filtros */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            name="profileName"
            placeholder="Buscar por nombre"
            value={filters.profileName}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="teamName"
            placeholder="Buscar por equipo"
            value={filters.teamName}
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
            {filteredMembers.map((m) => (
              <div key={m.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{m.perfilName}</h5>
                  <p><strong>Equipo:</strong> {m.teamName}</p>
                  <p><strong>Rol:</strong> {m.rolEnEquipo}</p>
                  <p><strong>Estado:</strong>{" "}
                    {m.active ? (
                      <Badge bg="success">Activo</Badge>
                    ) : (
                      <Badge bg="danger">Inactivo</Badge>
                    )}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Button variant="danger" size="sm" onClick={() => confirmDelete(m)}>
                      Eliminar
                    </Button>
                  </div>
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
                  <th>Miembro</th>
                  <th>Rol</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.perfilName}</td>
                    <td>{m.rolEnEquipo}</td>
                    <td>{m.teamName}</td>
                    <td>
                      {m.active ? (
                        <Badge bg="success">Activo</Badge>
                      ) : (
                        <Badge bg="danger">Inactivo</Badge>
                      )}
                    </td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => confirmDelete(m)}>
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
            ¿Deseas eliminar la asignación de <strong>{memberToDelete?.perfilName}</strong> al equipo <strong>{memberToDelete?.teamName}</strong>?
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
