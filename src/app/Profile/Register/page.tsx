"use client";

import { useAuth } from "@/app/context/useAuth";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Clock, Lightbulb, Pencil, Upload } from "react-bootstrap-icons";
import { FileUser, GraduationCap, IdCard, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

interface Option {
  id: number;
  name: string;
}

interface ProfileForm {
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  resume: File | null;
  availabilityStatusId: string;
  experienceLevelId: string;
  locationId: string;
  userId: string;
  skillIds: string[];
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [formData, setFormData] = useState<ProfileForm>({
    employeeId: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    resume: null,
    availabilityStatusId: "",
    experienceLevelId: "",
    locationId: "",
    userId: "",
    skillIds: [],
  });

  const [validated, setValidated] = useState(false);
  const [availabilityStatuses, setAvailabilityStatuses] = useState<Option[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isEmptyOrWhitespace = (value: string) => !value || value.trim() === "";

  useEffect(() => {
    fetchOptions("/api/availability-status", setAvailabilityStatuses);
    fetchOptions("/api/experience-level", setExperienceLevels);
    fetchOptions("/api/locations", setLocations);
    fetchOptions("/api/skills", setSkills);
  }, []);

  const fetchOptions = async (endpoint: string, setter: (data: Option[]) => void) => {
    try {
      const response = await fetch(`http://localhost:8090${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setter(data);
    } catch {
      toast.error("Error loading options", { toastId: "load-options-error" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "skillIds" && e.target instanceof HTMLSelectElement) {
      const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      setFormData((prev) => ({ ...prev, skillIds: selected }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (
      isEmptyOrWhitespace(formData.employeeId) ||
      isEmptyOrWhitespace(formData.firstName) ||
      isEmptyOrWhitespace(formData.lastName) ||
      isEmptyOrWhitespace(formData.jobTitle)
    ) {
      setValidated(true);
      toast.error(t("profile.noWhitespaceError"), { toastId: "no-whitespace" });
      return;
    }

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);


    const {
      employeeId,
      firstName,
      lastName,
      jobTitle,
      availabilityStatusId,
      experienceLevelId,
      locationId,
      userId,
      skillIds,
      resume,
    } = formData;

    const profile = {
      employeeId,
      firstName,
      lastName,
      jobTitle,
      availabilityStatusId,
      experienceLevelId,
      locationId,
      userId,
      skillIds,
      active: true,
    };

    const payload = new FormData();
    payload.append("profile", new Blob([JSON.stringify(profile)], { type: "application/json" }));
    if (resume) payload.append("file", resume);

    try {
      const res = await fetch("http://localhost:8090/api/profile", {
        method: "POST",
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error creating profile");
      }

      toast.error(t("profile.noWhitespaceError"), { toastId: "no-whitespace" });
      setFormData({
        employeeId: "",
        firstName: "",
        lastName: "",
        jobTitle: "",
        resume: null,
        availabilityStatusId: "",
        experienceLevelId: "",
        locationId: "",
        userId: "",
        skillIds: [],
      });
      setValidated(false);
    } catch (err: any) {
      toast.error(err.message || "Error creating profile", { toastId: "register-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center text-primary">{t("profile.title")}</h2>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label><IdCard size={20} /> {t("profile.Id")}</Form.Label>
          <Form.Control
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            isInvalid={validated && isEmptyOrWhitespace(formData.employeeId)}
          />
          <Form.Control.Feedback type="invalid">
            {t("profile.requiredId")}
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><Pencil /> {t("profile.Name")}</Form.Label>
              <Form.Control
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                isInvalid={validated && isEmptyOrWhitespace(formData.firstName)}
              />
              <Form.Control.Feedback type="invalid">
                {t("profile.requiredName")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><Pencil /> {t("profile.LastName")}</Form.Label>
              <Form.Control
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                isInvalid={validated && isEmptyOrWhitespace(formData.lastName)}
              />
              <Form.Control.Feedback type="invalid">
                {t("profile.requiredLastName")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t("profile.Position")}</Form.Label>
          <Form.Control
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
            isInvalid={validated && isEmptyOrWhitespace(formData.jobTitle)}
          />
          <Form.Control.Feedback type="invalid">
            {t("profile.requiredPosition")}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><FileUser /> {t("profile.CV")} <Upload /></Form.Label>
          <Form.Control
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
            isInvalid={validated && !formData.resume}
          />
          <Form.Control.Feedback type="invalid">
            {t("profile.requiredCV")}
          </Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><Clock /> {t("profile.availability")}</Form.Label>
              <Form.Select
                name="availabilityStatusId"
                value={formData.availabilityStatusId}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.availabilityStatusId}
              >
                <option value="">{t("profile.SelectAvailability")}</option>
                {availabilityStatuses.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("profile.requiredAvailability")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><Lightbulb /> {t("profile.ExperienceLevel")}</Form.Label>
              <Form.Select
                name="experienceLevelId"
                value={formData.experienceLevelId}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.experienceLevelId}
              >
                <option value="">{t("profile.SelectExperienceLevel")}</option>
                {experienceLevels.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("profile.requiredExperience")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label><MapPin /> {t("profile.location")}</Form.Label>
              <Form.Select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.locationId}
              >
                <option value="">{t("profile.SelectLocation")}</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {t("profile.requiredLocation")}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t("profile.UserId")}</Form.Label>
          <Form.Control
            name="userId"
            type="number"
            value={formData.userId}
            onChange={handleChange}
            required
            isInvalid={validated && !formData.userId}
          />
          <Form.Control.Feedback type="invalid">
            {t("profile.requiredUser")}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label><GraduationCap /> {t("profile.Skills")}</Form.Label>
          <Form.Select
            multiple
            name="skillIds"
            value={formData.skillIds}
            onChange={handleChange}
            required
            isInvalid={validated && formData.skillIds.length === 0}
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {t("profile.requiredSkills")}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : t("profile.Register")}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
