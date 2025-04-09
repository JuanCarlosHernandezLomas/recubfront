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
  ShieldLock,
  ExclamationTriangleFill,
} from "react-bootstrap-icons";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        setLoading(false); //  detener el spinner antes de mostrar el error
        setError(
          t('login.error')
        );
        return;
      }

      const data = await response.json();
      login(data.token, data.roles, data.username);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al iniciar sesión.");
        setLoading(false);
      }
    }
  };

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center bg-primary-subtle"
    >
      <Card
        className="p-5 shadow-lg border-0 rounded-4 bg-white animate__animated animate__fadeInDown"
        data-aos="zoom-in"
        style={{ maxWidth: 500, width: "100%" }}
      >
        <div className="text-center mb-4">
          <ShieldLock
            size={48}
            className="text-primary mb-2 animate__animated animate__bounce"
          />
          <h2 className="fw-bold text-primary">{t('login.title')}</h2>
          <p className="fw-bold text-primary">{t('login.texthelp')}</p>
        </div>

        {error && (
          <Alert variant="danger" className="text-center">
            <ExclamationTriangleFill className="me-2" /> {error}
          </Alert>
        )}

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" role="status" />
            <div className="mt-2 text-primary">{t('login.procces')}</div>
          </div>
        )}

        {!loading && (
          <Form
            onSubmit={handleLogin}
            className="animate__animated animate__fadeInUp animate__faster"
          >
            <FloatingLabel
              label={
                <>
                  <EnvelopeFill className="me-2" />
                  {t('login.email')}
                </>
              }
              className="mb-3"
            >
              <Form.Control
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FloatingLabel>

            <FloatingLabel
              label={
                <>
                  <LockFill className="me-2" />
                  {t('login.password')}
                </>
              }
              className="mb-4"
            >
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FloatingLabel>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="rounded-pill shadow-sm"
              >
                <PersonBadge className="me-2" /> {t('login.button')}
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
};

export default LoginPage;
