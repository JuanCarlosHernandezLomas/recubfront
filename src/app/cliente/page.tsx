"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Table,
  Card,
  Modal,
} from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import { Fade } from 'react-awesome-reveal';
import { motion, AnimatePresence } from 'framer-motion';

interface Client {
  id: number;
  name: string;
  locationId: number;
  locationName?: string;
  active: boolean;
}

interface Location {
  id: number;
  name: string;
  city: string
}

export default function ClientesPage() {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [client, setClient] = useState({ name: "", locationId: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [locRes, cliRes] = await Promise.all([
          fetch("http://localhost:8090/api/locations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8090/api/clients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const locData = await locRes.json();
        const cliData = await cliRes.json();
        setLocations(locData);
        setClients(cliData);
        console.log("Ubicaciones:", locData); // 👈 Verifica si llega bien
        console.log("Clientes:", cliData);  
      } catch (err) {
        setError("Error al cargar datos.");
      }
    };
    fetchInitialData();
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: name === "locationId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
  
    try {
      const res = await fetch("http://localhost:8090/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...client, active: true }),
      });
  
      if (!res.ok) throw new Error("Error al agregar cliente");
  
      const data = await res.json();
  
      // Enriquecer con locationName para mostrar correctamente en tabla
      const locationObj = locations.find(loc => loc.id === client.locationId);
      const enrichedClient = {
        ...data,
        locationName: locationObj?.city|| "", // o loc.city
      };
  
      setClients((prev) => [...prev, enrichedClient]);
      setClient({ name: "", locationId: 0 });
      setMessage("Cliente agregado correctamente");
    } catch {
      setError("Error al agregar cliente.");
    }
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
};

  const handleDelete = async () => {
    if(!clientToDelete) return;
      await fetch(`http://localhost:8090/api/clients/${clientToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowDeleteModal(false);
  
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setShowModal(true);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editClient) return;
    const { name, value } = e.target;
    setEditClient((prev) =>
      prev ? { ...prev, [name]: name === "locationId" ? Number(value) : value } : null
    );
  };

  const handleEditSubmit = async () => {
    if (!editClient) return;
    try {
      const res = await fetch(`http://localhost:8090/api/clients/${editClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editClient),
      });
      if (!res.ok) throw new Error("Error al editar cliente");
      const updated = await res.json();
      setClients((prev) =>
        prev.map((cli) => (cli.id === updated.id ? updated : cli))
      );
      setShowModal(false);
    } catch {
      alert("Error al actualizar");
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary">{t("client.title")}</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              placeholder={t("client.filterCustomer")}
              name="name"
              value={client.name}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={4}>
            <Form.Select
              name="locationId"
              value={client.locationId}
              onChange={handleChange}
              required
            >
              <option value="">{t("client.filterLocation")}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" className="w-100">
              {t("client.add")}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Vista en tarjetas para móviles */}
      <Row className="d-md-none">
        {clients.map((client) => (
          <Col xs={12} key={client.id} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{client.name}</Card.Title>
                <Card.Text>
                  <strong>Ubicación:</strong>{" "}
                  {client.locationName}
                </Card.Text>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(client)}
                >
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => confirmDelete(client)}>
                  Eliminar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Vista en tabla para desktop */}
      <div className="d-none d-md-block">
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>{t("client.Id")}</th>
              <th>{t("client.name")}</th>
              <th>{t("client.location")}</th>
              <th>{t("client.status")}</th>
              <th>{t("client.action")}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((cli) => (
              <tr key={cli.id}>
                <td>{cli.id}</td>
                <td>{cli.name}</td>
                <td>{cli.locationName}</td>
                <td>{cli.active ? "Activo" : "Inactivo"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(cli)}
                  >
                    {t("client.edit")}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => confirmDelete(cli)}>
                  {t("client.delete")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editClient && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="name"
                  value={editClient.name}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Ubicación</Form.Label>
                <Form.Select
                  name="locationId"
                  value={editClient.locationId}
                  onChange={handleEditChange}
                >
                  <option value="">Seleccione ubicación</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Modal.Header closeButton className="bg-danger text-white">
                        <Modal.Title>⚠️ Confirmación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <p className="mb-3">
                            ¿Estás seguro de que deseas eliminar el cliente <strong>{clientToDelete?.name}</strong>?
                        </p>
                        <p className="text-muted small">Esta acción no se puede deshacer.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Sí, Eliminar
                        </Button>
                    </Modal.Footer>
                </motion.div>
            </Modal>

    </Container>
  );
}
