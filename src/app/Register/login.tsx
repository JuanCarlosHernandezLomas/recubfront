"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  FloatingLabel,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  PersonBadge,
  LockFill,
  EnvelopeFill,
  BoxArrowInRight,
  ShieldLock,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setLoading(false);

      if (email === "admin@example.com" && password === "123456") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/register");
        }, 1000);
      } else {
        setErrorMessage("Credenciales incorrectas. Verifica tu correo y contraseña.");
      }
    }, 2000);
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-primary-subtle">
      <Card
        className="p-5 shadow-lg border-0 rounded-4 bg-white animate__animated animate__fadeInDown"
        data-aos="zoom-in"
        style={{ maxWidth: 500, width: "100%" }}
      >
        <div className="text-center mb-4">
          <ShieldLock size={48} className="text-primary mb-2 animate__animated animate__bounce" />
          <h2 className="fw-bold text-primary">Iniciar Sesión</h2>
          <p className="text-muted">Accede a tu cuenta para continuar</p>
        </div>

        {success && (
          <Alert variant="success" className="text-center animate__animated animate__fadeIn">
            <BoxArrowInRight className="me-2" />¡Inicio de sesión exitoso!
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="danger" className="text-center animate__animated animate__shakeX">
            <ExclamationTriangleFill className="me-2" />
            {errorMessage}
          </Alert>
        )}

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" role="status" />
            <div className="mt-2 text-muted">Verificando credenciales...</div>
          </div>
        )}

        {!loading && (
          <Form onSubmit={handleLogin} className="animate__animated animate__fadeInUp animate__faster">
            <FloatingLabel label={<><EnvelopeFill className="me-2" />Correo electrónico</>} className="mb-3">
              <Form.Control
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FloatingLabel>

            <FloatingLabel label={<><LockFill className="me-2" />Contraseña</>} className="mb-4">
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FloatingLabel>

            <div className="d-grid">
              <Button type="submit" variant="primary" size="lg" className="rounded-pill shadow-sm">
                <PersonBadge className="me-2" /> Ingresar
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default LoginPage;