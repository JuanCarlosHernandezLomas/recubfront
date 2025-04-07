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
import { Upload } from "react-bootstrap-icons";

import { useTranslation } from 'react-i18next';

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

  const [availabilityStatuses, setAvailabilityStatuses] = useState<Option[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {token}= useAuth();

  useEffect(() => {
    fetchOptions("/api/availability-status", setAvailabilityStatuses);
    fetchOptions("/api/experience-level", setExperienceLevels);
    fetchOptions("/api/locations", setLocations);
    fetchOptions("/api/skills", setSkills);
  }, []);

  const fetchOptions = async (endpoint: string, setter: (data: Option[]) => void) => {
    try {
      const response = await fetch(`http://localhost:8090${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`, //  Aquí va el token
        },
      });
      const data = await response.json();
      setter(data);
    } catch (error) {
      if(error instanceof Error){
        setErrorMessage(error.message);
        console.error("Error fetching:", endpoint);
      }
      else{
        setErrorMessage("An unknown error occurred");
      }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = new FormData();
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

    payload.append(
      "profile",
      new Blob([JSON.stringify(profile)], { type: "application/json" })
    );
    if (resume) {
      payload.append("file", resume);
    }

    try {
      const response = await fetch("http://localhost:8090/api/profile", {
        method: "POST",
        body: payload,
        headers: {
          
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al registrar el perfil.");

      setSuccessMessage("¡Perfil creado exitosamente!");
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
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage("Ocurrió un error al crear el perfil.");
        console.log(formData)
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center text-primary">{t('profile.title')}</h2>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Form.Group className="mb-3">
          <Form.Label>{t('profile.Id')}</Form.Label>
          <Form.Control
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.Name')}</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.LastName')}</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.Position')}</Form.Label>
          <Form.Control
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
          {t('profile.CV')} <Upload />
          </Form.Label>
          <Form.Control
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.availability')}</Form.Label>
              <Form.Select
                name="availabilityStatusId"
                value={formData.availabilityStatusId}
                onChange={handleChange}
                required
              >
                <option value="">--{t('profile.SelectAvailability')}--</option>
                {availabilityStatuses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.ExperienceLevel')}</Form.Label>
              <Form.Select
                name="experienceLevelId"
                value={formData.experienceLevelId}
                onChange={handleChange}
                required
              >
                <option value="">--{t('profile.SelectExperienceLevel')}--</option>
                {experienceLevels.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>{t('profile.location')}</Form.Label>
              <Form.Select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
              >
                <option value="">--{t('profile.SelectLocation')}--</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t('profile.UserId')}</Form.Label>
          <Form.Control
            type="number"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>{t('profile.Skills')}</Form.Label>
          <Form.Select
            multiple
            name="skillIds"
            value={formData.skillIds}
            onChange={handleChange}
            required
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="d-grid">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Register"}
          </Button>
        </div>
      </Form>
    </Container>
  );
}