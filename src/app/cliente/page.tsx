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
import { useAuth } from "../context/useAuth";

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
}

export default function ClientesPage() {
  const { token } = useAuth();
  const [client, setClient] = useState({ name: "", locationId: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setClients((prev) => [...prev, data]);
      setClient({ name: "", locationId: 0 });
      setMessage("Cliente agregado correctamente");
    } catch {
      setError("Error al agregar cliente.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este cliente?")) return;
    try {
      await fetch(`http://localhost:8090/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients((prev) => prev.filter((cli) => cli.id !== id));
    } catch {
      alert("Error al eliminar cliente.");
    }
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
      <h2 className="mb-4 text-primary">Gestión de Clientes</h2>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              placeholder="Nombre del Cliente"
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
              <option value="">Seleccione ubicación</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" className="w-100">
              Agregar
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
                  {locations.find((l) => l.id === client.locationId)?.name || "-"}
                </Card.Text>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(client)}
                >
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(client.id)}>
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
              <th>ID</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
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
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(cli.id)}>
                    Eliminar
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
    </Container>
  );
}
