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
import { User } from "lucide-react";
import { toast } from 'react-toastify';


interface Profile {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    resumePath: string;
    availabilityStatusId: string;
    experienceLevelId: string;
    locationId: string;
    userId: string;
    skillIds: string[];
    active: boolean;
    locationName?: string;
    experience?: string;
    statusName?: string;
    userName?: string;
    skillName?: string[];
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
    const [validated, setValidated] = useState(false);
    const { roles } = useAuth();

    const hasRole = (allowedRoles: string[]) => {
        return allowedRoles.some(role => roles.includes(role));
      };
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

      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 6;
    

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
            filtered = filtered.filter(p =>
                p.employeeId.toLowerCase().includes(filters.employeeId.toLowerCase())
            );

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
        // Buscar los IDs reales según los nombres actuales
        const location = locations.find(loc => loc.name === profile.locationName);
        const experience = experiences.find(exp => exp.name === profile.experience);
        const availability = statuses.find(stat => stat.name === profile.statusName);
        const skillsIds = profile.skillName.map(name => {
            const skill = skills.find(s => s.name === name);
            return skill ? String(skill.id) : "";
        }).filter(id => id !== "");

        setSelectedProfile({
            ...profile,
            locationId: location ? String(location.id) : "",
            experienceLevelId: experience ? String(experience.id) : "",
            availabilityStatusId: availability ? String(availability.id) : "",
            skillIds: skillsIds,
        });

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedProfile(null);
        setShowModal(false);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!selectedProfile) return;
        const { name, value, multiple, selectedOptions } = e.target;

        if (multiple) {
            const values = Array.from(selectedOptions).map((opt) => opt.value);
            setSelectedProfile((prev) => prev && { ...prev, [name]: values });
        } else {
            setSelectedProfile((prev) => prev && { ...prev, [name]: value });
        }
    };



    const handleUpdateSubmit = async () => {
        if (!selectedProfile) return;
        const fieldsToValidate = [
            "firstName",
            "lastName",
            "jobTitle",
            "locationId",
            "experienceLevelId",
            "availabilityStatusId"
        ];

        const hasErrors = fieldsToValidate.some(field =>
            !selectedProfile[field as keyof Profile]?.toString().trim()
        );
        const hasSkillError = !selectedProfile.skillIds || selectedProfile.skillIds.length === 0;

        setValidated(true);

        if (hasErrors || hasSkillError) return;

        try {
            const formData = new FormData();

            const profileData = {
                employeeId: selectedProfile.employeeId,
                firstName: selectedProfile.firstName,
                lastName: selectedProfile.lastName,
                jobTitle: selectedProfile.jobTitle,
                locationId: Number(selectedProfile.locationId),
                experienceLevelId: Number(selectedProfile.experienceLevelId),
                availabilityStatusId: Number(selectedProfile.availabilityStatusId),
                userId: 1,
                skillIds: selectedProfile.skillIds.map(id => Number(id)),
                active: true
            };

            formData.append(
                "profile",
                new Blob([JSON.stringify(profileData)], { type: "application/json" })
            );

            const response = await fetch(`http://localhost:8090/api/profile/${selectedProfile.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al actualizar el perfil");
            }
            toast.success("Perfil actualizado correctamente", { toastId: 'profile-updated' });
            setShowModal(false);
            fetchProfiles(); // recargar tabla
        } catch (error: any) {
            toast.error(error.message || "Ocurrió un error al actualizar.", { toastId: 'profile-update-error' });

        }
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

            toast.success("Perfil eliminado correctamente", { toastId: 'profile-deleted' });
            await fetchProfiles(); // Recargar estado tras eliminar
            setShowDeleteModal(false);
        } catch (err) {
           toast.error("Error al eliminar el perfil", { toastId: 'profile-delete-error' });

        }
    };
    console.log(locationOptions)

    const totalPages=Math.ceil(filteredProfiles.length/itemsPerPage);
    const startIndex = (currentPage -1)*itemsPerPage;
    const endIndex = startIndex+itemsPerPage;
    const currentProfiles= filteredProfiles.slice(startIndex, endIndex)

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < filteredProfiles.length) {
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
            <h2 className="text-primary mb-4"> <User size={40} />{t('list.title')}</h2>

            {/* Filtros */}
            <Row className="mb-4">
                <Col md={2}>
                    <Form.Control
                        placeholder={t('list.FilterId')}
                        name="employeeId"
                        onChange={handleFilterChange}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        placeholder={t('list.FilterName')}
                        name="name"
                        onChange={handleFilterChange}
                    />
                </Col>
                <Col md={2}>
                    <Form.Select name="availability" onChange={handleFilterChange}>
                        <option value="">{t('list.FilterAvailability')}</option>
                        {availabilityOptions.map(opt => (
                            <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select name="location" onChange={handleFilterChange}>
                        <option value="">{t('list.FilterLocation')}</option>
                        {locationOptions.map(opt => (
                            <option key={opt.id} value={opt.city}>{opt.city}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Select name="skill" onChange={handleFilterChange}>
                        <option value="">{t('list.FilterSkill')}</option>
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
                        {currentProfiles.map((profile, index) => (
                            <div key={index} className="card mb-3 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {profile.firstName} {profile.lastName}
                                    </h5>
                                    <p className="mb-1"><strong>{t("list.Id")}</strong> {profile.employeeId}</p>
                                    <p className="mb-1"><strong>{t("list.Position")}</strong> {profile.jobTitle}</p>
                                    <p className="mb-1"><strong>{t("list.location")}</strong> {profile.locationName}</p>
                                    <p className="mb-1"><strong>{t("list.ExperienceLevel")}</strong> {profile.experience}</p>
                                    <p className="mb-1"><strong>{t("list.availability")}</strong> {profile.statusName}</p>
                                    <p className="mb-1"><strong>{t("list.UserId")}</strong> {profile.userName}</p>
                                    <p className="mb-1"><strong>{t("list.Skills")}</strong>{" "}
                                        {profile.skillName.map((skill, i) => (
                                            <Badge key={i} bg="info" className="me-1">{skill}</Badge>
                                        ))}
                                    </p>
                                    <p className="mb-2">
                                        <strong>{t("list.status")}</strong>{" "}
                                        {profile.active ? (
                                            <Badge bg="success">{t("list.Active")}</Badge>
                                        ) : (
                                            <Badge bg="danger">{t("list.Inactive")}</Badge>
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
                                            {t("list.download")}
                                        </Button>
                                        {hasRole(['ROLE_ADMINS']) && (
                                        <Button size="sm" variant="warning" onClick={() => handleEditClick(profile)}>{t("list.EditProfile")}</Button>
                                    )}
                                    {hasRole(['ROLE_ADMINS']) && (
                                        <Button size="sm" variant="danger" onClick={() => confirmDelete(profile)}>{t("list.delete")}</Button>
                                    )}
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
                                    {hasRole(['ROLE_ADMINS']) && (
                                    <th>{t("list.edit")}</th>
                                )}
                                    {hasRole(['ROLE_ADMINS']) && (
                                    <th>{t("list.delete")}</th>
                                )}
                                </tr>
                            </thead>
                            <tbody>
                                {currentProfiles.map((profile, index) => (
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
                                        {hasRole(['ROLE_ADMINS']) && (
                                            <Button size="sm" variant="warning" onClick={() => handleEditClick(profile)}>
                                                {t("list.EditProfile")}
                                            </Button>
                                             )}
                                        </td>
                                        <td>
                                        {hasRole(['ROLE_ADMINS']) && (
                                            <Button size="sm" variant="danger" onClick={() => confirmDelete(profile)}>
                                                {t("list.delete")}
                                            </Button>
                                        )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </>
            )}
                    <div className="d-flex justify-content-center my-4">
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="mx-2">{`Página ${currentPage}`}</span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage * itemsPerPage >= filteredProfiles.length}
          >
            Siguiente
          </Button>
        </div>

            <Modal show={showModal} onHide={handleCloseModal} centered  >
                <Modal.Header closeButton><Modal.Title>{t("list.EditProfile")}</Modal.Title></Modal.Header>
                <Modal.Body >
                    {selectedProfile && (
                        <Form noValidate validated={validated}>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.Name")}</Form.Label>
                                <Form.Control name="firstName" value={selectedProfile.firstName} onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.firstName.trim()}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredName")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.LastName")}</Form.Label>
                                <Form.Control name="lastName" value={selectedProfile.lastName} onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.lastName.trim()} />
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredLastName")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.Position")}</Form.Label>
                                <Form.Control name="jobTitle" value={selectedProfile.jobTitle} onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.jobTitle.trim()} />
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredPosition")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.location")}</Form.Label>
                                <Form.Select
                                    name="locationId"
                                    value={selectedProfile.locationId}
                                    onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.locationId}
                                >
                                    <option value="">--</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredLocation")}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.ExperienceLevel")}</Form.Label>
                                <Form.Select
                                    name="experienceLevelId"
                                    value={selectedProfile.experienceLevelId}
                                    onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.experienceLevelId}
                                >
                                    <option value="">--</option>
                                    {experiences.map(exp => (
                                        <option key={exp.id} value={exp.id}>{exp.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredExperience")}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.availability")}</Form.Label>
                                <Form.Select
                                    name="availabilityStatusId"
                                    value={selectedProfile.availabilityStatusId}
                                    onChange={handleFormChange}
                                    required
                                    isInvalid={validated && !selectedProfile.availabilityStatusId}
                                >
                                    <option value="">--</option>
                                    {statuses.map(stat => (
                                        <option key={stat.id} value={stat.id}>{stat.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredAvailability")}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>{t("profile.Skills")}</Form.Label>
                                <Form.Select
                                    multiple
                                    name="skillIds"
                                    value={selectedProfile.skillIds}
                                    onChange={handleFormChange}
                                    required
                                    isInvalid={validated && selectedProfile.skillIds.length === 0}
                                >
                                    {skills.map(skill => (
                                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {t("profile.requiredSkills")}
                                </Form.Control.Feedback>
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>{t("list.cancel")}</Button>
                    <Button variant="primary" onClick={handleUpdateSubmit}>{t("list.savechange")}</Button>
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
                        <Modal.Title>{t("warningmessage.title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <p className="mb-3">
                            {t("warningmessage.user")} <strong>{profileToDelete?.employeeId}</strong>?
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