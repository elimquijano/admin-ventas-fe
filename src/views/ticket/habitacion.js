import React from 'react';
import { columnsTicket } from 'common/ExportColums';
import { exportToExcel } from 'common/MaterialExportToExel';
import {
  API_HOST,
  API_URL_CAJA,
  API_URL_HABITACION,
  API_URL_USER,
  descargarDocumento,
  FechaActualCompleta,
  fetchAPIAsync,
  getSession,
  notificationSwal,
  restarCincoHoras
} from 'common/common';
import TableResumeModal from 'ui-component/table/TableResumeModal';
import { useEffect } from 'react';
import { useState } from 'react';
import { Description, List, PointOfSale, Print, ReceiptLong } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { SET_MENU } from 'store/actions';
import { Alert } from '@mui/material';
import TableExpandData from 'ui-component/table/TableExpandData';
import HeaderInterfaceUser from 'ui-component/subheader/headerInterfaceUser';
import FullScreenLoader from 'ui-component/loader/FullScreenLoader';
import MainHabitacions from 'ui-component/main/mainHabitacions';
import LoginButtons from 'ui-component/loginButtons/loginButtons';

const Habitacion = () => {
  const [isShowLoader, setIsShowLoader] = useState(false);
  const [messageLoader, setMessageLoader] = useState('Cargando...');
  const [user, setUser] = useState({});
  const [caja, setCaja] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [impresoras, setImpresoras] = useState([]);
  const [formData, setFormData] = useState({});
  const [ticketList, setTicketList] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [filteredRowsResume, setFilteredRowsResume] = useState([]);
  const [totalDinnerCaja, setTotalDinnerCaja] = useState(0);
  const columnsTable = [
    { id: 'id', label: 'N°', minWidth: 5, key: 0, align: 'right' },
    { id: 'name', label: 'Nombre', minWidth: 180, key: 1, align: 'left' },
    { id: 'price', label: 'Precio Unitario', minWidth: 20, key: 3, align: 'right' },
    { id: 'ventas', label: 'Cantidad', minWidth: 10, key: 4, align: 'right' },
    { id: 'total', label: 'Total', minWidth: 20, key: 5, align: 'right' }
  ];
  const columnsTableTicketsVendidos = [
    { id: 'folio', label: 'CÓDIGO', align: 'center', minWidth: 10 },
    { id: 'quantity', label: 'CANTIDAD', align: 'right', minWidth: 10 },
    { id: 'total', label: 'TOTAL', align: 'right', minWidth: 10 },
    { id: 'created_at', label: 'FECHA Y HORA', align: 'right', minWidth: 10 }
  ];
  const [isOpenModalCaja, setIsOpenModalCaja] = useState(false);
  const [isOpenModalVentas, setIsOpenModalVentas] = useState(false);
  const [isOpenModalResumen, setIsOpenModalResumen] = useState(false);
  const [isOpenModalConfig, setIsOpenModalConfig] = useState(false);
  const onChangeDocumento = async (id) => {
    if (documentos.length < 1) {
      return { success: false };
    }
    setFormData({ ...formData, documento_id: id });
    return { success: true };
  };
  const onChangePrinter = async (id) => {
    if (impresoras.length < 1) {
      return { success: false };
    }
    setFormData({ ...formData, impresora_id: id });
    return { success: true };
  };
  const impresion = async (quantity) => {
    const [fecha, hora] = FechaActualCompleta().split(' ');
    const documento = documentos.find((d) => d.id == user?.documento_id);
    const tipo = tipos.find((t) => t.id == formData.tipo_id);
    const total = tipo?.price * 1 || 0;
    const subTotal = total / 1.18;

    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <html>
            <head>
                <title>Imprimir Boleta</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            width: 80mm;
                        }
                        .page {
                            width: 80mm;
                            page-break-after: always;
                            padding: 10px;
                            box-sizing: border-box;
                            line-height: 0.1;
                        }
                        .table{
                          width: 100%;
                        }
                        .table-bordered, .table-bordered th, .table-bordered td, .table-bordered tr{
                          border: 1px solid black;
                        }
                        .text-center {
                          text-align: center;
                        }
                        .font-sm{
                          font-size: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                ${Array.from(
                  { length: quantity },
                  (_, i) => `
                    <div class="page">
                      <img src="${API_HOST + user?.negocio?.logo}" width="30%">
                      <h4 class="text-center">${user?.negocio?.name}</h4>
                      <h5 class="text-center">RUC ${user?.negocio?.ruc}</h5>
                      <p class="text-center font-sm">${user?.negocio?.address}</p>
                      <hr/>
                      <h4 class="text-center">BOLETA DE VENTA ELECTRONICA</h4>
                      <h4 class="text-center">${documento.serie}-${String(documento.numero_folio + i).padStart(6, '0')}</h4>
                      <hr/>
                      <table class="table">
                        <tr>
                          <td>F. Emision</td>
                          <td>: ${fecha}</td>
                        </tr>
                        <tr>
                          <td>H. Emision</td>
                          <td>: ${hora}</td>
                          </tr>
                        <tr>
                          <td>Cliente</td>
                          <td>: Cliente Eventual</td>
                          </tr>
                        <tr>
                          <td>DNI</td>
                          <td>: 00000000</td>
                        </tr>
                      </table>
                      <hr/>
                      <table class="table">
                        <thead>
                          <tr>
                            <td>Cant.</td>
                            <td>Producto</td>
                            <td align="end">P.U</td>
                            <td align="end">Total</td>
                          </tr>
                          <tr>
                            <td colspan="4"><hr/></td>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td align="end">1</td>
                            <td>${tipo?.name || 'null'}</td>
                            <td align="end">${Number(tipo?.price || 0).toFixed(2)}</td>
                            <td align="end">${Number(total || 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <hr/>
                      <table class="table">
                        <tr>
                          <td>Sub Total</td>
                          <td align="end">s/. ${Number(subTotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>IGV</td>
                          <td align="end">s/. ${Number(total - subTotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>TOTAL</td>
                          <td align="end">s/. ${Number(total || 0).toFixed(2)}</td>
                        </tr>
                      </table>
                      <hr/>
                      <p class="text-center font-sm">GRACIAS POR SU COMPRA</p>
                    </div>
                `
                ).join('')}
            </body>
        </html>
    `);
    doc.close();

    // Esperar a que el contenido esté listo antes de imprimir
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Opcional: eliminar el iframe después de imprimir
    iframe.parentNode.removeChild(iframe);
  };
  const imprimirReporte = async (quantity = 1, isClose = false) => {
    const title = isClose ? 'CIERRE DE CAJA' : 'VENTA';
    let total = 0;
    const rows = ticketList.map((ticket) => {
      total += ticket.total;
      return `
      <tr>
      <td align="end">${ticket.quantity || 0}</td>
      <td>${ticket.name || 'null'}</td>
      <td align="end">${Number(ticket.price || 0).toFixed(2)}</td>
      <td align="end">${Number(ticket.total || 0).toFixed(2)}</td>
      </tr>
      `;
    });
    // Si deseas unir todas las filas en un solo string, puedes usar join
    const htmlString = rows.join('');

    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <html>
            <head>
                <title>Imprimir Reporte</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            width: 80mm;
                        }
                        .page {
                            width: 80mm;
                            page-break-after: always;
                            padding: 10px;
                            box-sizing: border-box;
                            line-height: 0.1;
                        }
                        .table{
                          width: 100%;
                        }
                        .table-bordered, .table-bordered th, .table-bordered td, .table-bordered tr{
                          border: 1px solid black;
                        }
                        .text-center {
                          text-align: center;
                        }
                        .font-sm{
                          font-size: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                ${Array.from(
                  { length: quantity },
                  () => `
                    <div class="page">
                      <img src="${API_HOST + user?.negocio?.logo}" width="30%">
                      <h4 class="text-center">${user?.negocio?.name}</h4>
                      <h5 class="text-center">RUC ${user?.negocio?.ruc}</h5>
                      <p class="text-center font-sm">${user?.negocio?.address}</p>
                      <hr/>
                      <h4 class="text-center">REPORTE DE ${title}</h4>
                      <h4 class="text-center">${FechaActualCompleta()}</h4>
                      <hr/>
                      <table class="table">
                        <tr>
                          <td>Usuario</td>
                          <td>: ${user?.name}</td>
                        </tr>
                        <tr>
                          <td>DNI</td>
                          <td>: ${user?.dni}</td>
                          </tr>
                        <tr>
                          <td>Apertura de Caja</td>
                          <td>: ${caja?.opening_datetime}</td>
                        </tr>
                        <tr>
                          <td>Cierre de Caja</td>
                          <td>: ${isClose ? FechaActualCompleta() : '-'}</td>
                        </tr>
                      </table>
                      <hr/>
                      <table class="table">
                        <thead>
                          <tr>
                            <td>Cant.</td>
                            <td>Producto</td>
                            <td align="end">P.U</td>
                            <td align="end">Total</td>
                          </tr>
                          <tr>
                            <td colspan="4"><hr/></td>
                          </tr>
                        </thead>
                        <tbody>${htmlString}</tbody>
                      </table>
                      <hr/>
                      <table class="table">
                        <tr>
                          <td>TOTAL CAJA</td>
                          <td align="end">s/. ${Number(total || 0).toFixed(2)}</td>
                        </tr>
                      </table>
                      <hr/>
                      <p class="text-center font-sm">GRACIAS POR SU COMPRA</p>
                    </div>
                `
                ).join('')}
            </body>
        </html>
    `);
    doc.close();

    // Esperar a que el contenido esté listo antes de imprimir
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Opcional: eliminar el iframe después de imprimir
    iframe.parentNode.removeChild(iframe);
  };
  const setQuantity = async (quantity) => {
    setFormData({ ...formData, quantity: quantity });
  };
  const headerButtons = [
    {
      type: 'button',
      className: 'd-inline',
      color: caja === null ? 'error' : 'success',
      onClick: caja === null ? () => toggleCaja() : () => setIsOpenModalCaja(!isOpenModalCaja),
      icon: <PointOfSale />,
      text: caja === null ? 'CAJA CERRADA' : 'CAJA ABIERTA'
    },
    {
      type: 'button',
      className: 'd-inline',
      color: 'info',
      onClick: () => setIsOpenModalVentas(!isOpenModalVentas),
      icon: <Description />,
      text: 'VENTAS'
    },
    {
      type: 'button',
      className: 'd-inline',
      color: 'warning',
      onClick: () => setIsOpenModalResumen(!isOpenModalResumen),
      icon: <List />,
      text: 'RESUMEN'
    },
    {
      type: 'dropdown',
      className: 'd-inline',
      color: 'info',
      onChangeItem: onChangeDocumento,
      icon: <ReceiptLong />,
      items: documentos.length > 0 ? documentos : [],
      itemSelect: documentos.length > 0 && user ? documentos?.findIndex((objeto) => objeto.id === user?.documento_id) : 0
    },
    {
      type: 'dropdown',
      className: 'd-inline',
      color: 'info',
      onClick: () => impresion(1),
      onChangeItem: onChangePrinter,
      icon: <Print />,
      items: impresoras.length > 0 ? impresoras : [],
      itemSelect: impresoras.length > 0 && user ? impresoras?.findIndex((objeto) => objeto.id === user?.impresora_id) : 0
    }
  ];
  const headerModals = [
    {
      open: isOpenModalCaja,
      onClose: () => setIsOpenModalCaja(!isOpenModalCaja),
      title: caja === null ? '¿Desea abrir su caja?' : '¿Desea cerrar su caja?',
      subtitle: '',
      body: (
        <Alert severity={caja === null ? 'error' : 'success'}>
          <strong>{caja === null ? 'Aún no aperturó su caja' : `Usted aperturó su caja: ${caja.opening_datetime}`}</strong>
        </Alert>
      ),
      textButton: caja === null ? 'Abrir Caja' : 'Cerrar Caja',
      colorButton: 'error',
      onClickButton: () => {
        setIsOpenModalCaja(!isOpenModalCaja);
        toggleCaja();
      }
    },
    {
      open: isOpenModalVentas,
      onClose: () => setIsOpenModalVentas(!isOpenModalVentas),
      title: 'Ventas realizadas',
      subtitle: 'Todas las ventas realizadas en la caja por el usuario',
      body: <TableExpandData data={tickets} columnsTable={columnsTableTicketsVendidos} />,
      textButton: 'Exportar Excel',
      colorButton: 'success',
      onClickButton: () => {
        setIsOpenModalVentas(!isOpenModalVentas);
        exportFilter();
      }
    },
    {
      open: isOpenModalResumen,
      onClose: () => setIsOpenModalResumen(!isOpenModalResumen),
      title: 'Resumen de ventas',
      subtitle: caja === null ? 'Aún no abre su caja' : 'Resumen general de ventas desde que se aperturó su caja.',
      body: <TableResumeModal data={filteredRowsResume} total={totalDinnerCaja} columnsTable={columnsTable} />,
      textButton: 'Generar Reporte',
      colorButton: 'error',
      onClickButton: caja === null ? () => {} : () => generarReporte()
    },
    {
      open: isOpenModalConfig,
      onClose: () => setIsOpenModalConfig(!isOpenModalConfig),
      title: 'Ingresa la cantidad de tickets',
      subtitle: 'Ingrese la cantidad de tickets que desee, pulse el botón verde y pulse Generar Tickets',
      body: (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center">
          <div>
            <LoginButtons className="mx-1" label={'Ingrese la cantidad que desee'} onSubmitLoginForm={setQuantity} />
          </div>
          <h4 style={{ marginTop: 20 }}>Va generar: {formData?.quantity || 0} tickets</h4>
        </div>
      ),
      textButton: 'Generar Tickets',
      colorButton: 'secondary',
      onClickButton: () => {
        const isNotQuantity = !formData.quantity || formData.quantity == 0;
        if (isNotQuantity) {
          notificationSwal('error', 'Agregue una cantidad y pulse el botón verde por favor');
        } else {
          handleSubmit(formData?.tipo_id);
          setIsOpenModalConfig(!isOpenModalConfig);
        }
      }
    }
  ];
  const toggleCaja = async () => {
    if (caja === null) {
      // OPEN BOX
      try {
        const response = await fetchAPIAsync(
          API_URL_CAJA,
          {
            user_id: user?.id
          },
          'POST'
        );
        setCaja(response);
        transformData(response);
        notificationSwal('success', '¡Usted aperturó su caja de forma exitosa!');
      } catch (error) {
        notificationSwal('error', 'No se pudo abrir caja.');
      }
    } else {
      //CLOSE BOX
      try {
        const url = API_URL_CAJA + `cierre/${caja.id}`;
        descargarDocumento(url, 'Reporte_de_ventas');
        notificationSwal('success', '¡Usted cerró su caja de forma exitosa!');
        setCaja(null);
        setTickets([]);
        mapeoDataTickets([], tipos);
        imprimirReporte(1, true);
      } catch (error) {
        notificationSwal('error', 'No se pudo cerrar caja.' + error);
      }
    }
  };
  const exportFilter = async () => {
    try {
      const dataMapeada =
        tickets?.data.map((t) => {
          return {
            id: t.id,
            name: tipos?.find((tt) => tt.id == t.tipo_id)?.name,
            fecha: restarCincoHoras(t.created_at),
            price: t.unit_price,
            quantity: t.quantity,
            total: t.total
          };
        }) || [];
      if (tickets && dataMapeada) {
        exportToExcel(dataMapeada, columnsTicket, `REPORTE TICKETS`);
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  };
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: false });
  };

  // DATA
  useEffect(() => {
    handleLeftDrawerToggle();
    getData();
  }, []);

  // MAIN

  const handleQuantity = (ticket) => {
    if (caja === null) {
      return { success: false, message: 'No se pudo realizar la venta. Aperture su caja primero.' };
    }
    setFormData({ ...formData, quantity: 0, tipo_id: Number(ticket) });
    setIsOpenModalConfig(!isOpenModalConfig);
    return { success: true };
  };

  const handleSubmit = async () => {
    let data = formData;

    const validate = ValidacionItem(data);
    if (!validate?.success) {
      notificationSwal('error', validate?.message);
      return;
    }

    setMessageLoader('Generando...');
    setIsShowLoader(true);

    try {
      await fetchAPIAsync(API_URL_HABITACION + 'bloque', data, 'POST');
      impresion(formData.quantity);
    } catch (error) {
      console.log(error);
    }
    setIsShowLoader(false);
    getData();
  };

  const ValidacionItem = (itemSave) => {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      msgResponse = 'Debe completar los campos obligatorios';
      response = false;
      return response;
    } else {
      if (!itemSave.negocio_id || itemSave.negocio_id == null) {
        msgResponse += '* No pertenece a una Empresa.<br>';
        response = false;
      }
      if (!itemSave.caja_id || itemSave.caja_id == null) {
        msgResponse += '* Aperture su caja primero.<br>';
        response = false;
      }
      if (!itemSave.documento_id || itemSave.documento_id == null) {
        msgResponse += '* No tiene asignado ningun documento(Boleta o Factura) por defecto.<br>';
        response = false;
      }
      if (!itemSave.tipo_id || itemSave.tipo_id == null) {
        msgResponse += '* Selecciona un tipo.<br>';
        response = false;
      }
    }
    return { success: response, message: msgResponse };
  };
  const generarReporte = async () => {
    imprimirReporte();
    const url = API_URL_CAJA + `reporte/${caja.id}`;
    descargarDocumento(url, 'Reporte_de_ventas');
  };
  const getData = async () => {
    setMessageLoader('Cargando datos...');
    setIsShowLoader(true);
    fetch(API_URL_USER + `entrada/${getSession('USER_ID')}`)
      .then((response) => response.json())
      .then((data) => {
        setIsShowLoader(false);
        setUser(data);
        setDocumentos(data?.documentos);
        setImpresoras(data?.impresoras);
        setCaja(data?.caja);
        setTipos(data?.tipotickets);
        setFormData({
          quantity: 0,
          user_id: data?.id,
          negocio_id: data?.negocio_id,
          documento_id: data?.documento_id,
          impresora_id: data?.impresora_id,
          caja_id: data?.caja?.id || 0
        });
        transformData(data?.caja, data?.tipotickets);
      })
      .catch((err) => console.log(err))
      .finally(setIsShowLoader(false));
  };
  const transformData = async (cajaCurrent, tipos) => {
    if (cajaCurrent == null) {
      mapeoDataTickets(tickets, tipos);
      return;
    }
    setFormData((prevFormData) => ({ ...prevFormData, caja_id: cajaCurrent?.id }));
    const response = await fetchAPIAsync(API_URL_CAJA + `habitacion/${cajaCurrent.id}`);
    mapeoDataTickets(response?.habitacion, tipos);
  };
  const mapeoDataTickets = (data, tipos) => {
    setTickets(data);
    // mapeo tipos
    const tiposConCantidad = tipos.map((tipo) => {
      const tickets = data.filter((ticket) => Number(ticket.tipo_id) == tipo.id);
      return {
        ...tipo,
        image: API_HOST + tipo?.image,
        quantity: tickets?.length,
        ventas: tickets?.length,
        total: Number(tipo?.price) * Number(tickets?.length)
      };
    });
    setTicketList(tiposConCantidad);
    if (data?.length > 0) {
      setFilteredRowsResume(tiposConCantidad);
      setTotalDinnerCaja(sumar(tiposConCantidad));
    } else {
      setFilteredRowsResume([]);
      setTotalDinnerCaja(0);
    }
  };
  const sumar = (array) => {
    let suma = array.reduce((acumulador, objetoActual) => {
      if (typeof objetoActual.total === 'number') {
        return acumulador + objetoActual.total;
      } else {
        console.log(`Total no es un número: ${objetoActual.total}`);
        return acumulador;
      }
    }, 0);
    return suma;
  };
  return (
    <>
      <FullScreenLoader message={messageLoader} isShow={isShowLoader} />
      <HeaderInterfaceUser buttons={headerButtons} modals={headerModals} isOnline={true} />
      <MainHabitacions data={ticketList} addTicketFunction={handleQuantity} totalDinnerCaja={totalDinnerCaja} />
    </>
  );
};

export default Habitacion;
