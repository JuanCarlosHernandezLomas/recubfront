"use client";

import {
  Container,
  Table,
  Form,
  Button,
  Row,
  Col,
  Modal,
  Badge,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/app/context/useAuth";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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
  const { t } = useTranslation();
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filtered, setFiltered] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assigmentToDelete, setAssigmentToDelete] = useState<Assignment | null>(
    null
  );
  const [filterProfile, setFilterProfile] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [profiles, setProfiles] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const fetchAssignments = async () => {
    const res = await fetch("http://localhost:8090/api/resource-assignments", {
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
    const filteredData = assignments.filter(
      (a) =>
        (!filterProfile ||
          a.profileName.toLowerCase().includes(filterProfile.toLowerCase())) &&
        (!filterProject ||
          a.projectName.toLowerCase().includes(filterProject.toLowerCase())) &&
        (!filterStartDate || new Date(a.startDate) >= filterStartDate) &&
        (!filterEndDate || new Date(a.endDate) <= filterEndDate)
    );
    setFiltered(filteredData);
  }, [
    filterProfile,
    filterProject,
    filterStartDate,
    filterEndDate,
    assignments,
  ]);

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
      startDate: data.startDate?.toISOString().split("T")[0],
      endDate: data.endDate?.toISOString().split("T")[0],
    };

    const res = await fetch(
      `http://localhost:8090/api/resource-assignments/${selectedAssignment.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      fetchAssignments();
      setShowModal(false);
      toast.success(t("AssignProfiletoProjectList.updateSuccess"), {
        toastId: "update-success",
      });
    } else {
      toast.error(t("AssignProfiletoProjectList.updateError"), {
        toastId: "update-error",
      });
    }
  };
  const confirmDelete = (assigment: Assignment) => {
    setAssigmentToDelete(assigment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!assigmentToDelete) return;
    try {
      await fetch(
        `http://localhost:8090/api/resource-assignments/${assigmentToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchAssignments();
      setShowDeleteModal(false);
      toast.success(t("AssignProfiletoProjectList.deleteSuccess"), {
        toastId: "delete-success",
      });
    } catch {
      toast.error(t("AssignProfiletoProjectList.deleteError"), {
        toastId: "delete-error",
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < filtered.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  return (
    <Container className="py-4">
      <h2 className="text-primary text-center mb-4">
        {t("AssignProfiletoProjectList.title")}
      </h2>

      <Row className="mb-4">
        <Col md={2}>
          <Form.Label>{t("AssignProfiletoProjectList.profile")}</Form.Label>
          <Form.Control
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value)}
            placeholder={t("AssignProfiletoProjectList.filterProfile")}
          />
        </Col>
        <Col md={2}>
          <Form.Label>{t("AssignProfiletoProjectList.project")}</Form.Label>
          <Form.Control
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            placeholder={t("AssignProfiletoProjectList.filterProject")}
          />
        </Col>
        <Col md={2}>
          <Form.Label>{t("AssignProfiletoProjectList.starDate")}</Form.Label>
          <DatePicker
            selected={filterStartDate}
            onChange={(date) => setFilterStartDate(date)}
            className="form-control"
            placeholderText={t("AssignProfiletoProjectList.starDate")}
          />
        </Col>
        <Col md={2}>
          <Form.Label>{t("AssignProfiletoProjectList.EndDate")}</Form.Label>
          <DatePicker
            selected={filterEndDate}
            onChange={(date) => setFilterEndDate(date)}
            className="form-control"
            placeholderText={t("AssignProfiletoProjectList.EndDate")}
          />
        </Col>
      </Row>

      <div className="d-block d-md-none">
        <Row xs={1} className="g-3">
          {currentItems.map((a) => (
            <Col key={a.id}>
              <div className="border rounded shadow-sm p-3 bg-light">
                <h5 className="text-primary mb-2">{a.profileName}</h5>
                <p className="mb-1">
                  <strong>{t("AssignProfiletoProjectList.project")}</strong>{" "}
                  {a.projectName}
                </p>
                <p className="mb-1">
                  <strong>{t("AssignProfiletoProjectList.statusPro")}</strong>{" "}
                  {a.status}
                </p>
                <p className="mb-1">
                  <strong>{t("AssignProfiletoProjectList.starDate")}</strong>{" "}
                  {a.startDate}
                </p>
                <p className="mb-1">
                  <strong>{t("AssignProfiletoProjectList.EndDate")}</strong>{" "}
                  {a.endDate}
                </p>
                <p className="mb-1">
                  <strong>{t("AssignProfiletoProjectList.status")}</strong>{" "}
                  <Badge bg={a.active ? "success" : "danger"}>
                    {a.active
                      ? t("AssignProfiletoProjectList.Active")
                      : t("AssignProfiletoProjectList.Inactive")}
                  </Badge>
                </p>
                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleEdit(a)}
                  >
                    {t("AssignProfiletoProjectList.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => confirmDelete(a)}
                  >
                    {t("AssignProfiletoProjectList.delete")}
                  </Button>
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
              <th>{t("AssignProfiletoProjectList.profile")}</th>
              <th>{t("AssignProfiletoProjectList.project")}</th>
              <th>{t("AssignProfiletoProjectList.statusPro")}</th>
              <th>{t("AssignProfiletoProjectList.starDate")}</th>
              <th>{t("AssignProfiletoProjectList.EndDate")}</th>
              <th>{t("AssignProfiletoProjectList.status")}</th>
              <th>{t("AssignProfiletoProjectList.Action")}</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((a) => (
              <tr key={a.id}>
                <td>{a.profileName}</td>
                <td>{a.projectName}</td>
                <td>{a.status}</td>
                <td>{a.startDate}</td>
                <td>{a.endDate}</td>
                <td>
                  <Badge bg={a.active ? "success" : "danger"}>
                    {a.active
                      ? t("AssignProfiletoProjectList.Active")
                      : t("AssignProfiletoProjectList.Inactive")}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleEdit(a)}
                    className="me-2"
                  >
                    {t("AssignProfiletoProjectList.edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => confirmDelete(a)}
                  >
                    {t("AssignProfiletoProjectList.delete")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-center align-items-center my-4 gap-2">
        <Button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          variant="outline-secondary"
        >
          ⏮ {t("pagination.first")}
        </Button>

        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant="secondary"
        >
          ⬅ {t("pagination.prev")}
        </Button>

        <span className="fw-bold text-primary">
          {t("pagination.page")} {currentPage}
        </span>

        {currentPage < totalPages && (
          <Button
            onClick={handleNextPage}
            variant="secondary"
          >
            {t("pagination.next")} ➡
          </Button>
        )}
      </div>


      {/* Modal de edición */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("AssignProfiletoProjectList.editTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>{t("AssignProfiletoProjectList.profile")}</Form.Label>
              <Form.Select
                {...register("profileId", {
                  required: t("AssignProfiletoProject.requiredProfile"),
                })}
                isInvalid={!!errors.profileId}
              >
                <option value="">
                  {t("AssignProfiletoProject.selectProfile")}
                </option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.profileId?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("AssignProfiletoProjectList.project")}</Form.Label>
              <Form.Select
                {...register("projectId", {
                  required: t("AssignProfiletoProject.requiredProject"),
                })}
                isInvalid={!!errors.projectId}
              >
                <option value="">
                  {t("AssignProfiletoProject.selectProject")}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.projectId?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("AssignProfiletoProjectList.statusPro")}
              </Form.Label>
              <Form.Select
                {...register("status", {
                  required: t("AssignProfiletoProjectList.requiredStatus"),
                })}
                isInvalid={!!errors.status}
              >
                <option value="">
                  {t("AssignProfiletoProject.selecStatus")}
                </option>
                <option value="FINISHED">FINISHED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.status?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("AssignProfiletoProjectList.starDate")}
              </Form.Label>
              <Controller
                name="startDate"
                control={control}
                rules={{
                  required: t("AssignProfiletoProjectList.requiredStartDate"),
                }}
                render={({ field }) => (
                  <DatePicker
                    className={`form-control ${
                      errors.startDate ? "is-invalid" : ""
                    }`}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.startDate && (
                <div className="invalid-feedback d-block">
                  {errors.startDate.message as string}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("AssignProfiletoProjectList.EndDate")}</Form.Label>
              <Controller
                name="endDate"
                control={control}
                rules={{
                  required: t("AssignProfiletoProjectList.requiredEndDate"),
                  validate: (value) =>
                    !watch("startDate") ||
                    !value ||
                    value >= watch("startDate") ||
                    t("AssignProfiletoProjectList.invalidDateRange"),
                }}
                render={({ field }) => (
                  <DatePicker
                    className={`form-control ${
                      errors.endDate ? "is-invalid" : ""
                    }`}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.endDate && (
                <div className="invalid-feedback d-block">
                  {errors.endDate.message as string}
                </div>
              )}
            </Form.Group>

            <div className="text-end mt-3">
              <Button variant="primary" type="submit">
                {t("AssignProfiletoProjectList.savechange")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
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
              {t("warningmessage.assignment")}{" "}
              <strong> {assigmentToDelete?.profileName}</strong>{" "}
              {t("warningmessage.projectss")}{" "}
              <strong>{assigmentToDelete?.projectName}</strong>?
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
