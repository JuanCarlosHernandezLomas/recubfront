// components/BenchReportPDFButton.tsx
'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import { useState } from 'react';

export default function BenchReportPDFButton({ reportData }: { reportData: any[] }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    const pdf = new jsPDF();

    // Datos para gráfica
    const total = reportData.length;
    const benchCount = reportData.filter(p => p.status === 'BENCH').length;
    const projectCount = total - benchCount;

    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = 300;
    chartCanvas.height = 300;

    new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels: ['BENCH', 'PROJECT'],
        datasets: [
          {
            data: [benchCount, projectCount],
            backgroundColor: ['#ff6384', '#36a2eb'],
          },
        ],
      },
    });

    // Esperar que la gráfica se pinte
    await new Promise((resolve) => setTimeout(resolve, 500));

    const chartImage = await html2canvas(chartCanvas).then(canvas => canvas.toDataURL('image/png'));
    pdf.text('ResourceHub Bench Report', 14, 15);
    pdf.addImage(chartImage, 'PNG', 40, 20, 120, 120);

    pdf.text('Bench List', 14, 150);
    const benchList = reportData
      .filter(p => p.status === 'BENCH')
      .map(p => [p.employeeId, p.fullName, p.sinceDate]);

    autoTable(pdf, {
      startY: 155,
      head: [['Employee ID', 'Full Name', 'Since Date']],
      body: benchList,
    });

    pdf.save('BenchReport.pdf');
    setLoading(false);
  };

  return (
    <button className="btn btn-outline-primary" onClick={generatePDF} disabled={loading}>
      {loading ? 'Generating...' : '📄 Generar Reporte PDF'}
    </button>
  );
}
