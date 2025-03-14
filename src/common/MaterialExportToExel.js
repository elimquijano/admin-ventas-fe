import * as ExcelJS from "exceljs";
import { FechaActualCompleta } from "./common";

export async function exportToExcel(data, columns, reporte) {
  data = sumDataTotales(data);
  var nameExcel = FechaActualCompleta();
  nameExcel = nameExcel.replace(/[\s:]/g, "-");
  nameExcel = reporte + "_" + nameExcel + ".xlsx";

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reporte);

  // Formato de celdas
  worksheet.columns = columns;

  worksheet.addRows(data);

  // Estilo de la primera fila (fila de encabezado)
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.value = cell.value ? cell.value.toString().toUpperCase() : ""; // Convertir a mayúsculas
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB0E0E6" }, // Color celeste claro
    };
  });
  // Obtener la última fila y aplicar el mismo estilo que el encabezado
  const lastRow = worksheet.getRow(data.length + 1); // Última fila (data.length + 1 es la fila de totales)
  lastRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB0E0E6" }, // Color celeste claro
    };
  });

  // Crear un archivo Blob
  const blob = await workbook.xlsx.writeBuffer();

  // Descargar el archivo Excel
  const blobUrl = URL.createObjectURL(
    new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = nameExcel;
  a.click();
  URL.revokeObjectURL(blobUrl);
}
function sumDataTotales(data) {
  let sumaTotal = {
    id: "TOTAL",
    monto: data.reduce((sum, item) => sum + Number(item.monto), 0),
    junta: data.reduce((sum, item) => sum + Number(item.junta), 0),
    junta_plan: data.reduce((sum, item) => sum + Number(item.junta_plan), 0),
    monto_press: data.reduce((sum, item) => sum + Number(item.monto_press), 0),
    desgrav: data.reduce((sum, item) => sum + Number(item.desgrav), 0),
    gastos_admin: data.reduce(
      (sum, item) => sum + Number(item.gastos_admin),
      0
    ),
    cartera_Activa: data.reduce(
      (sum, item) => sum + Number(item.cartera_Activa),
      0
    ),
  };
  data.push(sumaTotal);

  return data;
}
