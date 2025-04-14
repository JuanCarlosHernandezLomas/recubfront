"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  Badge,
} from "react-bootstrap";
import { useAuth } from "@/app/context/useAuth";
import { Fade } from "react-awesome-reveal";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";

interface Location {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
}

export default function ViewLocationsPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );
  const [validatedEdit, setValidatedEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      loc.city.toLowerCase().includes(filters.city.toLowerCase()) &&
      loc.state.toLowerCase().includes(filters.state.toLowerCase()) &&
      loc.country.toLowerCase().includes(filters.country.toLowerCase())
  );
  const fetchLocations = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLocations(data);
    } catch {
      toast.error("Error al cargar locaciones", { toastId: "load-error" });
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [token]);

  const handleEditClick = (location: Location) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLocation) return;
    const { name, value } = e.target;
    setSelectedLocation({ ...selectedLocation, [name]: value });
  };

  const handleUpdate = async () => {
    if (!selectedLocation) return;

    setValidatedEdit(true);

    // Validar campos requeridos
    const isInvalid =
      !selectedLocation.name.trim() ||
      !selectedLocation.city.trim() ||
      !selectedLocation.state.trim() ||
      !selectedLocation.country.trim();

    if (isInvalid) return;
    try {
      const response = await fetch(
        `http://localhost:8090/api/locations/${selectedLocation?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedLocation),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la ubicación"
        );
      }
      toast.success("Ubicación actualizada correctamente", {
        toastId: "edit-success",
      });
      setShowModal(false);
      fetchLocations();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al actualizar la ubicación", {
          toastId: "edit-error",
        });
      }
    }
  };

  const confirmDelete = (location: Location) => {
    setLocationToDelete(location);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;
    try {
      const response = await fetch(
        `http://localhost:8090/api/locations/${locationToDelete?.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Error al eliminar");
      toast.success("Ubicación eliminada correctamente", {
        toastId: "delete-success",
      });
      setShowDeleteModal(false);
      fetchLocations();
    } catch {
      setError("Error al eliminar locación");
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLocations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < filteredLocations.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        {" "}
        <Building2 size={50} strokeWidth={1} />
        {t("listlocation.title")}
      </h2>

      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Control
              placeholder="🔍 Nombre"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              list="name-options"
            />
            <datalist id="name-options">
              {[...new Set(locations.map((loc) => loc.name))].map(
                (name, index) => (
                  <option key={index} value={name} />
                )
              )}
            </datalist>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Control
              placeholder="🏙️ Ciudad"
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              list="city-options"
            />
            <datalist id="city-options">
              {[...new Set(locations.map((loc) => loc.city))].map(
                (city, index) => (
                  <option key={index} value={city} />
                )
              )}
            </datalist>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Control
              placeholder="🌆 Estado"
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
              list="state-options"
            />
            <datalist id="state-options">
              {[...new Set(locations.map((loc) => loc.state))].map(
                (state, index) => (
                  <option key={index} value={state} />
                )
              )}
            </datalist>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Control
              placeholder="🌎 País"
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              list="country-options"
            />
            <datalist id="country-options">
              {[...new Set(locations.map((loc) => loc.country))].map(
                (country, index) => (
                  <option key={index} value={country} />
                )
              )}
            </datalist>
          </Form.Group>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      <Fade cascade>
        <div className="d-none d-md-block">
          <Table striped bordered hover responsive className="shadow-sm">
            <thead>
              <tr>
                <th>{t("listlocation.id")}</th>
                <th>{t("listlocation.name")}</th>
                <th>{t("listlocation.city")}</th>
                <th>{t("listlocation.state")}</th>
                <th>{t("listlocation.country")}</th>
                <th>{t("listlocation.status")}</th>
                <th>{t("listlocation.Action")}</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.id}</td>
                  <td>{loc.name}</td>
                  <td>{loc.city}</td>
                  <td>{loc.state}</td>
                  <td>{loc.country}</td>
                  <td>
                    <Badge bg={loc.active ? "success" : "danger"}>
                      {loc.active
                        ? t("listlocation.Active")
                        : t("listlocation.Inactive")}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleEditClick(loc)}
                    >
                      {t("listlocation.edit")}
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => confirmDelete(loc)}
                    >
                      {t("listlocation.delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-center my-4">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="mx-2">{`Página ${currentPage}`}</span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage * itemsPerPage >= filteredLocations.length}
          >
            Siguiente
          </Button>
        </div>
      </Fade>
      {/* Tarjetas responsivas para pantallas pequeñas */}
      <div className="d-md-none">
        {currentItems.map((loc) => (
          <div key={loc.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary">{loc.name}</h5>
              <p className="mb-1">
                <strong>{t("listlocation.city")}</strong> {loc.city}
              </p>
              <p className="mb-1">
                <strong>{t("listlocation.state")}</strong> {loc.state}
              </p>
              <p className="mb-1">
                <strong>{t("listlocation.country")}</strong> {loc.country}
              </p>
              <p className="mb-2">
                <strong>{t("listlocation.status")}</strong>{" "}
                <Badge bg={loc.active ? "success" : "danger"}>
                  {loc.active
                    ? t("listlocation.Active")
                    : t("listlocation.Inactive")}
                </Badge>
              </p>
              <div className="d-flex justify-content-between">
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => handleEditClick(loc)}
                >
                  {t("listlocation.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => confirmDelete(loc)}
                >
                  {t("listlocation.delete")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("listlocation.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLocation && (
            <Form noValidate validated={validatedEdit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("listlocation.name")}</Form.Label>
                    <Form.Control
                      name="name"
                      value={selectedLocation.name}
                      onChange={handleFormChange}
                      required
                      isInvalid={validatedEdit && !selectedLocation.name.trim()}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("listlocation.requiredName")}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("listlocation.city")}</Form.Label>
                    <Form.Control
                      name="city"
                      value={selectedLocation.city}
                      onChange={handleFormChange}
                      required
                      isInvalid={validatedEdit && !selectedLocation.city.trim()}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("listlocation.requiredcity")}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("listlocation.state")}</Form.Label>
                    <Form.Control
                      name="state"
                      value={selectedLocation.state}
                      onChange={handleFormChange}
                      required
                      isInvalid={
                        validatedEdit && !selectedLocation.state.trim()
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("listlocation.requiredstate")}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("listlocation.country")}</Form.Label>
                    <Form.Control
                      name="country"
                      value={selectedLocation.country}
                      onChange={handleFormChange}
                      required
                      isInvalid={
                        validatedEdit && !selectedLocation.country.trim()
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("listlocation.requiredcountry")}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("listlocation.cancel")}
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            {t("listlocation.savechange")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal eliminar */}
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
              {t("warningmessage.location")}{" "}
              <strong>{locationToDelete?.name}</strong>?
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
