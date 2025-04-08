"use client";

import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { useTranslation } from 'react-i18next';


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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

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
        throw new Error(errorData.message || 'Error al agregar la ubicación');
      }

      setMessage("¡Ubicación agregada exitosamente!");
      setFormData({ country: "", state: "", city: "", name: "" });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Ocurrió un error al cargar las locaciones.');
        
      }
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <h4 className="text-primary mb-4 text-center">{t('location.title')}</h4>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('location.country')}</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.state')}</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.city')}</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('location.locationName')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
