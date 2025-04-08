'use client';

import {
    Container, Table, Form, Button, Row, Col, Modal, Badge
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/app/context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface Assignment {
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    profileName: string;
    projectName: string;
    active: boolean;
    profileId: number;
    projectId: number;
}

interface FormValues {
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    profileId: number;
    projectId: number;
    active: boolean;
}
interface Option {
    id: number;
    name: string;
    firstName: string;
}

export default function ListAssignmentsPage() {
    const { token } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filtered, setFiltered] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit, control, reset } = useForm<FormValues>();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assigmentToDelete, setAssigmentToDelete] = useState<Assignment | null>(null);
    const [filterProfile, setFilterProfile] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [profiles, setProfiles] = useState<Option[]>([]);
    const [projects, setProjects] = useState<Option[]>([]);

    const fetchAssignments = async () => {
        const res = await fetch('http://localhost:8090/api/resource-assignments', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssignments(data);
        setFiltered(data);
    };

    useEffect(() => {
        const fetchOptions = async () => {
            const resProfiles = await fetch("http://localhost:8090/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const resProjects = await fetch("http://localhost:8090/api/projects", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfiles(await resProfiles.json());
            setProjects(await resProjects.json());
        };
        fetchOptions();
        fetchAssignments();
    }, [token]);

    // Filtros automáticos
    useEffect(() => {
        const filteredData = assignments.filter(a =>
            (!filterProfile || a.profileName.toLowerCase().includes(filterProfile.toLowerCase())) &&
            (!filterProject || a.projectName.toLowerCase().includes(filterProject.toLowerCase())) &&
            (!filterStartDate || new Date(a.startDate) >= filterStartDate) &&
            (!filterEndDate || new Date(a.endDate) <= filterEndDate)
        );
        setFiltered(filteredData);
    }, [filterProfile, filterProject, filterStartDate, filterEndDate, assignments]);

    const handleEdit = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        reset({
            status: assignment.status,
            startDate: new Date(assignment.startDate),
            endDate: new Date(assignment.endDate),
            profileId: assignment.profileId,
            projectId: assignment.projectId,
            active: assignment.active,
        });
        setShowModal(true);
    };

    const onSubmit = async (data: FormValues) => {
        if (!selectedAssignment) return;

        const payload = {
            ...data,
            startDate: data.startDate?.toISOString().split('T')[0],
            endDate: data.endDate?.toISOString().split('T')[0],
        };

        const res = await fetch(`http://localhost:8090/api/resource-assignments/${selectedAssignment.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchAssignments();
            setShowModal(false);
        }
    };
    const confirmDelete = (assigment: Assignment) => {
        setAssigmentToDelete(assigment);
        setShowDeleteModal(true);
    };


    const handleDelete = async () => {
        if (!assigmentToDelete) return;

        await fetch(`http://localhost:8090/api/resource-assignments/${assigmentToDelete.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        fetchAssignments();
        setShowDeleteModal(false);
    };

    return (
        <Container className="py-4">
            <h2 className="text-primary text-center mb-4">Asignaciones de Perfiles</h2>

            <Row className="mb-4">
                <Col md={2}>
                    <Form.Label>Perfil</Form.Label>
                    <Form.Control
                        value={filterProfile}
                        onChange={(e) => setFilterProfile(e.target.value)}
                        placeholder="Buscar por perfil"
                    />
                </Col>
                <Col md={2}>
                    <Form.Label>Proyecto</Form.Label>
                    <Form.Control
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                        placeholder="Buscar por proyecto"
                    />
                </Col>
                <Col md={2}>
                    <Form.Label>Desde</Form.Label>
                    <DatePicker
                        selected={filterStartDate}
                        onChange={(date) => setFilterStartDate(date)}
                        className="form-control"
                        placeholderText="Fecha inicio"
                    />
                </Col>
                <Col md={2}>
                    <Form.Label>Hasta</Form.Label>
                    <DatePicker
                        selected={filterEndDate}
                        onChange={(date) => setFilterEndDate(date)}
                        className="form-control"
                        placeholderText="Fecha fin"
                    />
                </Col>
            </Row>

            <div className="d-block d-md-none">
                <Row xs={1} className="g-3">
                    {filtered.map(a => (
                        <Col key={a.id}>
                            <div className="border rounded shadow-sm p-3 bg-light">
                                <h5 className="text-primary mb-2">{a.profileName}</h5>
                                <p className="mb-1"><strong>Proyecto:</strong> {a.projectName}</p>
                                <p className="mb-1"><strong>Estado:</strong> {a.status}</p>
                                <p className="mb-1"><strong>Inicio:</strong> {a.startDate}</p>
                                <p className="mb-1"><strong>Fin:</strong> {a.endDate}</p>
                                <p className="mb-1">
                                    <strong>Activo:</strong>{" "}
                                    <Badge bg={a.active ? "success" : "danger"}>
                                        {a.active ? "Sí" : "No"}
                                    </Badge>
                                </p>
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    <Button size="sm" variant="warning" onClick={() => handleEdit(a)}>Editar</Button>
                                    <Button size="sm" variant="danger" onClick={() => confirmDelete(a)}>Eliminar</Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>


            <div className="d-none d-md-block">
                <Table striped bordered hover responsive>
                    <thead className="text-center">
                        <tr>
                            <th>Perfil</th>
                            <th>Proyecto</th>
                            <th>Estado</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a.id}>
                                <td>{a.profileName}</td>
                                <td>{a.projectName}</td>
                                <td>{a.status}</td>
                                <td>{a.startDate}</td>
                                <td>{a.endDate}</td>
                                <td>
                                    <Badge bg={a.active ? 'success' : 'danger'}>
                                        {a.active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </td>
                                <td>
                                    <Button size="sm" variant="warning" onClick={() => handleEdit(a)} className="me-2">Editar</Button>
                                    <Button size="sm" variant="danger" onClick={() => confirmDelete(a)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Modal de edición */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Asignación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="mb-3">
                            <Form.Label>Perfil</Form.Label>
                            <Form.Select {...register("profileId", { required: true })}>
                                {profiles.map((p) => (
                                    <option key={p.id} value={p.id}>{p.firstName}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Proyecto</Form.Label>
                            <Form.Select {...register("projectId", { required: true })}>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select {...register('status', { required: true })}>
                                <option value="FINISHED">FINISHED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker className="form-control" selected={field.value} onChange={field.onChange} />
                                )}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Fin</Form.Label>
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker className="form-control" selected={field.value} onChange={field.onChange} />
                                )}
                            />
                        </Form.Group>
                        <div className="text-end mt-3">
                            <Button variant="primary" type="submit">Guardar Cambios</Button>
                        </div>
                    </Form>
                </Modal.Body>
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
                            ¿Estás seguro de que deseas eliminar la asignacion de  <strong>{' '}{assigmentToDelete?.profileName}</strong>{' '}
                            al proyecto  <strong>{assigmentToDelete?.projectName}</strong>?
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
