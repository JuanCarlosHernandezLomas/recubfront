"use client";

import {  MapPinPlus } from "lucide-react";
import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface LocationForm {
  country: string;
  state: string;
  city: string;
  name: string;
}

export default function AddLocationPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LocationForm>({
    country: "",
    state: "",
    city: "",
    name: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setValidated(true);

    if (!formData.country.trim() || !formData.state.trim() || !formData.city.trim() || !formData.name.trim()) {
      toast.error(t('location.errordata'), {
        toastId: "location-success-toast"
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8090/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, active: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('location.error'));
      }

      toast.success(t('location.success'), {
        toastId: "location-success-toast"
      });
      setFormData({ country: "", state: "", city: "", name: "" });
      setValidated(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || t('location.errordata'), {
          toastId: "location-error-toast"
        });

      }
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <h4 className="text-primary mb-4 text-center"><MapPinPlus color="#1499ff" size={45}/>{t('location.title')}</h4>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('location.country')}</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              isInvalid={validated && !formData.country.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {t('location.requiredCountry')}
              </Form.Control.Feedback>
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.state')}</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              isInvalid={validated && !formData.state.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {t('location.requiredstate')}
              </Form.Control.Feedback>
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.city')}</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              isInvalid={validated && !formData.city.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {t('location.requiredcity')}
              </Form.Control.Feedback>
            </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.locationName')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              isInvalid={validated && !formData.name.trim()}
              />
              <Form.Control.Feedback type="invalid">
                {t('location.requiredname')}
              </Form.Control.Feedback>
            </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="primary">
              {t('location.button')}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
