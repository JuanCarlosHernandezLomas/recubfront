"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
    Table,
    Container,
    Spinner,
    Alert,
    Badge,
    Form,
    Row,
    Col,
    Button,
    Modal,
} from "react-bootstrap";

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from "@/app/context/useAuth";


interface Profile {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    resumePath: string;
    statusName: string;
    experience: string;
    locationName: string;
    userName: string;
    skillName: string[];
    active: boolean;
}

interface Option {
    id: number;
    name: string;
    city: string;
}

export default function ViewProfilesPage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //modal
    const [showModal, setShowModal] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

    const [locations, setLocations] = useState<Option[]>([]);
    const [experiences, setExperiences] = useState<Option[]>([]);
    const [statuses, setStatuses] = useState<Option[]>([]);
    const [skills, setSkills] = useState<Option[]>([]);


    // Filtros
    const [availabilityOptions, setAvailabilityOptions] = useState<Option[]>([]);
    const [locationOptions, setLocationOptions] = useState<Option[]>([]);
    const [skillOptions, setSkillOptions] = useState<Option[]>([]);


    const [filters, setFilters] = useState({
        availability: "",
        location: "",
        skill: "",
        employeeId: "",
        name: "",
    });

    const fetchData = async (endpoint: string, setter: (data: Option[]) => void) => {
        try {
            const res = await fetch(`http://localhost:8090${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setter(data);
        } catch (err) {
            console.error("Error loading options", err);
        }
    };

    useEffect(() => {
        fetchData("/api/availability-status", setAvailabilityOptions);
        fetchData("/api/locations", setLocationOptions);
        fetchData("/api/skills", setSkillOptions);
    }, [token]);


    const fetchProfiles = async () => {
        try {
            const res = await fetch("http://localhost:8090/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("No se pudo cargar la información");

            const data = await res.json();
            setProfiles(data);
            setFilteredProfiles(data);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDatas = async () => {
        try {
            const endpoints = [
                { url: "/api/profile", setter: setProfiles },
                { url: "/api/locations", setter: setLocations },
                { url: "/api/experience-level", setter: setExperiences },
                { url: "/api/availability-status", setter: setStatuses },
                { url: "/api/skills", setter: setSkills },
            ];

            for (const { url, setter } of endpoints) {
                const res = await fetch(`http://localhost:8090${url}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setter(data);
            }
        } catch (err: any) {
            setError("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDatas();

        fetchProfiles();
    }, [token]);

    useEffect(() => {
        let filtered = profiles;

        if (filters.availability)
            filtered = filtered.filter(p => p.statusName === filters.availability);

        if (filters.location)
            filtered = filtered.filter(p => p.locationName === filters.location);

        if (filters.skill)
            filtered = filtered.filter(p => p.skillName.includes(filters.skill));

        if (filters.employeeId)
            filtered = filtered.filter(p => p.employeeId.includes(filters.employeeId));

        if (filters.name)
            filtered = filtered.filter(p =>
                (p.firstName + " " + p.lastName).toLowerCase().includes(filters.name.toLowerCase())
            );

        setFilteredProfiles(filtered);
    }, [filters, profiles]);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const handleEditClick = (profile: Profile) => {
        setSelectedProfile(profile);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedProfile(null);
        setShowModal(false);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!selectedProfile) return;
        const { name, value } = e.target;
        setSelectedProfile((prev) => prev && { ...prev, [name]: value });
    };

    const handleUpdateSubmit = () => {
        console.log("Guardar perfil:", selectedProfile);
        setShowModal(false);
    };

    const confirmDelete = (profile: Profile) => {
        setProfileToDelete(profile);
        setShowDeleteModal(true);
    };




    const handleDelete = async (id: number) => {

        if (!profileToDelete) return;

        try {
            const res = await fetch(`http://localhost:8090/api/profile/${profileToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al eliminar");

            await fetchProfiles(); // Recargar estado tras eliminar
            setShowDeleteModal(false);
        } catch (err) {
            alert("Error al eliminar el perfil");
        }
    };
    console.log(locationOptions)
    return (
        <Container className="py-4">
            <h2 className="text-primary mb-4">{t('list.title')}</h2>

            {/* Filtros */}
            <Row className="mb-4">
                <Col md={2}>
                    <Form.Control
                        placeholder="ID Empleado"
                        name="employeeId"
                        onChange={handleFilterChange}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        placeholder="Nombre"
                        name="name"
                        onChange={handleFilterChange}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select name="availability" onChange={handleFilterChange}>
                        <option value="">Disponibilidad</option>
                        {availabilityOptions.map(opt => (
                            <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select name="location" onChange={handleFilterChange}>
                        <option value="">Ubicación</option>
                        {locationOptions.map(opt => (
                            <option key={opt.id} value={opt.city}>{opt.city}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select name="skill" onChange={handleFilterChange}>
                        <option value="">Habilidad</option>
                        {skillOptions.map(opt => (
                            <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {/* Tabla */}
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
                <>
                    {/* Tarjetas para pantallas pequeñas */}
                    <div className="d-md-none">
                        {filteredProfiles.map((profile, index) => (
                            <div key={index} className="card mb-3 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {profile.firstName} {profile.lastName}
                                    </h5>
                                    <p className="mb-1"><strong>ID:</strong> {profile.employeeId}</p>
                                    <p className="mb-1"><strong>Puesto:</strong> {profile.jobTitle}</p>
                                    <p className="mb-1"><strong>Ubicación:</strong> {profile.locationName}</p>
                                    <p className="mb-1"><strong>Experiencia:</strong> {profile.experience}</p>
                                    <p className="mb-1"><strong>Disponibilidad:</strong> {profile.statusName}</p>
                                    <p className="mb-1"><strong>Usuario:</strong> {profile.userName}</p>
                                    <p className="mb-1"><strong>Skills:</strong>{" "}
                                        {profile.skillName.map((skill, i) => (
                                            <Badge key={i} bg="info" className="me-1">{skill}</Badge>
                                        ))}
                                    </p>
                                    <p className="mb-2">
                                        <strong>Estado:</strong>{" "}
                                        {profile.active ? (
                                            <Badge bg="success">Activo</Badge>
                                        ) : (
                                            <Badge bg="danger">Inactivo</Badge>
                                        )}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={async () => {
                                                const res = await fetch(`http://localhost:8090/api/profile/download-resume/${profile.id}`, {
                                                    headers: { Authorization: `Bearer ${token}` },
                                                });
                                                const blob = await res.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement("a");
                                                link.href = url;
                                                link.download = `CV_${profile.employeeId}.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            Descargar CV
                                        </Button>
                                        <Button size="sm" variant="warning" onClick={() => handleEditClick(profile)}>Editar</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(profile.id)}>{t("list.delete")}</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabla para pantallas grandes */}
                    <div className="d-none d-md-block">
                        <Table striped bordered hover responsive className="shadow-sm">
                            <thead>
                                <tr className="text-center">
                                    <th>{t("list.Id")}</th>
                                    <th>{t("list.Name")}</th>
                                    <th>{t("list.Position")}</th>
                                    <th>{t("list.location")}</th>
                                    <th>{t("list.ExperienceLevel")}</th>
                                    <th>{t("list.availability")}</th>
                                    <th>{t("list.UserId")}</th>
                                    <th>{t("list.Skills")}</th>
                                    <th>{t("list.CV")}</th>
                                    <th>{t("list.status")}</th>
                                    <th>{t("list.edit")}</th>
                                    <th>{t("list.delete")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProfiles.map((profile, index) => (
                                    <tr key={index}>
                                        <td>{profile.employeeId}</td>
                                        <td>{profile.firstName} {profile.lastName}</td>
                                        <td>{profile.jobTitle}</td>
                                        <td>{profile.locationName}</td>
                                        <td>{profile.experience}</td>
                                        <td>{profile.statusName}</td>
                                        <td>{profile.userName}</td>
                                        <td>
                                            {profile.skillName.map((skill, i) => (
                                                <Badge key={i} bg="info" className="me-1">{skill}</Badge>
                                            ))}
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={async () => {
                                                    const res = await fetch(`http://localhost:8090/api/profile/download-resume/${profile.id}`, {
                                                        headers: { Authorization: `Bearer ${token}` },
                                                    });
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement("a");
                                                    link.href = url;
                                                    link.download = `CV_${profile.employeeId}.pdf`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                {t("list.download")}
                                            </Button>
                                        </td>
                                        <td>
                                            {profile.active ? (
                                                <Badge bg="success">{t("list.Active")}</Badge>
                                            ) : (
                                                <Badge bg="danger">{t("list.Inactive")}</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Button size="sm" variant="warning" onClick={() => handleEditClick(profile)}>
                                                {t("list.edit")}
                                            </Button>
                                        </td>
                                        <td>
                                            <Button size="sm" variant="danger" onClick={() => confirmDelete(profile)}>
                                                {t("list.delete")}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}
            <Modal show={showModal} onHide={handleCloseModal} centered  >
                <Modal.Header closeButton><Modal.Title>Editar Perfil</Modal.Title></Modal.Header>
                <Modal.Body >
                    {selectedProfile && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control name="firstName" value={selectedProfile.firstName} onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control name="lastName" value={selectedProfile.lastName} onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Puesto</Form.Label>
                                <Form.Control name="jobTitle" value={selectedProfile.jobTitle} onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Ubicación</Form.Label>
                                <Form.Select name="locationName" value={selectedProfile.locationName} onChange={handleFormChange}>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Experiencia</Form.Label>
                                <Form.Select name="experience" value={selectedProfile.experience} onChange={handleFormChange}>
                                    {experiences.map(exp => (
                                        <option key={exp.id} value={exp.name}>{exp.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Disponibilidad</Form.Label>
                                <Form.Select name="statusName" value={selectedProfile.statusName} onChange={handleFormChange}>
                                    {statuses.map(stat => (
                                        <option key={stat.id} value={stat.name}>{stat.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Skills</Form.Label>
                                <Form.Select multiple name="skillName" value={selectedProfile.skillName} onChange={handleFormChange}>
                                    {skills.map(skill => (
                                        <option key={skill.id} value={skill.name}>{skill.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleUpdateSubmit}>Guardar Cambios</Button>
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
                            ¿Estás seguro de que deseas eliminar al usuario <strong>{profileToDelete?.employeeId}</strong>?
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