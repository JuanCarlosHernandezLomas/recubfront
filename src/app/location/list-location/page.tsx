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
import { Fade } from 'react-awesome-reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState("");
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);


    const fetchLocations = async () => {
        try {
            const res = await fetch("http://localhost:8090/api/locations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setLocations(data);
        } catch (error) {
            setError("Error al cargar locaciones");
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [token]);

    const handleEditClick = (location: Location) => {
        setSelectedLocation(location);
        setShowModal(true);
    };

    const handleDeleteClick = (location: Location) => {
        setSelectedLocation(location);
        setShowDeleteModal(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedLocation) return;
        const { name, value } = e.target;
        setSelectedLocation({ ...selectedLocation, [name]: value });
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8090/api/locations/${selectedLocation?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(selectedLocation),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar la ubicación');
            }
            setShowModal(false);
            fetchLocations();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message || 'Error al actualizar la ubicación.');

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
            const response = await fetch(`http://localhost:8090/api/locations/${selectedLocation?.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Error al eliminar");
            setShowDeleteModal(false);
            fetchLocations();
        } catch {
            setError("Error al eliminar locación");
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Listado de Locaciones</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            <Fade cascade>
                <div className="d-none d-md-block">
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Ciudad</th>
                                <th>Estado</th>
                                <th>País</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc) => (
                                <tr key={loc.id}>
                                    <td>{loc.id}</td>
                                    <td>{loc.name}</td>
                                    <td>{loc.city}</td>
                                    <td>{loc.state}</td>
                                    <td>{loc.country}</td>
                                    <td>
                                        <Badge bg={loc.active ? 'success' : 'danger'}>
                                            {loc.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button size="sm" variant="warning" onClick={() => handleEditClick(loc)}>
                                            Editar
                                        </Button>{" "}
                                        <Button size="sm" variant="danger" onClick={() => confirmDelete(loc)}>
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Fade>
            {/* Tarjetas responsivas para pantallas pequeñas */}
            <div className="d-md-none">
                {locations.map((loc) => (
                    <div key={loc.id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-primary">{loc.name}</h5>
                            <p className="mb-1"><strong>Ciudad:</strong> {loc.city}</p>
                            <p className="mb-1"><strong>Estado:</strong> {loc.state}</p>
                            <p className="mb-1"><strong>País:</strong> {loc.country}</p>
                            <p className="mb-2"><strong>Estado:</strong>{' '}
                                <Badge bg={loc.active ? 'success' : 'danger'}>
                                    {loc.active ? "Activo" : "Inactivo"}
                                </Badge>
                            </p>
                            <div className="d-flex justify-content-between">
                                <Button size="sm" variant="warning" onClick={() => handleEditClick(loc)}>Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => confirmDelete(loc)}>Eliminar</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Locación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLocation && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control
                                            name="name"
                                            value={selectedLocation.name}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control
                                            name="city"
                                            value={selectedLocation.city}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estado</Form.Label>
                                        <Form.Control
                                            name="state"
                                            value={selectedLocation.state}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>País</Form.Label>
                                        <Form.Control
                                            name="country"
                                            value={selectedLocation.country}
                                            onChange={handleFormChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleUpdate}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal eliminar */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
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
                            {t("warningmessage.user")} <strong>{locationToDelete?.name}</strong>?
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
