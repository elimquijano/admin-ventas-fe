export const columnsProductosList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'NOMBRE', key: 'name', width: 25 },
  { header: 'CODIGO', key: 'code', width: 25 },
  { header: 'NUM PARTE', key: 'num_part', width: 25 }
];

export const columnsCategoriasList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'NOMBRE', key: 'name', width: 25 },
  { header: 'DESCRIPCIÓN', key: 'description', width: 30 },
];

export const columnsProveedoresList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'NOMBRE', key: 'name', width: 25 },
  { header: 'DIRECCIÓN', key: 'address', width: 30 },
  { header: 'CONTACTO', key: 'contact', width: 20 },
  { header: 'EMAIL', key: 'email', width: 20 },
  { header: 'RUC', key: 'ruc', width: 11 },
  { header: 'TELÉFONO', key: 'phone', width: 10 },
  { header: 'ANEXO', key: 'attachment', width: 20 },
  { header: 'MÉTODO DE PAGO', key: 'payment_method', width: 20 },
];

export const columnsClientesList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'NOMBRE', key: 'name', width: 25 },
  { header: 'DIRECCIÓN', key: 'address', width: 30 },
  { header: 'CONTACTO', key: 'contact', width: 20 },
  { header: 'EMAIL', key: 'email', width: 20 },
  { header: 'RUC', key: 'ruc', width: 11 },
  { header: 'TELÉFONO', key: 'phone', width: 10 },
  { header: 'ANEXO', key: 'attachment', width: 20 },
  { header: 'MÉTODO DE PAGO', key: 'payment_method', width: 20 },
];

export const columnsDetRepuesto = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'CANTIDAD', key: 'amount', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 30 },
  { header: 'PRECIO', key: 'price', width: 25 },
  { header: 'REPUESTO', key: 'id_replacement', width: 50 },
  { header: 'DESCRIPCIÓN', key: 'description', width: 100 },
];

export const columnsModeloEquipo = [
  { header: 'CÓDIGO', key: 'code', width: 15 },
  { header: 'NRO PARTE', key: 'num_part', width: 30 },
  { header: 'CANTIDAD', key: 'amount', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 30 },
  { header: 'DESCRIPCIÓN', key: 'description', width: 100 },
];

export const columnsServicioTecnico = [
  { header: 'CÓDIGO', key: 'id', width: 10 },
  { header: 'FECHA ENTRADA', key: 'entry_date', width: 25 },
  { header: 'CLIETE', key: 'cliente_id', width: 30 },
  { header: 'TÉCNICO', key: 'id_technician', width: 30 },
  { header: 'ENCARGADO', key: 'id_manager', width: 30 },
  { header: 'ESTADO', key: 'state', width: 20 },
  { header: 'FECHA ENTREGA', key: 'departure_date', width: 25 },
  { header: 'DESCRIPCIÓN', key: 'description', width: 100 },
];

export const columnsComprasList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'RAZÓN', key: 'reason', width: 50 },
  { header: 'PROVEEDOR', key: 'name_proveedor', width: 40 },
  { header: 'NEGOCIO', key: 'name_negocio', width: 40}
];

export const columnsDetComprasList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'CANTIDAD', key: 'amount', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 20 },
  { header: 'PRECIO', key: 'price', width: 20 },
  { header: 'PRODUCTO', key: 'name_producto', width: 40}
];

export const columnsVentasList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'RAZÓN', key: 'reason', width: 50 },
  { header: 'CLIENTE', key: 'name_cliente', width: 40 },
  { header: 'NEGOCIO', key: 'name_negocio', width: 40}
];

export const columnsDetVentasList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'CANTIDAD', key: 'amount', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 20 },
  { header: 'PRECIO', key: 'price', width: 20 },
  { header: 'PRODUCTO', key: 'name_producto', width: 40}
];

export const columnsVentaTicketList = [
  { header: 'FECHAE', key: 'fechae', width: 10 },
  { header: 'FECHAV', key: 'fechav', width: 10 },
  { header: 'TIPOC', key: 'tipoc', width: 10 },
  { header: 'SERIE', key: 'serie', width: 10 },
  { header: 'NUMERO', key: 'numero', width: 10 },
  { header: 'TIPODOC', key: 'tipodoc', width: 10 },
  { header: 'DOCUMENTO', key: 'documento', width: 15 },
  { header: 'NOMBRE', key: 'nombre', width: 30 },
  { header: 'BASEI', key: 'basei', width: 10 },
  { header: 'IGV', key: 'igv', width: 10 },
  { header: 'ICBPER', key: 'icbper', width: 10 },
  { header: 'EXONERADO', key: 'exonerado', width: 10 },
  { header: 'RETENCION', key: 'retencion', width: 10 },
  { header: 'TOTAL', key: 'total', width: 10 },
];

export const columnsVentaProductsList = [
  { header: 'FECHAE', key: 'fechae', width: 10 },
  { header: 'FECHAV', key: 'fechav', width: 10 },
  { header: 'TIPOC', key: 'tipoc', width: 10 },
  { header: 'SERIE', key: 'serie', width: 10 },
  { header: 'NUMERO', key: 'numero', width: 10 },
  { header: 'TIPODOC', key: 'tipodoc', width: 10 },
  { header: 'DOCUMENTO', key: 'documento', width: 15 },
  { header: 'NOMBRE', key: 'nombre', width: 30 },
  { header: 'BASEI', key: 'basei', width: 10 },
  { header: 'IGV', key: 'igv', width: 10 },
  { header: 'ICBPER', key: 'icbper', width: 10 },
  { header: 'EXONERADO', key: 'exonerado', width: 10 },
  { header: 'RETENCION', key: 'retencion', width: 10 },
  { header: 'TOTAL', key: 'total', width: 10 },
];

export const columnsDetVentaProductsList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'CANTIDAD', key: 'amount', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 20 },
  { header: 'PRECIO', key: 'price', width: 20 },
  { header: 'PRODUCTO', key: 'name_producto', width: 40}
];

export const columnsTransaccionesList = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'PRODUCTO', key: 'name_pro', width: 50 },
  { header: 'TIPO', key: 'tipo', width: 20 },
  { header: 'CANTIDAD', key: 'cantidad', width: 20 },
  { header: 'MONEDA', key: 'moneda', width: 30},
  { header: 'PRECIO', key: 'price', width: 20 },
  { header: 'PUSUARIOO', key: 'user_id', width: 50 },
  { header: 'NEGOCIO', key: 'negocio_id', width: 50 }
];

export const columnsInforme = [
  { header: 'CÓDIGO', key: 'id', width: 15 },
  { header: 'DETALLE SERVICIO TECNICO', key: 'id_det_ser_tec', width: 30 },
  { header: 'OBSERVACIÓN', key: 'observation', width: 100 },
  { header: 'CONCLUSIÓN', key: 'conclusion', width: 100 },
];

export const columnsTicket = [
  { header: 'CÓDIGO', key: 'id', width: 10 },
  { header: 'DESCRIPCION', key: 'name', width: 50 },
  { header: 'FECHA', key: 'fecha', width: 30 },
  { header: 'PRECIO', key: 'price', width: 10 },
  { header: 'CANTIDAD', key: 'quantity', width: 10 },
  { header: 'TOTAL', key: 'total', width: 10 },
];