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
  Badge,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

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
  city: string;
}

export default function ClientesPage() {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [client, setClient] = useState({ name: "", locationId: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validatedEdit, setValidatedEdit] = useState(false);
  const [validatedAdd, setValidatedAdd] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    location: ''
  });

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  

  const filteredClients = clients.filter((cli) =>
    cli.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    (filters.location === "" || cli.locationName?.toLowerCase().includes(filters.location.toLowerCase()))
  );

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
        toast.error("Error al cargar datos", { toastId: "load-error" });
      }
    };
    fetchInitialData();
  }, [token]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setClient((prev) => ({
      ...prev,
      [name]: name === "locationId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidatedAdd(true);

    if (!client.name.trim() || !client.locationId) return;

    try {
      const res = await fetch("http://localhost:8090/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...client, active: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t("client.error"));
      }

      const data = await res.json();

      // Enriquecer con locationName para mostrar correctamente en tabla
      const locationObj = locations.find((loc) => loc.id === client.locationId);
      const enrichedClient = {
        ...data,
        locationName: locationObj?.city || "", // o loc.city
      };

      setClients((prev) => [...prev, enrichedClient]);
      setClient({ name: "", locationId: 0 });
      setValidatedAdd(false);
      toast.success(t("client.success"), { toastId: "add-success" });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || t("client.errordata"), { toastId: "add-error" });
      }
    }
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const res = await fetch(
        `http://localhost:8090/api/clients/${clientToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...clientToDelete,
            active: false, //  baja lógica
          }),
        }
      );

      if (!res.ok) throw new Error("Error al desactivar cliente");

      //  Recargar la lista completa desde el backend
      const refreshedClients = await fetch(
        "http://localhost:8090/api/clients",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await refreshedClients.json();
      setClients(data);

      setShowDeleteModal(false);
      setClientToDelete(null);
      toast.success("Cliente desactivado correctamente", { toastId: "delete-success" });
    } catch (err) {
      toast.error("Error al desactivar cliente", { toastId: "delete-error" });
    }
  };

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setShowModal(true);
  };

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editClient) return;
    const { name, value } = e.target;
    setEditClient((prev) =>
      prev
        ? { ...prev, [name]: name === "locationId" ? Number(value) : value }
        : null
    );
  };

  const handleEditSubmit = async () => {
    if (!editClient) return;
    setValidatedEdit(true);

    // Validación visual + lógica
    if (!editClient.name.trim() || !editClient.locationId) return;
    try {
      const res = await fetch(
        `http://localhost:8090/api/clients/${editClient.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editClient),
        }
      );

      if (!res.ok) throw new Error("Error al editar cliente");

      const updated = await res.json();

      // 🛠 Enriquecer con el locationName (para que no se borre de la tabla)
      const locationObj = locations.find(
        (loc) => loc.id === updated.locationId
      );

      const enrichedClient = {
        ...updated,
        locationName: locationObj?.city || "", // o loc.name
      };

      setClients((prev) =>
        prev.map((cli) => (cli.id === updated.id ? enrichedClient : cli))
      );

      setShowModal(false);
      setValidatedEdit(false);
      toast.success("Cliente actualizado correctamente", { toastId: "edit-success" });
    } catch {
      toast.error("Error al actualizar cliente", { toastId: "edit-error" });
    }
  };
  return (
    <Container className="py-4">
      <h2 className="mb-4 text-primary">{t("client.title")}</h2>


      <Form noValidate validated={validatedAdd} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              placeholder={t("client.filterCustomer")}
              name="name"
              value={client.name}
              onChange={handleChange}
              required
              isInvalid={validatedAdd && !client.name.trim()}
            />
            <Form.Control.Feedback type="invalid">
              {t("client.requiredName")}
            </Form.Control.Feedback>
          </Col>
          <Col md={4}>
            <Form.Select
              name="locationId"
              value={client.locationId}
              onChange={handleChange}
              required
              isInvalid={validatedAdd && !client.locationId}
            >
              <option value="">{t("client.filterLocation")}</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {t("client.requiredLocation")}
            </Form.Control.Feedback>
          </Col>
          <Col md={2}>
            <Button type="submit" variant="primary" className="w-100">
              {t("client.add")}
            </Button>
          </Col>
        </Row>
      </Form>
      <Row className="mb-3">
  <Col md={6}>
    <Form.Control
      placeholder="🔍 Filtrar por nombre"
      name="name"
      value={filters.name}
      onChange={handleFilterChange}
    />
  </Col>
  <Col md={6}>
    <Form.Control
      placeholder="📍 Filtrar por ciudad"
      name="location"
      value={filters.location}
      onChange={handleFilterChange}
    />
  </Col>
</Row>


      {/* Vista en tarjetas para móviles */}
      <Row className="d-md-none">
        {filteredClients.map((client) => (
          <Col xs={12} key={client.id} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{client.name}</Card.Title>
                <Card.Text>
                  <strong>{t("client.location")}</strong> {client.locationName}
                </Card.Text>
                <p>
                  <Badge bg={client.active ? "success" : "danger"}>
                    {client.active
                      ? t("listlocation.Active")
                      : t("listlocation.Inactive")}
                  </Badge>
                </p>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(client)}
                >
                  {t("client.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => confirmDelete(client)}
                >
                  {t("client.delete")}
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
            {filteredClients.map((cli) => (
              <tr key={cli.id}>
                <td>{cli.id}</td>
                <td>{cli.name}</td>
                <td>{cli.locationName}</td>
                <td>
                  <Badge bg={cli.active ? "success" : "danger"}>
                    {cli.active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(cli)}
                  >
                    {t("client.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => confirmDelete(cli)}
                  >
                    {t("client.delete")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("client.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editClient && (
            <Form noValidate validated={validatedEdit}>
              <Form.Group className="mb-3">
                <Form.Label>{t("client.name")}</Form.Label>
                <Form.Control
                  name="name"
                  value={editClient.name}
                  onChange={handleEditChange}
                  required
                  isInvalid={validatedEdit && !editClient.name.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  {t("client.requiredName")}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group>
                <Form.Label>{t("client.location")}</Form.Label>
                <Form.Select
                  name="locationId"
                  value={editClient.locationId}
                  onChange={handleEditChange}
                  required
                  isInvalid={validatedEdit && !editClient.locationId}
                >
                  <option value="">{t("client.filterLocation")}</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {t("client.requiredLocation")}
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("client.cancel")}
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            {t("client.savechange")}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        backdrop="static"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>{t("warningmessage.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p className="mb-3">
              {t("warningmessage.customer")}{" "}
              <strong>{clientToDelete?.name}</strong>?
            </p>
            <p className="text-muted small">{t("warningmessage.caution")}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
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
