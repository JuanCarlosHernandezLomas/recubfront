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
import { useTranslation } from 'react-i18next';

interface TeamMember {
  id: number;
  rolEnEquipo: string;
  perfilId: number;
  perfilName: string;
  teamId: number;
  teamName: string;
  active: boolean;
}

interface Option {
  id: number;
  name: string;
}

export default function ListTeamMembersPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [filters, setFilters] = useState({ profileName: "", teamName: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState({
    rolEnEquipo: "",
    perfilId: "",
    teamId: ""
  });

  const [profiles, setProfiles] = useState<Option[]>([]);
  const [teams, setTeams] = useState<Option[]>([]);

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

  const fetchOptions = async () => {
    try {
      const [profilesRes, teamsRes] = await Promise.all([
        fetch("http://localhost:8090/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8090/api/teams", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profilesData = await profilesRes.json();
      const teamsData = await teamsRes.json();

      setProfiles(profilesData.map((p: any) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
      })));
      setTeams(teamsData);
    } catch (err) {
      console.error("Error al cargar perfiles o equipos", err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchOptions();
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
      fetchMembers();
      setShowDeleteModal(false);
    } catch {
      alert("Error al eliminar.");
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditForm({
      rolEnEquipo: member.rolEnEquipo,
      perfilId: String(member.perfilId),
      teamId: String(member.teamId)
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!memberToEdit) return;
    try {
      const res = await fetch(`http://localhost:8090/api/team-members/${memberToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rolEnEquipo: editForm.rolEnEquipo,
          perfilId: parseInt(editForm.perfilId),
          teamId: parseInt(editForm.teamId),
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Error al editar el miembro del equipo.");
      setShowEditModal(false);
      fetchMembers();
    } catch {
      alert("Error al editar.");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">{t("AssigmenTeamList.title")}</h2>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            name="profileName"
            placeholder={t("AssigmenTeamList.filtername")}
            value={filters.profileName}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={4}>
          <Form.Control
            name="teamName"
            placeholder={t("AssigmenTeamList.filterteam")}
            value={filters.teamName}
            onChange={handleFilterChange}
          />
        </Col>
      </Row>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table bordered hover responsive className="shadow-sm text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("AssigmenTeamList.user")}</th>
              <th>{t("AssigmenTeamList.rol")}</th>
              <th>{t("AssigmenTeamList.Team")}</th>
              <th>{t("AssigmenTeamList.status")}</th>
              <th>{t("AssigmenTeamList.Action")}</th>
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
                    <Badge bg="success">{t("AssigmenTeamList.Active")}</Badge>
                  ) : (
                    <Badge bg="danger">{t("AssigmenTeamList.Inactive")}</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(m)}
                  >
                    {t("AssigmenTeamList.edit")}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => confirmDelete(m)}>
                    {t("AssigmenTeamList.delete")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("AssigmenTeamList.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t("AssigmenTeamList.rol")}</Form.Label>
              <Form.Control
                name="rolEnEquipo"
                value={editForm.rolEnEquipo}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("AssigmenTeamList.user")}</Form.Label>
              <Form.Select name="perfilId" value={editForm.perfilId} onChange={handleEditChange}>
                <option value="">Seleccionar perfil</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t("AssigmenTeamList.Team")}</Form.Label>
              <Form.Select name="teamId" value={editForm.teamId} onChange={handleEditChange}>
                <option value="">Seleccionar equipo</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t("TeamList.cancel")}
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            {t("TeamList.savechange")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
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
            {t("warningmessage.assignment")}{" "}
            <strong>{memberToDelete?.perfilName}</strong>{" "}
            {t("warningmessage.TeamAssg")} <strong>{memberToDelete?.teamName}</strong>?
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
