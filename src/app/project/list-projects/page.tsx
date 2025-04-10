'use client';

import {
    Container,
    Row,
    Col,
    Form,
    Table,
    Button,
    Badge,
    Modal,
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Fade } from 'react-awesome-reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';


interface Option {
    id: number;
    name: string;
    employeeId: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    clienteName: string;
    wonerName: string;
    active: boolean;
    skillName: string[];

}

interface FormValues {
    name: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    clientId: string;
    ownerId: string;
    skillIds: string[];
    active: boolean;
}

export default function ListProjectsPage() {
    const { t } = useTranslation();
    const token = localStorage.getItem('token');
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Option[]>([]);
    const [clients, setClients] = useState<Option[]>([]);
    const [owners, setOwners] = useState<Option[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [filterName, setFilterName] = useState('');
    const [filterClient, setFilterClient] = useState('');
    const [filterOwner, setFilterOwner] = useState('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [filterSkill, setFilterSkill] = useState('');

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
        watch 
    } = useForm<FormValues>();

    const fetchData = async () => {
        const headers = { Authorization: `Bearer ${token}` };
        const get = async (url: string) => fetch(url, { headers }).then((res) => res.json());

        const [skillsRes, clientsRes, ownersRes, projectsRes] = await Promise.all([
            get('http://localhost:8090/api/skills'),
            get('http://localhost:8090/api/clients'),
            get('http://localhost:8090/api/profile'),
            get('http://localhost:8090/api/projects'),
        ]);

        setSkills(skillsRes);
        setClients(clientsRes);
        setOwners(ownersRes);
        setProjects(projectsRes);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: FormValues) => {
        if (!selectedProject) return;

        const payload = {
            ...data,
            clientId: parseInt(data.clientId),
            ownerId: parseInt(data.ownerId),
            skillIds: data.skillIds.map(Number),
            startDate: data.startDate?.toISOString().split('T')[0],
            endDate: data.endDate?.toISOString().split('T')[0],
        };

        const response = await fetch(`http://localhost:8090/api/projects/${selectedProject.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),

        });


        if (response.ok) {
            fetchData();
            setShowModal(false);
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 10000);
        } else {
            alert('Error al actualizar proyecto');
        }
    };

    const openModal = (project: Project) => {
        setSelectedProject(project);
        reset({
            name: project.name,
            description: project.description,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            clientId: clients.find(c => c.name === project.clienteName)?.id.toString() || '',
            ownerId: owners.find(o => o.employeeId === project.wonerName)?.id.toString() || '',
            skillIds: skills.filter(s => project.skillName.includes(s.name)).map(s => s.id.toString()),
            active: project.active,
        });
        setShowModal(true);
    };

    const confirmDelete = (project: Project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!projectToDelete) return;

        await fetch(`http://localhost:8090/api/projects/${projectToDelete.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        fetchData();
        setShowDeleteModal(false);
    };

    return (
        <Container className="py-4">
            <h2 className="text-primary text-center mb-4">{t('ListProject.title')}</h2>
            <AnimatePresence>
                {showSuccessAnimation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.5 }}
                        className="text-center my-3"
                    >
                        <h5 className="text-success fw-bold">✅ Cambios guardados exitosamente</h5>
                    </motion.div>
                )}
            </AnimatePresence>

            <Row className="mb-4">
                <Col md={2}>
                    <Form.Label>{t('ListProject.name')}</Form.Label>
                    <Form.Control
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder={t('ListProject.filterName')}
                    />
                </Col>
                <Col md={2}>
                    <Form.Label>{t('ListProject.client')}</Form.Label>
                    <Form.Select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                        <option value="">{t('ListProject.filter')}</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Label>{t('ListProject.owner')}</Form.Label>
                    <Form.Select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
                        <option value="">{t('ListProject.filter')}</option>
                        {owners.map(o => (
                            <option key={o.id} value={o.name}>{o.employeeId}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Label>{t('ListProject.skill')}</Form.Label>
                    <Form.Select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
                        <option value="">{t('ListProject.filter')}</option>
                        {skills.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                    </Form.Select>
                </Col>


                <Col md={2}>
                    <Form.Label>{t('ListProject.starDate')}</Form.Label>
                    <DatePicker
                        selected={filterStartDate}
                        onChange={(date) => setFilterStartDate(date)}
                        className="form-control"
                        placeholderText={t('ListProject.starDate')}
                    />
                </Col>
                <Col md={2}>
                    <Form.Label>{t('ListProject.EndDate')}</Form.Label>
                    <DatePicker
                        selected={filterEndDate}
                        onChange={(date) => setFilterEndDate(date)}
                        className="form-control"
                        placeholderText={t('ListProject.EndDate')}
                    />
                </Col>
            </Row>
            {/* Vista en tarjetas */}
            <Row className="d-md-none">
                {projects
                    .filter(p =>
                        (!filterName || p.name.toLowerCase().includes(filterName.toLowerCase())) &&
                        (!filterClient || p.clienteName === filterClient) &&
                        (!filterOwner || p.wonerName === filterOwner) &&
                        (!filterSkill || p.skillName.includes(filterSkill)) &&
                        (!filterStartDate || new Date(p.startDate) >= filterStartDate) &&
                        (!filterEndDate || new Date(p.endDate) <= filterEndDate)
                    )
                    .map(proj => (
                        <Col key={proj.id} md={4}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="shadow-sm border rounded p-3 h-100"
                            >
                                <h5 className="text-primary">{proj.name}</h5>
                                <p className="mb-1"><strong>{t('ListProject.client')}</strong> {proj.clienteName}</p>
                                <p className="mb-1"><strong>{t('ListProject.owner')}</strong> {proj.wonerName}</p>
                                <p className="mb-1"><strong>{t('ListProject.starDate')}</strong> {proj.startDate}</p>
                                <p className="mb-1"><strong>{t('ListProject.EndDate')}</strong> {proj.endDate}</p>
                                <p className="mb-1"><strong>{t('ListProject.status')}</strong>{' '}
                                    <Badge bg={proj.active ? 'success' : 'danger'}>
                                        {proj.active ? t('ListProject.Active') : t('ListProject.Inactive')}
                                    </Badge>
                                </p>
                                <p className="mb-2"><strong>{t('ListProject.skill')}:</strong> {proj.skillName.join(', ')}</p>
                                <div className="d-flex justify-content-end">
                                    <Button size="sm" variant="warning" className="me-2" onClick={() => openModal(proj)}>
                                        {t('ListProject.edit')}
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => confirmDelete(proj)}>
                                        {t('ListProject.delete')}
                                    </Button>
                                </div>
                            </motion.div>
                        </Col>
                    ))}
            </Row>

            <Fade cascade>
                <div className="d-none d-md-block">
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="text-center">
                            <tr>
                                <th>{t('ListProject.name')}</th>
                                <th>{t('ListProject.client')}</th>
                                <th>{t('ListProject.owner')}</th>
                                <th>{t('ListProject.starDate')}</th>
                                <th>{t('ListProject.EndDate')}</th>
                                <th>{t('ListProject.status')}</th>
                                <th>{t('ListProject.skill')}</th>
                                <th>{t('ListProject.Action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects
                                .filter(p =>
                                    (!filterName || p.name.toLowerCase().includes(filterName.toLowerCase())) &&
                                    (!filterClient || p.clienteName === filterClient) &&
                                    (!filterOwner || p.wonerName === filterOwner) &&
                                    (!filterSkill || p.skillName.includes(filterSkill)) &&
                                    (!filterStartDate || new Date(p.startDate) >= filterStartDate) &&
                                    (!filterEndDate || new Date(p.endDate) <= filterEndDate)
                                )
                                .map((proj) => (
                                    <tr key={proj.id}>
                                        <td>{proj.name}</td>
                                        <td>{proj.clienteName}</td>
                                        <td>{proj.wonerName}</td>
                                        <td>{proj.startDate}</td>
                                        <td>{proj.endDate}</td>
                                        <td>
                                            <Badge bg={proj.active ? 'success' : 'danger'}>
                                                {proj.active ? t("ListProject.Active") : t("ListProject.Inactive")}
                                            </Badge>
                                        </td>
                                        <td>{proj.skillName.join(', ')}</td>
                                        <td>
                                            <Button size="sm" variant="warning" className="me-2" onClick={() => openModal(proj)}>
                                                {t("ListProject.edit")}
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => confirmDelete(proj)}>
                                                {t("ListProject.delete")}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </div>
            </Fade>

            {/* MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{t("Project.editTitle")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('ListProject.name')}</Form.Label>
                                    <Form.Control {...register('name', { required: t("Project.requiredName") })} isInvalid={!!errors.name} />
                                    <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t("Project.description")}</Form.Label>
                                    <Form.Control {...register('description', { required: t("Project.requiredDescription") })} isInvalid={!!errors.description} />
                                    <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('ListProject.starDate')}</Form.Label>
                                    <Controller
                                        control={control}
                                        name="startDate"
                                        rules={{ required: t("Project.requiredStartDate") }}
                                        render={({ field }) => (
                                            <DatePicker
                                                className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                                                selected={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    {errors.startDate && <div className="text-danger">{errors.startDate.message as string}</div>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('ListProject.EndDate')}</Form.Label>
                                    <Controller
                                        control={control}
                                        name="endDate"
                                        rules={{
                                            required: t("Project.requiredEndDate"),
                                            validate: (end) =>
                                                !watch("startDate") || !end || end >= watch("startDate") || t("Project.invalidDateRange"),
                                        }}
                                        render={({ field }) => (
                                            <DatePicker
                                                className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                                                selected={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    {errors.endDate && <div className="text-danger">{errors.endDate.message as string}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('ListProject.client')}</Form.Label>
                                    <Form.Select {...register('clientId', { required: t("Project.requiredClient") })} isInvalid={!!errors.clientId}>
                                        <option value="">{t("Project.clientSelect")}</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.clientId?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>{t('ListProject.owner')}</Form.Label>
                                    <Form.Select {...register('ownerId', { required: t("Project.requiredOwner") })} isInvalid={!!errors.ownerId}>
                                        <option value="">{t("Project.ownerSelect")}</option>
                                        {owners.map(o => <option key={o.id} value={o.id}>{o.employeeId}</option>)}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.ownerId?.message}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('ListProject.skill')}</Form.Label>
                                    <Form.Select
                                        multiple
                                        {...register('skillIds', {
                                            validate: (value) => value.length > 0 || t("Project.requiredSkill"),
                                        })}
                                        isInvalid={!!errors.skillIds}
                                    >
                                        {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{errors.skillIds?.message as string}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-end">
                            <Button type="submit" variant="primary">{t("Project.savechange")}</Button>
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
                        <Modal.Title>{t("warningmessage.title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <p className="mb-3">
                            {t("warningmessage.Project")} <strong>{projectToDelete?.name}</strong>?
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
