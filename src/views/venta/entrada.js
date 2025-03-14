import React, { useRef } from 'react';
//import { debounce } from 'lodash';
import { columnsTicket } from 'common/ExportColums';
import { exportToExcel } from 'common/MaterialExportToExel';
import {
  createSession,
  deleteSession,
  FechaActualCompleta,
  getOfflinePathImage,
  getSession,
  notificationSwal,
  redirectToRelativePage,
  restarCincoHoras
} from 'common/common';
import MainTickets from 'ui-component/main/mainTickets';
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

const Entrada = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isShowLoader, setIsShowLoader] = useState(false);
  const [messageLoader, setMessageLoader] = useState('Sincronizando, espere un momento...');
  const [isView, setIsView] = useState(false);
  const offline = getSession('OFFLINE');
  if (offline == null) {
    redirectToRelativePage('/#/');
    window.location.reload();
  }
  const metadata = offline.find((u) => u.id == getSession('USER_ID'));

  const websocketRef = useRef(null); // Usar useRef para mantener la referencia del WebSocket

  const [user, setUser] = useState(metadata || {});
  const [caja, setCaja] = useState(metadata?.caja || null);
  const [documentos] = useState(metadata?.documentos || []);
  const [impresoras] = useState(metadata?.impresoras || []);
  const [formData, setFormData] = useState({
    quantity: 1,
    negocio_id: metadata?.negocio_id,
    user_id: metadata?.id,
    documento_id: metadata?.documento_id,
    impresora_id: metadata?.impresora_id,
    caja_id: metadata?.caja?.id || 0
  });
  const [ticketList, setTicketList] = useState([]);
  const [tipos] = useState(metadata?.tipotickets || []);
  const [tickets, setTickets] = useState(getSession('TICKETS') || []);
  const [numberCodes, setNumberCodes] = useState({});
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
    { id: 'name', label: 'TIPO', align: 'center', minWidth: 10 },
    { id: 'code', label: 'CÓDIGO', align: 'center', minWidth: 10 },
    { id: 'quantity', label: 'CANTIDAD', align: 'right', minWidth: 10 },
    { id: 'total', label: 'TOTAL', align: 'right', minWidth: 10 },
    { id: 'created_at', label: 'FECHA Y HORA', align: 'right', minWidth: 10 }
  ];
  const [isOpenModalCaja, setIsOpenModalCaja] = useState(false);
  const [isOpenModalVentas, setIsOpenModalVentas] = useState(false);
  const [isOpenModalResumen, setIsOpenModalResumen] = useState(false);
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
  const pruebaImpresion = async () => {
    try {
      const currentImpresora = impresoras.find((i) => i.id == formData?.impresora_id);
      // Enviar el nuevo ticket al servidor
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        // Enviar un comando para obtener tickets
        const checkPrinterCommand = {
          type: 'check_printer',
          nombre_impresora: currentImpresora?.name // Puedes enviar el ID de la caja o cualquier otro dato necesario
        };
        websocketRef.current.send(JSON.stringify(checkPrinterCommand));
      } else {
        notificationSwal('error', 'WebSocket no está abierto');
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
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
      itemSelect: documentos.length > 0 && user ? documentos.findIndex((objeto) => objeto.id === user?.documento_id) : 0
    },
    {
      type: 'dropdown',
      className: 'd-inline',
      color: 'info',
      onClick: () => pruebaImpresion(),
      onChangeItem: onChangePrinter,
      icon: <Print />,
      items: impresoras.length > 0 ? impresoras : [],
      itemSelect: impresoras.length > 0 && user ? impresoras.findIndex((objeto) => objeto.id === user?.impresora_id) : 0
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
      onClickButton: () => generarReporte()
    }
  ];
  const toggleCaja = async () => {
    if (caja === null) {
      // OPEN BOX
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        setMessageLoader('Aperturando caja, espere un momento...');
        setIsShowLoader(true);
        const openCajaCommand = {
          type: 'open_caja',
          caja: {
            numeros_sms: metadata?.negocio?.numeros_sms,
            sede: metadata?.negocio?.sede,
            dni: metadata?.dni,
            user_id: metadata?.id,
            id: metadata?.id + generarCodigoTemporal() + String(Math.floor(Math.random() * 1000)),
            opening_datetime: FechaActualCompleta()
          },
          connection: isOnline
        };
        websocketRef.current.send(JSON.stringify(openCajaCommand));
      } else {
        notificationSwal('error', 'WebSocket no está abierto');
        window.location.reload();
      }
    } else {
      //CLOSE BOX
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        const impresora = impresoras.find((impresora) => impresora.id == formData.impresora_id);
        if (isOnline && (getSession('OFFLINE_OPEN_CAJAS') || getSession('OFFLINE_CLOSE_CAJAS') || getSession('OFFLINE_TICKETS'))) {
          setMessageLoader('Sincronizando, espere un momento...');
          setIsShowLoader(true);
          // Enviar un comando para sincronizar los datos con la base de datos
          const sincronizationToDBCommand = {
            type: 'sincronization_to_db',
            offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
            offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
            offline_tickets: getSession('OFFLINE_TICKETS') || null
          };
          websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
        }

        setMessageLoader('Cerrando caja, espere un momento...');
        setIsShowLoader(true);
        const closeCajaCommand = {
          type: 'close_caja',
          caja: {
            numeros_sms: metadata?.negocio?.numeros_sms,
            token_reporte: metadata?.negocio?.token_reporte,
            sede: metadata?.negocio?.sede,
            dni: metadata?.dni,
            id: metadata?.caja?.id,
            closing_datetime: FechaActualCompleta(),
            info: {
              logo: splitName(metadata?.negocio?.logo),
              name: metadata?.negocio?.name,
              ruc: metadata?.negocio?.ruc,
              address: metadata?.negocio?.address,
              sede: metadata?.negocio?.sede,
              empleado: metadata?.name,
              apertura: metadata?.caja?.opening_datetime,
              cierre: FechaActualCompleta()
            },
            items: filteredRowsResume,
            nombre_impresora: impresora?.name
          },
          connection: isOnline
        };
        websocketRef.current.send(JSON.stringify(closeCajaCommand));
        deleteSession('TICKETS');
        deleteSession('CODE');
        setTickets([]);
        // Eliminar los contadores de sessionStorage
        deleteSession('NUMBER_CODES');

        // Reiniciar el estado de numberCodes
        setNumberCodes({}); // Reiniciar todos los contadores a cero
        mapeoDataTickets([], tipos);
      } else {
        notificationSwal('error', 'WebSocket no está abierto');
        window.location.reload();
      }
    }
  };
  const exportFilter = async () => {
    try {
      const dataMapeada =
        tickets?.data.map((t) => {
          return {
            id: t.id,
            name: tipos.find((tt) => tt.id == t.tipo_id)?.name,
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
  // CONEXION A INTERNET
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup the event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // CONEXION A WEBSOCKET
  useEffect(() => {
    websocketRef.current = new WebSocket('ws://localhost:8080/');

    websocketRef.current.onopen = () => {
      setIsView(true);
      console.log('Conectado al servidor WebSocket');
      if (isOnline && (getSession('OFFLINE_OPEN_CAJAS') || getSession('OFFLINE_CLOSE_CAJAS') || getSession('OFFLINE_TICKETS'))) {
        setMessageLoader('Sincronizando, espere un momento...');
        setIsShowLoader(true);
        // Enviar un comando para sincronizar los datos con la base de datos
        const sincronizationToDBCommand = {
          type: 'sincronization_to_db',
          offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
          offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
          offline_tickets: getSession('OFFLINE_TICKETS') || null
        };
        websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
      }
    };

    websocketRef.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      // Manejar la respuesta según el tipo de mensaje
      if (receivedData.type === 'add_ticket') {
        // AGREGAR TICKETS

        const newTicket = receivedData.ticket;

        const oldTicket = getSession('TICKETS') || [];
        const allTickets = [...oldTicket, newTicket];
        createSession('TICKETS', allTickets);

        const oldOfflineTicket = getSession('OFFLINE_TICKETS') || [];
        const allOfflineTickets = [...oldOfflineTicket, newTicket];
        createSession('OFFLINE_TICKETS', allOfflineTickets);

        mapeoDataTickets(allTickets, tipos);
        setTickets((prevTickets) => [...prevTickets, newTicket]);

        // AGREGAR APERTURA DE CAJA OFFLINE
      } else if (receivedData.type === 'offline_open') {
        const oldOffline = getSession('OFFLINE_OPEN_CAJAS') || [];
        const allOffline = [...oldOffline, receivedData.caja];
        createSession('OFFLINE_OPEN_CAJAS', allOffline);

        // AGREGAR CIERRE DE CAJA OFFLINE
      } else if (receivedData.type === 'offline_close') {
        const oldOffline = getSession('OFFLINE_CLOSE_CAJAS') || [];
        const allOffline = [...oldOffline, receivedData.caja];
        createSession('OFFLINE_CLOSE_CAJAS', allOffline);

        // ENVIO DE TICKETS A DB
      } else if (receivedData.type === 'offline_tickets') {
        if (receivedData.tickets == null) {
          deleteSession('OFFLINE_TICKETS');
        } else {
          createSession('OFFLINE_TICKETS', receivedData.tickets);
        }
        setIsShowLoader(false);

        // ENVIO DE APERTURA DE CAJAS A DB
      } else if (receivedData.type === 'offline_open_cajas') {
        if (receivedData.cajas == null) {
          deleteSession('OFFLINE_OPEN_CAJAS');
        } else {
          createSession('OFFLINE_OPEN_CAJAS', receivedData.cajas);
        }

        // ENVIO DE CIERRE DE CAJAS A DB
      } else if (receivedData.type === 'offline_close_cajas') {
        if (receivedData.cajas == null) {
          deleteSession('OFFLINE_CLOSE_CAJAS');
        } else {
          createSession('OFFLINE_CLOSE_CAJAS', receivedData.cajas);
        }

        // OBTENER ACTUAL CAJA
      } else if (receivedData.type === 'get_caja') {
        const newMetaData = { ...metadata, caja: receivedData.caja };
        setUser(newMetaData);
        setCaja(newMetaData?.caja);
        setFormData({ ...formData, caja_id: newMetaData?.caja?.id || 0 });
        const newOffline = [...offline.filter((f) => f.id != metadata?.id), newMetaData];
        createSession('OFFLINE', newOffline);
        setIsShowLoader(false);
      }
    };

    websocketRef.current.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
      setIsView(false);
    };

    return () => {
      websocketRef.current.close(); // Cerrar el WebSocket al desmontar el componente
    };
  }, []);
  // DATA
  useEffect(() => {
    handleLeftDrawerToggle();
    mapeoDataTickets(tickets, tipos);
  }, []);
  // Guardar los contadores en sessionStorage cada vez que cambien
  useEffect(() => {
    createSession('NUMBER_CODES', JSON.stringify(numberCodes));
  }, [numberCodes]);

  // MAIN
  const handleSubmit = async (ticket) => {
    if (((tickets.length > 0 && tickets.length % 100 === 0) || getSession('OFFLINE_TICKETS')?.length >= 500) && isOnline) {
      setMessageLoader('Sincronizando, espere un momento...');
      setIsShowLoader(true);
      // Enviar un comando para sincronizar los datos con la base de datos
      const sincronizationToDBCommand = {
        type: 'sincronization_to_db',
        offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
        offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
        offline_tickets: getSession('OFFLINE_TICKETS') || null
      };
      websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
    }

    const idTicket = Number(ticket);

    if (caja === null) {
      return { success: false, message: 'No se pudo realizar la venta. Aperture su caja primero.' };
    }
    const validate = ValidacionItem(formData);
    if (!validate?.success) {
      return { success: false, message: validate?.message };
    }
    const tipoTicket = ticketList.find((tipo) => tipo.id == idTicket);
    const impresora = impresoras.find((impresora) => impresora.id == formData.impresora_id);
    const impresora2 = impresoras.find((impresora) => impresora.id != formData.impresora_id);
    console.log(tipoTicket, numberCodes[idTicket] || tipoTicket.quantity + 1);
    
    const data = {
      ...formData,
      tipo_id: idTicket,
      logo: splitName(metadata?.negocio?.logo),
      name: tipoTicket?.name,
      unit_price: tipoTicket?.price,
      total: tipoTicket?.price * formData.quantity,
      barcode: generarCodigoUnico(),
      code: obtenerCodigo(numberCodes[idTicket] || tipoTicket.quantity + 1),
      nombre_impresora: impresora?.name,
      nombre_impresora_aux: impresora2?.name,
      created_at: FechaActualCompleta()
    };

    // Enviar el nuevo ticket al servidor
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      // Enviar un comando para agregar tickets
      const addTicketsCommand = {
        type: 'add_ticket',
        itemsave: data,
        connection: isOnline
      };
      websocketRef.current.send(JSON.stringify(addTicketsCommand));

      // Actualizar el contador para el tipo de ticket correspondiente
      setNumberCodes((prevNumberCodes) => {
        const newCount = (prevNumberCodes[idTicket] || tipoTicket.quantity + 1) + 1; // Incrementar el contador del tipo de ticket
        return {
          ...prevNumberCodes,
          [idTicket]: newCount
        };
      });
      return { success: true };
    } else {
      return { success: false, message: 'WebSocket no está abierto' };
    }
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
      if (!itemSave.impresora_id || itemSave.impresora_id == null) {
        msgResponse += '* No tiene asignado ninguna impresora por defecto.<br>';
        response = false;
      }
    }
    return { success: response, message: msgResponse };
  };
  const generarReporte = () => {
    if (caja === null) {
      notificationSwal('error', 'No se pudo generar el reporte. Aperture su caja primero.');
      return;
    }
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const impresora = impresoras.find((impresora) => impresora.id == formData.impresora_id);
      const generarReporteCommand = {
        type: 'report_generate',
        reportdata: {
          info: {
            logo: splitName(metadata?.negocio?.logo),
            name: metadata?.negocio?.name,
            ruc: metadata?.negocio?.ruc,
            address: metadata?.negocio?.address,
            sede: metadata?.negocio?.sede,
            empleado: metadata?.name,
            apertura: metadata?.caja?.opening_datetime,
            cierre: FechaActualCompleta()
          },
          items: filteredRowsResume,
          nombre_impresora: impresora?.name
        }
      };
      websocketRef.current.send(JSON.stringify(generarReporteCommand));
    } else {
      notificationSwal('error', 'WebSocket no está abierto');
      window.location.reload();
    }
  };
  const mapeoDataTickets = (data, tipos) => {
    // mapeo tipos
    const tiposConCantidad = tipos.map((tipo) => {
      const tickets = data.filter((ticket) => Number(ticket.tipo_id) == tipo.id);
      return {
        ...tipo,
        image: getOfflinePathImage(tipo?.image),
        quantity: tickets?.length,
        ventas: tickets?.length,
        total: Number(tipo?.price) * Number(tickets?.length)
      };
    });
    setTicketList(tiposConCantidad);
    if (data?.length > 0) {
      console.log(tiposConCantidad);
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
  function generarCodigoTemporal() {
    // Crear un objeto Date a partir de la cadena
    const fechaHora = new Date(FechaActualCompleta());

    // Formatear la fecha y hora en el formato deseado "AAMMDDHHMMSS"
    const anio = String(fechaHora.getFullYear()).slice(-2);
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const horas = String(fechaHora.getHours()).padStart(2, '0');
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
    const segundos = String(fechaHora.getSeconds()).padStart(2, '0');

    const codigoFechaHora = `${anio}${mes}${dia}${horas}${minutos}${segundos}`;
    return codigoFechaHora;
  }
  function generarCodigoUnico() {
    // Crear un objeto Date a partir de la cadena
    const fechaHora = new Date(FechaActualCompleta());

    // Formatear la fecha y hora en el formato deseado "AAMMDDHHMMSS"
    const anio = String(fechaHora.getFullYear()).slice(-2);
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const horas = String(fechaHora.getHours()).padStart(2, '0');
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
    const segundos = String(fechaHora.getSeconds()).padStart(2, '0');

    const codigoFechaHora = `${anio}${mes}${dia}${horas}${minutos}${segundos}`;

    let codigoUnico;
    do {
      codigoUnico = metadata?.id + codigoFechaHora + String(Math.floor(Math.random() * 1000));
    } while (tickets.find((t) => t.barcode === codigoUnico));

    return codigoUnico;
  }
  const obtenerCodigo = (numero) => {
    // Obtener la segunda palabra de la cadena
    const palabras = metadata?.name.split(' ');
    if (palabras.length < 2) {
      throw new Error('La cadena debe contener al menos dos palabras.');
    }
    const inicialSegundaPalabra = palabras[1].charAt(0).toUpperCase(); // Obtener la inicial y convertir a mayúscula

    // Formatear el número a 5 dígitos con ceros a la izquierda
    const numeroFormateado = String(numero).padStart(5, '0');

    // Concatenar la inicial con el número formateado
    return `${inicialSegundaPalabra}-${numeroFormateado}`;
  };
  const splitName = (name) => {
    return name.split('/').pop();
  };
  return isView ? (
    <>
      <FullScreenLoader message={messageLoader} isShow={isShowLoader} />
      <HeaderInterfaceUser buttons={headerButtons} modals={headerModals} isOnline={isOnline} />
      <MainTickets data={ticketList} addTicketFunction={handleSubmit} totalDinnerCaja={totalDinnerCaja} />
    </>
  ) : (
    <div className="h2 text-center text-white">Desconectado del servidor WebSocket</div>
  );
};

export default Entrada;
