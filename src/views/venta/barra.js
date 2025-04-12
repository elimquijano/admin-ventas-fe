import React from 'react';
import { columnsTicket } from 'common/ExportColums';
import { exportToExcel } from 'common/MaterialExportToExel';
import {
  getSession,
  notificationSwal,
  FechaActualCompleta,
  createSession,
  API_URL_USER,
  API_URL_CAJA,
  fetchAPIAsync,
  descargarDocumento,
  API_URL_VENTA
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
import MainProducts from 'ui-component/main/mainProducts';
import FullScreenLoader from 'ui-component/loader/FullScreenLoader';
import axios from 'axios';

const Productos = () => {
  const websocketRef = React.useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isShowLoader, setIsShowLoader] = useState(false);
  const [messageLoader, setMessageLoader] = useState('Sincronizando, espere un momento...');
  const [metadata, setMetadata] = useState({});
  const [cliente, setCliente] = useState({});
  const [clientes, setClientes] = useState([]);
  const [user, setUser] = useState({});
  const [caja, setCaja] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [impresoras, setImpresoras] = useState([]);
  const [formVenta, setFormVenta] = useState({});
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [detVentasResume, setDetVentasResume] = useState([]);
  const [totalDinnerCaja, setTotalDinnerCaja] = useState(0);
  const [categoriaSelected, setCategoriaSelected] = useState(0);

  const columnsResumen = [
    { id: 'id', label: 'ID', align: 'right', minWidth: 5, key: 0 },
    { id: 'name', label: 'Nombre', align: 'left', minWidth: 180, key: 1 },
    { id: 'price', label: 'Precio Unitario', align: 'right', minWidth: 20, key: 3 },
    { id: 'amount_start', label: 'Stock Inicio', align: 'right', minWidth: 20, key: 4 },
    { id: 'quantity', label: 'Vendidos', align: 'right', minWidth: 10, key: 5 },
    { id: 'amount_end', label: 'Stock Fin', align: 'right', minWidth: 20, key: 6 },
    { id: 'total', label: 'Total', align: 'right', minWidth: 20, key: 7 }
  ];
  const columnsTableVentas = [
    { id: 'id', label: 'ID', align: 'right', minWidth: 10 },
    { id: 'folio', label: 'BOLETA DE VENTA', align: 'center', minWidth: 10 },
    { id: 'total', label: 'TOTAL', align: 'center', minWidth: 10 }
  ];

  const [isOpenModalCaja, setIsOpenModalCaja] = useState(false);
  const [isOpenModalVentas, setIsOpenModalVentas] = useState(false);
  const [isOpenModalResumen, setIsOpenModalResumen] = useState(false);
  const [isOpenModalConfig, setIsOpenModalConfig] = useState(false);

  useEffect(() => {
    handleLeftDrawerToggle();
    const fetchInitData = async () => {
      const url = API_URL_USER + `barra/${getSession('USER_ID')}`;
      await fetch(url, { method: 'GET' })
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data);
          setClientes(data?.negocio?.clientes);
          setUser(data);
          setCaja(data?.caja);
          setDocumentos(data?.documentos);
          setImpresoras(data?.impresoras);
          setFormVenta({
            negocio_id: data?.negocio_id,
            user_id: data?.id,
            documento_id: data?.documento_id,
            impresora_id: data?.impresora_id,
            //caja_id: data?.caja?.id || 0,
            cliente_id: null
          });
          setProductos(data?.productos);
          transformData(data?.productos);
          setCategorias(data?.negocio?.categorias);
        })
        .catch((error) => {
          console.error('Error al obtener informacion de la barra: ', error);
          notificationSwal('error', 'Error al obtener informacion de la barra');
          //window.location.reload();
          return;
        });
    };
    fetchInitData();
  }, []);

  useEffect(() => {
    if (!caja) {
      setFormVenta({ ...formVenta, caja_id: 0 });
      setVentas([]);
    } else {
      setFormVenta({ ...formVenta, caja_id: caja?.id });
      const fetchVentas = async () => {
        const url = API_URL_CAJA + `metadata/${caja?.id}`;
        try {
          const response = await fetch(url, { method: 'GET' });
          const data = await response.json();
          setVentas(data?.ventas);
        } catch (error) {
          console.error('Error al obtener ventas: ', error);
        }
      };
      fetchVentas();
    }
  }, [caja]);

  useEffect(() => {
    console.log(ventas);
    transformData();
  }, [ventas]);

  const onChangeFilters = async (id) => {
    setCategoriaSelected(id);
  };
  const onChangeDocumento = async (id) => {
    if (documentos.length < 1) {
      return { success: false };
    }
    const documento = documentos.find((doc) => doc.id === id);
    setFormVenta({ ...formVenta, documento_id: id, serie: documento?.serie, numero: documento?.numero });
    return { success: true };
  };
  const onChangePrinter = async (id) => {
    if (impresoras.length < 1) {
      return { success: false };
    }
    setFormVenta({ ...formVenta, impresora_id: id });
    return { success: true };
  };
  const pruebaImpresion = async () => {
    try {
      const currentImpresora = impresoras.find((i) => i.id == formVenta?.impresora_id);
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
      body: <TableExpandData data={ventas} columnsTable={columnsTableVentas} />,
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
      body: (
        <TableResumeModal
          data={detVentasResume}
          total={totalDinnerCaja}
          columnsTable={columnsResumen.filter((column) => column.id !== 'id')}
        />
      ),
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
            {cliente?.document_number ? (
              <>
                <h4>Información del Cliente</h4>
                <h6>
                  <strong>{cliente?.document_type}: </strong>
                  <span>{cliente?.document_number}</span>
                </h6>
                <h6>
                  <strong>Nombre o Razón Social: </strong>
                  <span>{cliente?.name}</span>
                </h6>
                <h6>
                  <strong>Dirección: </strong>
                  <span>{cliente?.address}</span>
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
  const obtenerStock = (producto) => {
    const stocks = producto.stock;
    if (stocks.length > 0) {
      const tienenStock = stocks.filter((stock) => stock.amount > 0);
      if (tienenStock.length > 0) {
        return { id: tienenStock[0].id, price: tienenStock[0].price, amount: tienenStock[0].amount };
      }
    }
    return { id: 0, price: 0, amount: 0 };
  };
  /* const actualizarStock = (detalles) => {
    const currentMetadata = getSession('OFFLINE').find((f) => f.id == metadata?.id);
    // Create deep copy of productos to avoid mutation
    const newProductos = productos.map((producto) => {
      const currentProducto = currentMetadata.productos.find((p) => p.id === producto.id);
      return {
        ...producto,
        stock: currentProducto.stock.map((s) => ({ ...s }))
      };
    });

    // Process each detail
    detalles.forEach((detalle) => {
      // Find the producto that matches the detail
      const productoIndex = newProductos.findIndex((p) => p.id === detalle.id);
      if (productoIndex !== -1) {
        // Find the specific stock entry
        const stockIndex = newProductos[productoIndex].stock.findIndex((s) => s.id === detalle.stock_id);
        if (stockIndex !== -1) {
          // Update the amount by subtracting quantity
          newProductos[productoIndex].stock[stockIndex].amount -= detalle.quantity;
        }
      }
    });

    const newMetaData = { ...currentMetadata, productos: newProductos };
    const newOffline = [...offline.filter((f) => f.id != metadata?.id), newMetaData];
    createSession('OFFLINE', newOffline);

    const stocks = newProductos
      .filter((producto) => producto.stock && producto.stock.length > 0) // Filter products with non-empty stock
      .flatMap((producto) =>
        producto.stock.map((stock) => ({
          id: stock.id,
          amount: stock.amount
        }))
      );
    createSession('STOCK', stocks);
  }; */
  const transformData = async (prod = productos) => {
    const updateQuantity = prod.map((producto) => {
      const { id, price, amount } = obtenerStock(producto);
      let numVentas = 0;
      ventas.forEach((venta) => {
        venta?.detalles.forEach((detalle) => {
          if (detalle?.id === producto?.id) {
            // Agregar el numero de ventas al producto
            numVentas += detalle?.quantity;
          }
        });
      });
      return {
        ...producto,
        quantity: String(numVentas),
        stock_id: id,
        amount: amount,
        amount_end: String(amount),
        amount_start: String(amount + numVentas),
        price: price,
        total: numVentas * price,
        ventas: numVentas
      };
    });
    setTotalDinnerCaja(sumar(updateQuantity));
    setDetVentasResume(updateQuantity.filter((producto) => producto.ventas !== 0));
    setProductos(updateQuantity);
  };
  const toggleCaja = async () => {
    if (caja === null) {
      // OPEN
      setMessageLoader('Aperturando caja, espere un momento...');
      setIsShowLoader(true);
      try {
        const response = await fetchAPIAsync(
          API_URL_CAJA,
          {
            user_id: user?.id
          },
          'POST'
        );
        setCaja(response);
        notificationSwal('success', '¡Usted aperturó su caja de forma exitosa!');
      } catch (error) {
        notificationSwal('error', 'No se pudo abrir caja.');
        console.log(error);
      } finally {
        setIsShowLoader(false);
      }
    } else {
      //CLOSE BOX
      setMessageLoader('Cerrando caja, espere un momento...');
      setIsShowLoader(true);
      try {
        const url = API_URL_CAJA + `cierre/${caja.id}`;
        descargarDocumento(url, 'Reporte_de_ventas');
        notificationSwal('success', '¡Usted cerró su caja de forma exitosa!');
        setCaja(null);
      } catch (error) {
        notificationSwal('error', 'No se pudo cerrar caja.' + error);
      } finally {
        setIsShowLoader(false);
      }
    }
  };
  const exportFilter = async () => {
    try {
      const dataMapeada =
        ventas?.data.map((t) => {
          return {
            id: t.id,
            name: tipos.find((tt) => tt.id == t.tipo_id)?.name,
            fecha: restarCincoHoras(t.created_at),
            price: t.unit_price,
            quantity: t.quantity,
            total: t.total
          };
        }) || [];
      if (ventas && dataMapeada) {
        exportToExcel(dataMapeada, columnsTicket, `REPORTE VENTAS`);
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  };
  const handleSubmit = async (preVenta, total) => {
    if (caja === null) {
      return { success: false, message: 'No se pudo realizar la venta. Aperture su caja primero.' };
    }

    let data = formVenta;

    const documento = documentos.find((doc) => doc.id === data?.documento_id);
    if (documento?.name == 'FACTURA ELECTRONICA') {
      if (Object.keys(cliente).length === 0) {
        setIsOpenModalConfig(!isOpenModalConfig);
        return { success: false, message: 'Primero agregue un cliente para usar ' + documento?.name };
      } else {
        data.cliente = cliente;
        data.cliente_id = `${cliente?.document_number}${metadata?.negocio_id}`;
        setCliente({});
      }
    } else if (total > 600) {
      return { success: false, message: 'No se puede hacer una venta mayor a 600 con ' + documento?.name + ', seleccione otro documento' };
    } else {
      data.cliente = null;
    }

    const validate = ValidacionItemSave(data);
    if (!validate?.success) {
      return { success: false, message: validate?.message };
    }

    try {
      data.detalles_venta = preVenta;
      data.total = total;
      const response = await axios.post(API_URL_VENTA + 'bloque', data);
      console.log(response);
      if (response?.success) {
        return { success: true, message: 'Venta realizada con éxito' };
      } else {
        return { success: false, message: response?.message };
      }
    } catch (error) {
      return { success: false, message: error };
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
      if (!itemSave.documento_id || itemSave.documento_id == null) {
        msgResponse += '* No tiene asignado ningun documento(Boleta o Factura) por defecto.<br>';
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
      const impresora = impresoras.find((impresora) => impresora.id == formVenta.impresora_id);
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
          items: detVentasResume,
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
  /* useEffect(() => {
    websocketRef.current = new WebSocket('ws://localhost:8080/');

    websocketRef.current.onopen = () => {
      setIsView(true);
      console.log('Conectado al servidor WebSocket');
      if (
        isOnline &&
        (getSession('OFFLINE_OPEN_CAJAS') || getSession('OFFLINE_CLOSE_CAJAS') || getSession('OFFLINE_VENTAS') || getSession('STOCK'))
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
          update_stocks: getSession('STOCK') || null,
          offline_ventas: getSession('OFFLINE_VENTAS') || null
        };
        websocketRef.current.send(JSON.stringify(sincronizationToDBCommand));
      }
    };

    websocketRef.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      // Manejar la respuesta según el tipo de mensaje
      if (receivedData.type === 'add_venta') {
        // AGREGAR VENTAS

        const newVenta = receivedData.venta;
        actualizarStock(newVenta.detalles_venta);

        const oldVenta = getSession('VENTAS') || [];
        const allVentas = [...oldVenta, newVenta];
        createSession('VENTAS', allVentas);

        const oldOfflineVentas = getSession('OFFLINE_VENTAS') || [];
        const allOfflineVentas = [...oldOfflineVentas, newVenta];
        createSession('OFFLINE_VENTAS', allOfflineVentas);

        setVentas(allVentas);
        transformData(allVentas);
        const numeroDoc = getSession('LATEST_NUMBER').find((d) => d.documento_id == newVenta.documento_id);
        createSession('LATEST_NUMBER', [
          ...getSession('LATEST_NUMBER').filter((f) => f.documento_id != newVenta.documento_id),
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
      } else if (receivedData.type === 'offline_ventas') {
        if (receivedData.ventas == null) {
          deleteSession('OFFLINE_VENTAS');
        } else {
          createSession('OFFLINE_VENTAS', receivedData.ventas);
        }
        setIsShowLoader(false);
        // ENVIO DE CLIENTES A DB
      } else if (receivedData.type === 'offline_clientes') {
        if (receivedData.clientes == null) {
          deleteSession('OFFLINE_CLIENTES');
        } else {
          createSession('OFFLINE_CLIENTES', receivedData.clientes);
        }

        // ACTUALIZAR STOCK
      } else if (receivedData.type === 'update_stocks') {
        if (receivedData.stocks == null) {
          deleteSession('STOCK');
        } else {
          createSession('STOCK', receivedData.stocks);
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
          deleteSession('VENTAS');
          setVentas([]);
          transformData([]);
        }
        const newMetaData = { ...metadata, caja: receivedData.caja };
        setUser(newMetaData);
        setCaja(newMetaData?.caja);
        setFormVenta({ ...formVenta, caja_id: newMetaData?.caja?.id || 0 });
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
  }, []); */
  // DATA

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

  return isOnline ? (
    <>
      <FullScreenLoader message={messageLoader} isShow={isShowLoader} />
      <HeaderInterfaceUser buttons={headerButtons} modals={headerModals} />
      <MainProducts
        categorias={categorias}
        productos={categoriaSelected ? productos.filter((f) => f.categoria_id === categoriaSelected) : productos}
        totalDinnerCaja={totalDinnerCaja}
        onHandleSubmit={handleSubmit}
        onChangeFilters={onChangeFilters}
      />
    </>
  ) : (
    <div className="h2 text-center text-white">Sin conexión a internet</div>
  );
};

export default Productos;
