// src/app/reports/GenerateReportPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import { useAuth } from "../context/useAuth";
import { useTranslation } from 'react-i18next';

import QRCode from "qrcode";

interface ProfileSummary {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
}

export default function GenerateReportPage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await fetch("http://localhost:8090/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Error al obtener perfiles");
                const data = await res.json();
                setProfiles(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, [token]);

    const generatePdf = async (employeeId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8090/api/profile/details/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Error al obtener los datos");

            const data = await response.json();
            const doc = new jsPDF();

            const today = new Date().toLocaleDateString('es-MX', {
                day: '2-digit', month: 'long', year: 'numeric',
            });
            // HEADER estilizado
            doc.setFillColor(25, 60, 112); // azul corporativo (oscuro)
            doc.rect(0, 0, 210, 30, 'F'); // Rectángulo de fondo

            // Texto principal
            doc.setTextColor(255); // blanco
            doc.setFontSize(18);
            doc.setFont(undefined, "bold");
            doc.text("Reporte de Perfil Profesional", 105, 18, { align: "center" });

            // Fecha alineada a la derecha
            doc.setFontSize(10);
            doc.text(`Fecha: ${today}`, 200 - 10, 28, { align: "right" });
            doc.setFont(undefined, "normal");


            // Línea divisoria decorativa debajo del header
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(20, 32, 190, 32);



            // CUERPO
            doc.setTextColor(0);
            doc.setFontSize(12);
            let y = 40;

            doc.setFont(undefined, "bold");
            doc.text("Información Personal:", 20, y); y += 8;

            doc.setFont(undefined, "normal");
            doc.text(`ID: ${data.employeeId || "N/A"}`, 20, y); y += 7;
            doc.text(`Nombre: ${data.firstName || ""} ${data.lastName || ""}`, 20, y); y += 7;
            doc.text(`Puesto: ${data.jobTitle || "N/A"}`, 20, y); y += 7;
            doc.text(`Ubicación: ${data.location || "N/A"}`, 20, y); y += 7;
            doc.text(`Disponibilidad: ${data.availabilityStatus || "N/A"}`, 20, y); y += 7;
            doc.text(`Nivel de Experiencia: ${data.experienceLevel || "N/A"}`, 20, y); y += 7;
            doc.text(`Usuario Asignado: ${data.user || "N/A"}`, 20, y); y += 10;

            // Skills
            doc.setFont(undefined, "bold");
            doc.text("Habilidades Técnicas:", 20, y); y += 8;

            const skills = Array.isArray(data.skills) ? data.skills : [];
            if (skills.length > 0) {
                let x = 20;
                const maxWidth = 180;
                doc.setFontSize(10);

                for (let skill of skills) {
                    const w = doc.getTextWidth(skill) + 8;
                    if (x + w > maxWidth) { x = 20; y += 8; }
                    doc.setFillColor(33, 150, 243);
                    doc.roundedRect(x, y, w, 7, 2, 2, 'F');
                    doc.setTextColor(255);
                    doc.text(skill, x + 4, y + 5);
                    x += w + 4;
                }
                y += 12;
                doc.setTextColor(0);
                doc.setFontSize(12);
            }

            // Proyecto
            doc.setFont(undefined, "bold");
            doc.text("Asignación de Proyecto:", 20, y); y += 8;
            doc.setFont(undefined, "normal");
            doc.text(`Proyecto: ${data.projectName || "No asignado"}`, 20, y); y += 7;
            doc.text(`Cliente: ${data.clientName || "No asignado"}`, 20, y); y += 7;
            doc.text(`Equipo: ${data.teamName || "No asignado"}`, 20, y); y += 7;
            doc.text(`Rol en el equipo: ${data.rolEnEquipo || "N/A"}`, 20, y); y += 12;

            // QR
            const downloadUrl = `http://localhost:8090/api/profile/download-resume/${data.id}`;
            const qrImage = await QRCode.toDataURL(downloadUrl);
            console.log(qrImage)

            doc.setFont(undefined, "bold");
            doc.text("Escanea para descargar el CV:", 20, y);
            doc.addImage(qrImage, 'PNG', 150, y, 40, 40);
            y += 50;

            // Footer
            doc.setDrawColor(200);
            doc.line(20, 280, 190, 280);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Generado automáticamente por ResourceHub", 105, 285, { align: "center" });

            doc.save(`Reporte_Perfil_${data.employeeId}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Hubo un error al generar el PDF");
        }
    };
    return (
        <Container className="py-4">
            <h3 className="mb-4 text-primary">{t('report.title')}</h3>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Table bordered responsive hover>
                    <thead>
                        <tr>
                            <th>{t('report.employee')}</th>
                            <th>{t('report.name')}</th>
                            <th>{t('report.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((p) => (
                            <tr key={p.id}>
                                <td>{p.employeeId}</td>
                                <td>{p.firstName} {p.lastName}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => generatePdf(p.id)}>
                                        {t('report.button')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}
