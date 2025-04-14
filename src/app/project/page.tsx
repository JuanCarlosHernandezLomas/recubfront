"use client";

import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";
import {  JournalPlus } from "react-bootstrap-icons";
import Link from "next/link";
import "animate.css";
import { useTranslation } from "react-i18next";
import { FolderOpen } from "lucide-react";
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { t } = useTranslation();
    const router = useRouter();
  const modules = [
    {
      title: t("Project.titlecard"),
      icon: <JournalPlus size={32} className="text-primary" />,
      description: t("Project.cardDesc"),
      path: "/project/CreateProject",
      animation: "animate__fadeInLeft",
    },

    {
      title: t("Project.titlecardDes"),
      icon:   <FolderOpen size={32} className="text-succes" />,
      description: t("Project.cardDesclist"),
      path: "/project/list-projects",
      animation: "animate__fadeInRight",
    },
  ];
      useEffect(() => {
        modules.forEach((mod) => {
          router.prefetch(mod.path);
          console.log(`✅ Precargando ruta: ${mod.path}`);
        });
      }, []);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 text-primary">
        {t("dashboard.welcome")}
      </h2>
      <Row className="g-4">
        {modules.map((mod, idx) => (
          <Col key={idx} md={6}>
            <Link href={mod.path} className="text-decoration-none">
              <Card
                className={`shadow-lg p-4 border-0 h-100 animate__animated ${mod.animation}`}
                style={{ transition: "transform 0.3s" }}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    {mod.icon}
                    <Card.Title className="ms-3 text-mtud">
                      {mod.title}
                    </Card.Title>
                  </div>
                  <Card.Text className="text-muted">
                    {mod.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Profile;
