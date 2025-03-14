import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { backgroundNeonBase64 } from 'assets/js/localData';
import { API_URL_USER, getSession } from './common';
import axios from 'axios';
export async function generateAndDownloadPdf(columnsTable, data, totalValue, caja = null) {
  const doc = new jsPDF();
  let tableStartY = 35;

  const base64Image = backgroundNeonBase64;
  // Agregar la imagen de fondo
  doc.addImage(base64Image, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

  // Configurar el color del texto para el título y subtítulo
  doc.setTextColor(255, 255, 255); // Blanco
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(`REPORTE DE ${caja == null ? 'VENTAS' : 'CIERRE'}`, doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });

  const { fecha, turno } = obtenerFechaYTurno();
  doc.setFontSize(12);
  if (caja !== null) {
    const userInfo = await axios.get(API_URL_USER + `/${getSession('USER_ID')}`)
    doc.text('SEDE: ' + userInfo?.data.alias, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    doc.text('Empleado: ' + userInfo?.data.name, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.text('Fecha y hora de apertura: ' + caja?.opening_datetime, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
    doc.text('Fecha y hora de cierre: ' + caja?.closing_datetime, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    doc.text('Turno: ' + turno, doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });
    tableStartY = 50;
  } else {
    doc.text('Fecha y hora: ' + fecha, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    doc.text('Turno: ' + turno, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
  }

  // Preparar los datos para el encabezado de la tabla
  const tableHead = [
    columnsTable.map((column) => ({
      content: column.label,
      styles: { halign: 'center', fillColor: [0, 0, 255], textColor: [255, 255, 255] }
    }))
  ];

  // Preparar los datos para la tabla
  // Preparar los datos para la tabla
  const tableData = data.map((row, rowIndex) => {
    const formattedRow = [];
    columnsTable.forEach((column, columnIndex) => {
      // Alinear las dos primeras columnas a la izquierda y las demás a la derecha
      const alignment = columnIndex == 1 ? 'left' : 'right';
      const isFixed = columnIndex == 2 || columnIndex == 4;

      // Determinar el color de la fila basado en el patrón
      let fillColor;
      let textColor;
      switch (rowIndex % 3) {
        case 0:
          fillColor = [228, 8, 10]; // Rojo
          textColor = [255, 255, 255];
          break;
        case 1:
          fillColor = [47, 165, 1]; // Verde
          textColor = [255, 255, 255];
          break;
        case 2:
          fillColor = [254, 203, 0]; // Amarillo
          textColor = [0, 0, 0];
          break;
        default:
          fillColor = false; // Sin color de fondo
      }

      formattedRow.push({
        content: isFixed
          ? Number(Number(row[column.id]).toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })
          : row[column.id].toString(),
        styles: { halign: alignment, fillColor, textColor: textColor }
      });
    });
    return formattedRow;
  });

  // Agregar la fila de total al final de los datos de la tabla
  const totalRow = [
    { content: 'Total', colSpan: 4, styles: { halign: 'left', fillColor: [254, 153, 0], textColor: [0, 0, 0] } },
    {
      content: Number(Number(totalValue).toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }),
      styles: { halign: 'right', fillColor: [254, 153, 0], textColor: [0, 0, 0] }
    }
  ];
  tableData.push(totalRow);

  // Agregar la tabla con bordes blancos y contenido transparente
  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableData,
    theme: 'plain', // Tema sin color de fondo
    styles: {
      lineColor: [255, 255, 255], // Bordes blancos
      lineWidth: 0.1, // Grosor de los bordes
      textColor: [255, 255, 255], // Texto blanco
      fontStyle: 'bold'
    },
    headStyles: {
      fillColor: false, // Sin color de fondo en la cabecera
      textColor: [255, 255, 255] // Texto blanco en la cabecera
    },
    bodyStyles: {
      fillColor: false, // Sin color de fondo en el cuerpo
      textColor: [255, 255, 255] // Texto blanco en el cuerpo
    }
  });

  // Guardar y descargar el PDF
  doc.save(`Reporte_de_${caja == null ? 'ventas_' : 'cierre_'}` + fecha + '.pdf');

  // Convertir el PDF a un blob y devolverlo
  const pdfBytes = doc.output('arraybuffer');
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export function obtenerFechaYTurno() {
  let fecha = new Date();
  let dia = ('0' + fecha.getDate()).slice(-2);
  let mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
  let año = fecha.getFullYear();
  let hora = fecha.getHours();
  let minuto = ('0' + fecha.getMinutes()).slice(-2);
  let turno = '';

  if (hora >= 0 && hora < 12) {
    turno = 'mañana';
  } else if (hora >= 12 && hora < 18) {
    turno = 'tarde';
  } else {
    turno = 'noche';
  }

  let fechaFormateada = `${dia}/${mes}/${año} ${hora}:${minuto}`;

  return { fecha: fechaFormateada, turno: turno };
}
