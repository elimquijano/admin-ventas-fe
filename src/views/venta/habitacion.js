import React, { useRef } from 'react';
import { columnsTicket } from 'common/ExportColums';
import { exportToExcel } from 'common/MaterialExportToExel';
import {
  getSession,
  notificationSwal,
  deleteSession,
  FechaActualCompleta,
  createSession,
  numeroALetras,
  getOfflinePathImage,
  redirectToRelativePage
} from 'common/common';
import TableResumeModal from 'ui-component/table/TableResumeModal';
import { useEffect } from 'react';
import { useState } from 'react';
import { Description, List, PointOfSale, Print, ReceiptLong } from '@mui/icons-material';
import LoginButtons from 'ui-component/loginButtons/loginButtons';
import { Alert, Paper } from '@mui/material';
import { useDispatch } from 'react-redux';
import { SET_MENU } from 'store/actions';
import TableExpandData from 'ui-component/table/TableExpandData';
import HeaderInterfaceUser from 'ui-component/subheader/headerInterfaceUser';
import FullScreenLoader from 'ui-component/loader/FullScreenLoader';
import MainHabitacion from 'ui-component/main/mainHabitacion';

const HabitacionPage = () => {
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

  const [cliente, setCliente] = useState({});
  const [clientes, setClientes] = useState(metadata.negocio.clientes || []);
  const [user, setUser] = useState(metadata || {});
  const [caja, setCaja] = useState(metadata?.caja || null);
  const [documentos] = useState(metadata?.documentos || []);
  const [impresoras] = useState(metadata?.impresoras || []);
  const [formHabitacion, setFormHabitacion] = useState(
    {
      negocio_id: metadata?.negocio_id,
      user_id: metadata?.id,
      documento_id: metadata?.documento_id,
      impresora_id: metadata?.impresora_id,
      caja_id: metadata?.caja?.id || 0,
      cliente_id: null
    } || {}
  );
  const [productos, setProductos] = useState(metadata?.productos || []);
  const [habitaciones, setHabitaciones] = useState(getSession('HABITACION') || []);
  const [resume, setResume] = useState([]);
  const [totalDinnerCaja, setTotalDinnerCaja] = useState(0);

  const columnsResumen = [
    { id: 'id', label: 'ID', align: 'right', minWidth: 5, key: 0 },
    { id: 'name', label: 'Nombre', align: 'left', minWidth: 180, key: 1 },
    { id: 'price', label: 'Precio Unitario', align: 'right', minWidth: 20, key: 3 },
    { id: 'quantity', label: 'Cantidad', align: 'right', minWidth: 10, key: 4 },
    { id: 'total', label: 'Total', align: 'right', minWidth: 20, key: 5 }
  ];
  const columnsTableHabitaciones = [
    { id: 'id', label: 'ID', align: 'right', minWidth: 10 },
    { id: 'folio', label: 'BOLETA DE VENTA', align: 'center', minWidth: 10 },
    { id: 'total', label: 'TOTAL', align: 'center', minWidth: 10 }
  ];

  const [isOpenModalCaja, setIsOpenModalCaja] = useState(false);
  const [isOpenModalHabitaciones, setIsOpenModalHabitaciones] = useState(false);
  const [isOpenModalResumen, setIsOpenModalResumen] = useState(false);
  const [isOpenModalConfig, setIsOpenModalConfig] = useState(false);
  const onChangeDocumento = async (id) => {
    if (documentos.length < 1) {
      return { success: false };
    }
    const documento = documentos.find((doc) => doc.id === id);
    setFormHabitacion({ ...formHabitacion, documento_id: id, serie: documento?.serie, numero: documento?.numero });
    return { success: true };
  };
  const onChangePrinter = async (id) => {
    if (impresoras.length < 1) {
      return { success: false };
    }
    setFormHabitacion({ ...formHabitacion, impresora_id: id });
    return { success: true };
  };
  const pruebaImpresion = async () => {
    try {
      const currentImpresora = impresoras.find((i) => i.id == formHabitacion?.impresora_id);
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
  const searchCliente = async (ruc) => {
    await fetch('https://apiperu.dev/api/ruc', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer 27979c4825749caf1d156e747b61b1317c13487ac42ce18d5a66c079b55ce5a1'
      },
      body: JSON.stringify({
        ruc: ruc
      })
    })
      .then((response) => response.json())
      .then((data) => {
        const newCliente = {
          name: data?.data.nombre_o_razon_social,
          address: data?.data.direccion,
          document_number: data?.data.ruc,
          document_type: 'RUC'
        };
        setCliente(newCliente);
      })
      .catch((error) => {
        console.error('Error al obtener informacion del cliente: ', error);
      });
  };
  const addCliente = (cliente) => {
    let newCliente = cliente;
    if (!newCliente.name || !newCliente.document_number || !newCliente.document_type) {
      notificationSwal('error', 'Todos los campos son obligatorios');
      return;
    }

    newCliente.id = `${newCliente.document_number}${metadata?.negocio_id}`;
    newCliente.address = cliente?.address || null;
    newCliente.negocio_id = metadata?.negocio_id;
    newCliente.created_at = FechaActualCompleta();

    const allCliente = getSession('OFFLINE_CLIENTES') || [];

    if (clientes.find((c) => c.id == newCliente.id) == undefined) {
      createSession('OFFLINE_CLIENTES', [...allCliente, newCliente]);
      setClientes((newValue) => [...newValue, newCliente]);
      const negocio = metadata?.negocio;
      const newNegocio = { ...negocio, clientes: [...clientes, newCliente] };
      const newMetaData = { ...metadata, negocio: newNegocio };
      const newOffline = [...offline.filter((f) => f.id != metadata?.id), newMetaData];
      createSession('OFFLINE', newOffline);
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
      color: 'secondary',
      onClick: () => setIsOpenModalHabitaciones(!isOpenModalHabitaciones),
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
      open: isOpenModalHabitaciones,
      onClose: () => setIsOpenModalHabitaciones(!isOpenModalHabitaciones),
      title: 'Ventas realizadas',
      subtitle: 'Todas las ventas realizadas en la caja por el usuario',
      body: <TableExpandData data={habitaciones} columnsTable={columnsTableHabitaciones} />,
      textButton: 'Exportar Excel',
      colorButton: 'success',
      onClickButton: () => {
        setIsOpenModalHabitaciones(!isOpenModalHabitaciones);
        exportFilter();
      }
    },
    {
      open: isOpenModalResumen,
      onClose: () => setIsOpenModalResumen(!isOpenModalResumen),
      title: 'Resumen de habitaciones',
      subtitle: caja === null ? 'Aún no abre su caja' : 'Resumen general de habitaciones desde que se aperturó su caja.',
      body: <TableResumeModal data={resume} total={totalDinnerCaja} columnsTable={columnsResumen.filter((column) => column.id !== 'id')} />,
      textButton: 'Generar Reporte',
      colorButton: 'error',
      onClickButton: () => generarReporte()
    },
    {
      open: isOpenModalConfig,
      onClose: () => setIsOpenModalConfig(!isOpenModalConfig),
      title: 'Buscar Cliente',
      subtitle: 'Para usar factura electrónica tiene que asignar el cliente',
      body: (
        <div className="container-fluid d-flex justify-content-center align-items-center">
          <LoginButtons className="mx-1" label={'Ingrese el RUC'} onSubmitLoginForm={searchCliente} />
          <Paper className="mx-1 p-4">
            {cliente.ruc ? (
              <>
                <h4>Información del Cliente</h4>
                <h6>
                  <strong>RUC: </strong>
                  <span>{cliente?.ruc}</span>
                </h6>
                <h6>
                  <strong>Nombre o Razón Social: </strong>
                  <span>{cliente?.name}</span>
                </h6>
                <h6>
                  <strong>Dirección: </strong>
                  <span>{cliente?.address}</span>
                </h6>
                <h6>
                  <strong>Estado: </strong>
                  <span>{cliente?.estado}</span>
                </h6>
              </>
            ) : (
              <h6>No se encontró</h6>
            )}
          </Paper>
        </div>
      ),
      textButton: 'Agregar Cliente',
      colorButton: 'success',
      onClickButton: () => {
        addCliente(cliente);
        setIsOpenModalConfig(!isOpenModalConfig);
      }
    }
  ];
  const transformData = async (currentVentas) => {
    if (currentVentas) {
      const updateQuantity = productos.map((producto) => {
        const price = producto?.price;
        const clientes =
          currentVentas
            .filter((venta) => venta.producto_id === producto.id)
            .map((h) => {
              return { ...h.cliente };
            }) || [];
        return {
          ...producto,
          image: getOfflinePathImage(producto.image),
          quantity: String(clientes.length),
          total: clientes.length * price,
          clientes: clientes
        };
      });
      setTotalDinnerCaja(sumar(updateQuantity));
      setResume(updateQuantity.filter((producto) => producto.clientes.length !== 0));
      setProductos(updateQuantity);
    }
  };
  const toggleCaja = async () => {
    if (caja === null) {
      // OPEN
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
        const impresora = impresoras.find((impresora) => impresora.id == formHabitacion.impresora_id);
        if (
          isOnline &&
          (getSession('OFFLINE_OPEN_CAJAS') ||
            getSession('OFFLINE_CLOSE_CAJAS') ||
            getSession('OFFLINE_CLIENTES') ||
            getSession('OFFLINE_HABITACIONES'))
        ) {
          setMessageLoader('Sincronizando, espere un momento...');
          setIsShowLoader(true);
          // Enviar un comando para sincronizar los datos con la base de datos
          const sincronizationToDBCommand = {
            type: 'sincronization_to_db',
            offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
            offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
            offline_clientes: getSession('OFFLINE_CLIENTES') || null,
            update_documentos: getSession('LATEST_NUMBER') || null,
            offline_habitaciones: getSession('OFFLINE_HABITACIONES') || null
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
            items: resume,
            nombre_impresora: impresora?.name
          },
          connection: isOnline
        };
        websocketRef.current.send(JSON.stringify(closeCajaCommand));
      } else {
        notificationSwal('error', 'WebSocket no está abierto');
        window.location.reload();
      }
    }
  };
  const exportFilter = async () => {
    try {
      const dataMapeada =
        habitaciones?.data.map((t) => {
          return {
            id: t.id,
            name: tipos.find((tt) => tt.id == t.tipo_id)?.name,
            fecha: restarCincoHoras(t.created_at),
            price: t.unit_price,
            quantity: t.quantity,
            total: t.total
          };
        }) || [];
      if (habitaciones && dataMapeada) {
        exportToExcel(dataMapeada, columnsTicket, `REPORTE VENTAS`);
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  };
  const handleSubmit = async (clienteInfo, idProducto) => {
    if (((habitaciones.length > 0 && habitaciones.length % 10 === 0) || getSession('OFFLINE_HABITACIONES')?.length >= 100) && isOnline) {
      setMessageLoader('Sincronizando, espere un momento...');
      setIsShowLoader(true);
      // Enviar un comando para sincronizar los datos con la base de datos
      const sincronizationToDBCommand = {
        type: 'sincronization_to_db',
        offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
        offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
        offline_clientes: getSession('OFFLINE_CLIENTES') || null,
        update_documentos: getSession('LATEST_NUMBER') || null,
        offline_habitaciones: getSession('OFFLINE_HABITACIONES') || null
      };
      websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
    }

    if (caja === null) {
      return { success: false, message: 'No se pudo realizar la venta. Aperture su caja primero.' };
    }

    let data = formHabitacion;

    const documento = documentos.find((doc) => doc.id === data?.documento_id);
    if (documento?.name == 'FACTURA ELECTRONICA') {
      if (Object.keys(cliente).length === 0) {
        setIsOpenModalConfig(!isOpenModalConfig);
        return { success: false, message: 'Primero agregue un cliente para usar ' + documento?.name };
      } else {
        data.cliente = cliente;
        data.cliente_id = `${cliente?.document_number}${metadata?.negocio_id}`;
        data.total_letras = String(numeroALetras(Number(total))).toUpperCase();
        setCliente({});
      }
    } else {
      addCliente(clienteInfo);
      data.cliente = clienteInfo;
      data.cliente_id = `${clienteInfo?.document_number}${metadata?.negocio_id}`;
    }

    const validate = ValidacionItemSave(data);
    if (!validate?.success) {
      return { success: false, message: validate?.message };
    }

    const impresora = impresoras.find((impresora) => impresora.id == data.impresora_id);
    const producto = productos.find((producto) => producto.id == idProducto);
    const currentDocument = getSession('LATEST_NUMBER').find((ln) => ln.documento_id == data.documento_id);

    data.detalles_venta = [{ quantity: 1, name: producto?.name, price: producto?.price, total: producto?.price }];
    data.producto_id = producto?.id;
    data.quantity = 1;
    data.unit_price = producto?.price;
    data.total = producto?.price;
    data.serie = documento?.serie;
    data.numero = currentDocument?.numero;
    data.folio = documento?.serie + '-' + String(currentDocument?.numero).padStart(6, '0');
    data.logo = splitName(metadata?.negocio?.logo);
    data.nombre_documento = documento?.name;
    data.nombre_impresora = impresora?.name;
    data.nombre_negocio = metadata.negocio.name;
    data.ruc_negocio = metadata.negocio.ruc;
    data.address_negocio = metadata.negocio.address;
    data.created_at = FechaActualCompleta();

    // Enviar la nueva venta al servidor
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      // Enviar un comando para obtener habitaciones
      const addHabitacionCommand = {
        type: 'add_habitacion',
        itemsave: data,
        connection: isOnline
      };
      websocketRef.current.send(JSON.stringify(addHabitacionCommand));
      return { success: true };
    } else {
      return { success: false, message: 'WebSocket no está abierto' };
    }
  };
  function ValidacionItemSave(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      msgResponse = 'Debe completar los campos obligatorios';
      response = false;
    } else {
      if (!itemSave.negocio_id || itemSave.negocio_id == null) {
        msgResponse += '* No pertenece a una Empresa.<br>';
        response = false;
      }
      if (!itemSave.caja_id || itemSave.caja_id == null) {
        msgResponse += '* Aperture su caja primero.<br>';
        response = false;
      }
      if (!itemSave.cliente_id || itemSave.cliente_id == null) {
        msgResponse += '* No tiene ningun cliente asignado.<br>';
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
  }
  const generarReporte = () => {
    if (caja === null) {
      notificationSwal('error', 'No se pudo generar el reporte. Aperture su caja primero.');
      return;
    }
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      const impresora = impresoras.find((impresora) => impresora.id == formHabitacion.impresora_id);
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
          items: resume,
          nombre_impresora: impresora?.name
        }
      };
      websocketRef.current.send(JSON.stringify(generarReporteCommand));
    } else {
      notificationSwal('error', 'WebSocket no está abierto');
      window.location.reload();
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
      if (isOnline && (getSession('OFFLINE_OPEN_CAJAS') || getSession('OFFLINE_CLOSE_CAJAS') || getSession('OFFLINE_HABITACIONES'))) {
        setMessageLoader('Sincronizando, espere un momento...');
        setIsShowLoader(true);
        // Enviar un comando para sincronizar los datos con la base de datos
        const sincronizationToDBCommand = {
          type: 'sincronization_to_db',
          offline_cajas_open: getSession('OFFLINE_OPEN_CAJAS') || null,
          offline_cajas_close: getSession('OFFLINE_CLOSE_CAJAS') || null,
          offline_clientes: getSession('OFFLINE_CLIENTES') || null,
          update_documentos: getSession('LATEST_NUMBER') || null,
          offline_habitaciones: getSession('OFFLINE_HABITACIONES') || null
        };
        websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
      }
    };

    websocketRef.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      // Manejar la respuesta según el tipo de mensaje
      if (receivedData.type === 'add_habitacion') {
        // AGREGAR HABITACION

        const newHabitacion = receivedData.habitacion;

        const oldHabitacion = getSession('HABITACION') || [];
        const allHabitacion = [...oldHabitacion, newHabitacion];
        createSession('HABITACION', allHabitacion);

        const oldOfflineVentas = getSession('OFFLINE_HABITACIONES') || [];
        const allOfflineVentas = [...oldOfflineVentas, newHabitacion];
        createSession('OFFLINE_HABITACIONES', allOfflineVentas);

        setHabitaciones(allHabitacion);
        transformData(allHabitacion);
        const numeroDoc = getSession('LATEST_NUMBER').find((d) => d.documento_id == newHabitacion.documento_id);
        createSession('LATEST_NUMBER', [
          ...getSession('LATEST_NUMBER').filter((f) => f.documento_id != newHabitacion.documento_id),
          { documento_id: numeroDoc.documento_id, numero: numeroDoc.numero + 1 }
        ]);

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

        // ENVIO DE VENTAS A DB
      } else if (receivedData.type === 'offline_habitaciones') {
        if (receivedData.habitaciones == null) {
          deleteSession('OFFLINE_HABITACIONES');
        } else {
          createSession('OFFLINE_HABITACIONES', receivedData.habitaciones);
        }
        setIsShowLoader(false);

        // ENVIO DE CLIENTES A DB
      } else if (receivedData.type === 'offline_clientes') {
        if (receivedData.clientes == null) {
          deleteSession('OFFLINE_CLIENTES');
        } else {
          createSession('OFFLINE_CLIENTES', receivedData.clientes);
        }

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
        if (receivedData.caja == null) {
          deleteSession('HABITACION');
          setHabitaciones([]);
          transformData([]);
        }
        const newMetaData = { ...metadata, caja: receivedData.caja };
        setUser(newMetaData);
        setCaja(newMetaData?.caja);
        setFormHabitacion({ ...formHabitacion, caja_id: newMetaData?.caja?.id || 0 });
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
    transformData(habitaciones);
  }, []);
  // ACTUALIZAR CLIENTES
  useEffect(() => {
    const negocio = metadata?.negocio;
    const newNegocio = { ...negocio, clientes: clientes };
    const newMetaData = { ...metadata, negocio: newNegocio };
    const newOffline = [...offline.filter((f) => f.id != metadata?.id), newMetaData];
    createSession('OFFLINE', newOffline);
  }, [clientes]);
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
  const splitName = (name) => {
    return name.split('/').pop();
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
  /* return (
    <>
      <FullScreenLoader message={messageLoader} isShow={isShowLoader} />
      <HeaderInterfaceUser buttons={headerButtons} modals={headerModals} />
      <MainHabitacion productos={productos} totalDinnerCaja={totalDinnerCaja} handleSubmit={handleSubmit} />
    </>
  ); */
  return isView ? (
    <>
      <FullScreenLoader message={messageLoader} isShow={isShowLoader} />
      <HeaderInterfaceUser buttons={headerButtons} modals={headerModals} />
      <MainHabitacion productos={productos} clientes={clientes} totalDinnerCaja={totalDinnerCaja} handleSubmit={handleSubmit} />
    </>
  ) : (
    <div className="h2 text-center text-white">Desconectado del servidor WebSocket</div>
  );
};

export default HabitacionPage;
