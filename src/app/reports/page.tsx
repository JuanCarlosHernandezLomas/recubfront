"use client";

import { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";

import QRCode from "qrcode";
import { ClipboardMinus } from "react-bootstrap-icons";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);
import autoTable from "jspdf-autotable";

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
  const [filters, setFilters] = useState({ id: "", name: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8090/api/profile/details/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error al obtener los datos");

      const data = await response.json();
      const doc = new jsPDF();

      const today = new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      // HEADER estilizado
      doc.setFillColor(25, 60, 112); // azul corporativo (oscuro)
      doc.rect(0, 0, 210, 30, "F"); // Rectángulo de fondo

      // Texto principal
      doc.setTextColor(255); // blanco
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text(t("reportPdf.title"), 105, 18, { align: "center" });

      // Fecha alineada a la derecha
      doc.setFontSize(10);
      doc.text(`${t("reportPdf.date")}: ${today}`, 200 - 10, 28, { align: "right" });
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
      doc.text(t("reportPdf.info"), 20, y);
      y += 8;

      doc.setFont(undefined, "normal");
      doc.text(`${t("reportPdf.id")}: ${data.employeeId || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.name")}: ${data.firstName || ""} ${data.lastName || ""}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.Position")}: ${data.jobTitle || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.locacion")}: ${data.location || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.availability")}: ${data.availabilityStatus || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.ExperienceLevel")}: ${data.experienceLevel || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.AssigmenUser")}: ${data.user || "N/A"}`, 20, y);
      y += 10;

      // Skills
      doc.setFont(undefined, "bold");
      doc.text(t("reportPdf.skill"), 20, y);
      y += 8;

      const skills = Array.isArray(data.skills) ? data.skills : [];
      if (skills.length > 0) {
        let x = 20;
        const maxWidth = 180;
        doc.setFontSize(10);

        for (let skill of skills) {
          const w = doc.getTextWidth(skill) + 8;
          if (x + w > maxWidth) {
            x = 20;
            y += 8;
          }
          doc.setFillColor(33, 150, 243);
          doc.roundedRect(x, y, w, 7, 2, 2, "F");
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
      doc.text(t("reportPdf.AssignProyect"), 20, y);
      y += 8;
      doc.setFont(undefined, "normal");
      doc.text(`${t("reportPdf.Project")}: ${data.projectName || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.client")}: ${data.clientName || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.Team")}: ${data.teamName || "N/A"}`, 20, y);
      y += 7;
      doc.text(`${t("reportPdf.rol")}: ${data.rolEnEquipo || "N/A"}`, 20, y);
      y += 12;

      // QR
      const downloadUrl = `http://localhost:8090/api/profile/download-resume/${data.id}`;
      const qrImage = await QRCode.toDataURL(downloadUrl);
      console.log(qrImage);

      doc.setFont(undefined, "bold");
      doc.text(t("reportPdf.qr"), 20, y);
      doc.addImage(qrImage, "PNG", 150, y, 40, 40);
      y += 50;

      // Footer
      doc.setDrawColor(200);
      doc.line(20, 280, 190, 280);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(t("reportPdf.footer"), 105, 285, {
        align: "center",
      });

      doc.save(`Reporte_Perfil_${data.employeeId}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el PDF");
    }
  };
  const generateBenchReportPdf = async () => {
    try {
      const res = await fetch("http://localhost:8090/api/reports/bench", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener el reporte de banca");

      const data = await res.json();
      const bench = data.filter((p: any) => p.status === "BENCH");
      const project = data.filter((p: any) => p.status === "PROJECT");

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      canvas.style.display = "none";
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

      const chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: [t("reportPdf.Bench"), t("reportPdf.Project")],
          datasets: [
            {
              data: [bench.length, project.length],
              backgroundColor: ["#e63946", "#2a9d8f"],
            },
          ],
        },
        options: {
          animation: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { size: 12 } },
            },
            datalabels: {
              formatter: (value, ctx) => {
                const total = ctx.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                return ((value / total) * 100).toFixed(1) + "%";
              },
              color: "#fff",
              font: { weight: "bold", size: 14 },
            },
          },
        },
        plugins: [ChartDataLabels],
      });

      await new Promise((resolve) => setTimeout(resolve, 500)); // Asegura que el gráfico se renderice

      const chartImage = canvas.toDataURL("image/png");
      chart.destroy();
      document.body.removeChild(canvas);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(t("reportPdf.BenchTitle"), 105, 20, { align: "center" });

      // Agregar gráfica
      doc.addImage(chartImage, "PNG", 45, 30, 120, 120); // Tamaño controlado

      // Después de agregar la gráfica y antes de guardar el PDF
      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text(t("reportPdf.BenchDetail"), 20, 160);

      // Tabla con autoTable
      autoTable(doc, {
        startY: 165,
        head: [[t("reportPdf.id"), t("reportPdf.name"), t("reportPdf.desde")]],
        body: bench.map((p: any) => [p.employeeId, p.fullName, p.sinceDate]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255,
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center" },
          1: { halign: "left" },
          2: { halign: "center" },
        },
      });
      doc.save("Reporte_Disponibilidad.pdf");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el reporte");
    }
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reiniciar a la primera página al filtrar
  };
  const filteredProfiles = profiles.filter((p) =>
    p.employeeId.toLowerCase().includes(filters.id.toLowerCase()) &&
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProfiles.slice(indexOfFirstItem, indexOfLastItem);
  const handleNextPage = () => {
    if (currentPage * itemsPerPage < filteredProfiles.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  return (
    <Container className="py-4">
      <h3 className="mb-4 text-primary">
        {" "}
        <ClipboardMinus size={40} />
        {t("report.title")}
      </h3>
      <Button
        variant="success"
        onClick={generateBenchReportPdf}
        className="mb-3"
      >
        📊 {t("reportPdf.generateBench")}
      </Button>
      <div className="d-flex gap-3 mb-3">
        <input
          type="text"
          name="id"
          placeholder={t("report.filterById")}
          className="form-control"
          value={filters.id}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="name"
          placeholder={t("report.filterByName")}
          className="form-control"
          value={filters.name}
          onChange={handleFilterChange}
        />
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Table bordered responsive hover>
          <thead>
            <tr>
              <th>{t("report.employee")}</th>
              <th>{t("report.name")}</th>
              <th>{t("report.action")}</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((p) => (
              <tr key={p.id}>
                <td>{p.employeeId}</td>
                <td>
                  {p.firstName} {p.lastName}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => generatePdf(p.id)}
                  >
                    {t("report.button")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
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

    </Container>
  );
}
