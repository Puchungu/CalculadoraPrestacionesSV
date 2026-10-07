document.getElementById('btnExportarPDF').addEventListener('click', function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const nombre = document.getElementById('nombreEmpleado')?.value.trim() || 'No especificado';
  const dui = document.getElementById('duiEmpleado')?.value.trim() || 'N/A';
  const fechaInicio = document.getElementById('fechaInicio')?.value || 'N/A';
  const fechaFin = document.getElementById('fechaFin')?.value || 'N/A';
  const neto = document.getElementById('lblTotalNeto')?.textContent || '$0.00';

  // --- Encabezado institucional ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RECIBO DE FINIQUITO Y LIQUIDACIÓN LABORAL", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Conforme a la legislación laboral de la República de El Salvador", 105, 27, { align: "center" });
  doc.line(20, 32, 190, 32);

  // --- 1. Datos Generales ---
  doc.setFont("helvetica", "bold");
  doc.text("1. DATOS DEL TRABAJADOR Y CONTRATO", 20, 42);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre Completo: ${nombre}`, 20, 50);
  doc.text(`Documento Único de Identidad (DUI): ${dui}`, 20, 57);
  doc.text(`Fecha de Contratación: ${fechaInicio}`, 20, 64);
  doc.text(`Fecha de Terminación: ${fechaFin}`, 110, 64);
  doc.text(`Tiempo de Servicio Computado: ${document.getElementById('lblAntiguedad').textContent}`, 20, 71);
  doc.text(`Salario Básico Diario: ${document.getElementById('lblSalarioDiario').textContent}`, 110, 71);

  // --- 2. Ingresos Devengados ---
  doc.setFont("helvetica", "bold");
  doc.text("2. DEVENGOS (INGRESOS BRUTOS)", 20, 83);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Indemnización / Prestación Económica:`, 20, 91);
  doc.text(`${document.getElementById('lblIndemnizacion').textContent}`, 190, 91, { align: "right" });

  doc.text(`Aguinaldo Proporcional:`, 20, 98);
  doc.text(`${document.getElementById('lblAguinaldo').textContent}`, 190, 98, { align: "right" });

  doc.text(`Vacaciones (Pendientes / Proporcionales):`, 20, 105);
  doc.text(`${document.getElementById('lblVacaciones').textContent}`, 190, 105, { align: "right" });

  doc.text(`Horas Extras Diurnas:`, 20, 112);
  doc.text(`${document.getElementById('lblHorasDiurnas').textContent}`, 190, 112, { align: "right" });

  doc.text(`Horas Extras Nocturnas:`, 20, 119);
  doc.text(`${document.getElementById('lblHorasNocturnas').textContent}`, 190, 119, { align: "right" });

  doc.text(`Días de Asueto Laborados:`, 20, 126);
  doc.text(`${document.getElementById('lblDiasAsueto').textContent}`, 190, 126, { align: "right" });

  doc.text(`Descanso Semanal Laborado:`, 20, 133);
  doc.text(`${document.getElementById('lblDescansoSemanal').textContent}`, 190, 133, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text(`Subtotal Ingresos Brutos:`, 20, 142);
  doc.text(`${document.getElementById('lblTotalBruto').textContent}`, 190, 142, { align: "right" });

  // --- 3. Retenciones de Ley ---
  doc.text("3. RETENCIONES Y DESCUENTOS DE LEY", 20, 153);
  doc.setFont("helvetica", "normal");
  doc.text(`ISSS (Salud):`, 20, 161);
  doc.text(`${document.getElementById('lblISSS').textContent}`, 190, 161, { align: "right" });

  doc.text(`AFP (Pensiones):`, 20, 168);
  doc.text(`${document.getElementById('lblAFP').textContent}`, 190, 168, { align: "right" });

  doc.text(`Impuesto sobre la Renta:`, 20, 175);
  doc.text(`${document.getElementById('lblRenta').textContent}`, 190, 175, { align: "right" });

  // --- Total Neto ---
  doc.line(20, 181, 190, 181);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL LÍQUIDO A PERCIBIR:`, 20, 189);
  doc.text(`${neto}`, 190, 189, { align: "right" });

  // --- Declaración Legal ---
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Hago constar que recibo a mi entera conformidad la suma neta arriba descrita en concepto de saldo definitivo de salarios y prestaciones laborales, declarando que no existe ninguna otra deuda ni reclamo pendiente por parte del empleador.",
    20, 203, { maxWidth: 170, align: "justify" }
  );

  // --- Firmas de constancia ---
  doc.line(30, 245, 85, 245);
  doc.text("Firma del Trabajador", 57, 250, { align: "center" });

  doc.line(125, 245, 180, 245);
  doc.text("Firma del Empleador / RRHH", 152, 250, { align: "center" });

  // Guardar archivo PDF con nombre dinámico
  const nombreLimpio = nombre.replace(/\s+/g, '_');
  doc.save(`Finiquito_${nombreLimpio}.pdf`);
});