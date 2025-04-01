"use client";

import { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

interface LocationForm {
  country: string;
  state: string;
  city: string;
  name: string;
}

export default function AddLocationPage() {
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

      if (!response.ok) throw new Error("Error al agregar la ubicación");

      setMessage("¡Ubicación agregada exitosamente!");
      setFormData({ country: "", state: "", city: "", name: "" });
    } catch (err) {
      setError("Hubo un problema al enviar los datos");
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <h4 className="text-primary mb-4 text-center">Agregar Nueva Ubicación</h4>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>País</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre de Ubicación</Form.Label>
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
              Agregar Ubicación
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
