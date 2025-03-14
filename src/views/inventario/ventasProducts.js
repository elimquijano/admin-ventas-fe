import * as React from 'react';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsVentaProductsList } from 'common/ExportColums';
import {
  API_URL_VENTA,
  API_URL_CLIENTE,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  API_URL_NEGOCIO,
  API_URL_USER,
  getSession
} from 'common/common';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'name', label: 'NEGOCIO', minWidth: 100, key: 1 },
  { id: 'name_user', label: 'USUARIO', minWidth: 100, key: 2 },
  { id: 'name_cliente', label: 'CLIENTE', minWidth: 100, key: 3 },
  { id: 'folio', label: 'FOLIO', minWidth: 100, key: 4 },
  { id: 'caja_id', label: 'CAJA', minWidth: 100, key: 5 }
];

export default function VentasProductsPage() {
  const id = getSession('NEG_ID');
  const [negocios, setNegocios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ negocio_id: id });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_CLIENTE + 'data')
      .then((response) => response.json())
      .then((data) => setClientes(data))
      .catch((error) => console.error('Error en la solicitud de clientes:', error));
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.id == id);
        setNegocios(filter);
      })
      .catch((error) => console.error('Error en la solicitud de negocios:', error));
    fetch(API_URL_USER + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.negocio_id == id);
        setUsuarios(filter);
      })
      .catch((error) => console.error('Error en la solicitud de usuarios:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_VENTA, filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  async function ExportFilter() {
    let filter = searchFilter;
    filter.page = 1;
    filter.paginate = 10000;
    try {
      const result = await fetchAPIAsync(API_URL_VENTA, filter, 'GET');
      if (result && result.data) {
        const dataMapeada = result.data.map((venta) => {
          const fechaFormateada = String(venta.created_at).split('T')[0];
          const tipoFolio = venta.ruc ? '01' : '03';
          const tipoDocumento = venta.ruc ? '1' : '0';
          const documento = venta.ruc ? venta.ruc : '0000000';
          const name = venta.ruc ? venta.name : 'Varios Varios Varios';
          const [serie, numero] = String(venta.folio).split('-');
          const total = Number(venta.total).toFixed(2);
          const IGV = (Number(venta.total) * 0.18).toFixed(2);
          const precioBase = (Number(venta.total) - Number(IGV)).toFixed(2);

          return {
            fechae: fechaFormateada,
            fechav: fechaFormateada,
            tipoc: tipoFolio,
            serie: serie,
            numero: numero,
            tipodoc: tipoDocumento,
            documento: documento,
            nombre: name,
            basei: precioBase,
            igv: IGV,
            icbper: Number(0).toFixed(2),
            exonerado: Number(0).toFixed(2),
            retencion: Number(0).toFixed(2),
            total: total
          };
        });

        exportToExcel(dataMapeada, columnsVentaProductsList, 'Ventas');
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({negocio_id: id});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    if (ValidacionItemSave(itemSave) === false) {
      return;
    }
    try {
      const result = await fetchAPIAsync(API_URL_VENTA, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.reason + ' de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
    } catch (_) {
      notificationSwal('error', 'No se pudo registrar.');
      handleCloseModal1();
    }
  }

  function ValidacionItemSave(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      notificationSwal('error', 'Debe completar los campos obligatorios');
      response = false;
      return response;
    } else {
      if (!itemSave.reason) {
        msgResponse += '* Debe agregar una razón o detalle.<br>';
        response = false;
      }
      if (!itemSave.negocio_id) {
        msgResponse += '* Debe seleccionar un Local o Negocio.<br>';
        response = false;
      }
    }

    if (response === false) {
      notificationSwal('error', msgResponse);
    }

    return response;
  }

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setSearchFilter((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
    }));
  };
  const handleSaveChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
    }));
  };

  const handleEditChange = (name, value) => {
    setEditedItem((prevEditedItem) => ({
      ...prevEditedItem,
      [name]: value
    }));
  };

  async function updateItem() {
    const elementoId = editedItem.id;
    const updatedData = {
      reason: editedItem.reason,
      cliente_id: editedItem.cliente_id,
      negocio_id: editedItem.negocio_id
    };

    editarSwal(API_URL_VENTA, elementoId, updatedData, SearchFilter);
    handleCloseModal2();
  }

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      reason: row.reason,
      cliente_id: row.cliente_id,
      negocio_id: row.negocio_id
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_VENTA, SearchFilter);
  }

  /*   const handleOpenModal1 = () => {
    setOpenModal1(true); 
  };
  */

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };

  return (
    <div>
      <div className="form">
        {/* <Button onClick={handleOpenModal1} className='btn btn-info mb-3'>Registrar venta</Button> */}
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="caja_id">ID caja:</label>
                <input
                  type="text"
                  className="form-control"
                  name="caja_id"
                  id="caja_id"
                  onChange={handleSearchChange}
                  value={searchFilter.caja_id || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="negocio_id">Negocio:</label>
                <Autocomplete
                  options={negocios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, negocio_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={negocios.find((n) => n.id == searchFilter.negocio_id) || null}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="user_id">Usuario:</label>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, user_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={usuarios.find((n) => n.id == searchFilter.user_id) || null}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_cliente_id">Cliente:</label>
                <Autocomplete
                  options={clientes}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_cliente_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={clientes.find((n) => n.id == searchFilter.form_cliente_id) || null}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_folio">Folio del documento:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_folio"
                  id="form_folio"
                  onChange={handleSearchChange}
                  value={searchFilter.form_folio || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_desde_fecha">Desde:</label>
                <input
                  type="date"
                  className="form-control"
                  name="form_desde_fecha"
                  id="form_desde_fecha"
                  onChange={handleSearchChange}
                  value={searchFilter.form_desde_fecha || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_hasta_fecha">Hasta:</label>
                <input
                  type="date"
                  className="form-control"
                  name="form_hasta_fecha"
                  id="form_hasta_fecha"
                  onChange={handleSearchChange}
                  value={searchFilter.form_hasta_fecha || ''}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" onClick={() => ExportFilter()}>
              <FileDownloadIcon />
              EXPORTAR
            </button>
            <button className="btn btn-danger w-100 mb-1" onClick={CleanFilter}>
              <CleaningServicesIcon />
              LIMPIAR
            </button>
          </div>
        </div>
      </div>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {totalItems > 0 ? (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align} style={{ minWidth: column.minWidth }}>
                      {column.label}
                    </TableCell>
                  ))}
                  {/* Columna adicional para botones de acción */}
                  <TableCell>DETALLES</TableCell>
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {row[column.id]}
                        </TableCell>
                      ))}
                      {/* Columna de botones de acción */}
                      <TableCell align="center">
                        <a href={`#/detventaproductos/${row.id}`} className="btn btn-secondary">
                          <PlaylistAddIcon />
                        </a>
                      </TableCell>
                      <TableCell className="d-flex">
                        <button
                          onClick={() => {
                            handleOpenModal2();
                            handleEditar(row);
                          }}
                          className="btn btn-warning"
                        >
                          <EditIcon />
                        </button>
                        <button className="btn btn-danger" onClick={() => handleEliminar(row)}>
                          <DeleteIcon />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <div className="alert alert-warning" role="alert">
            No se encontraron resultados.
          </div>
        )}

        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal
        open={openModal1}
        onClose={handleCloseModal1}
        aria-labelledby="registration-modal-title"
        aria-describedby="registration-modal-description"
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Registre una nueva venta</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="reason">Razón:</label>
                      <textarea
                        type="text"
                        className="form-control"
                        name="reason"
                        id="reason"
                        onChange={handleSaveChange}
                        value={itemSave.reason || ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="cliente_id">Cliente:</label>
                      <Autocomplete
                        options={clientes}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, cliente_id: newValue ? newValue.id : '' });
                        }}
                        value={clientes.find((prov) => prov.id === itemSave.cliente_id) || null}
                        renderInput={(params) => <TextField {...params} label="Cliente" />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="negocio_id">Negocio:</label>
                      <Autocomplete
                        options={negocios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, negocio_id: newValue ? newValue.code : '' });
                        }}
                        value={negocios.find((loc) => loc.code === itemSave.negocio_id) || null}
                        renderInput={(params) => <TextField {...params} label="Negocio" />}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-info" onClick={SaveItem}>
                <AddCircleOutlineIcon /> REGISTRAR
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openModal2}
        onClose={handleCloseModal2}
        aria-labelledby="edition-modal-title"
        aria-describedby="edition-modal-description"
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Venta</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="reason">Razón:</label>
                  <textarea
                    type="text"
                    className="form-control"
                    name="reason"
                    id="reason"
                    onChange={(event) => {
                      const { name, value } = event.target;
                      handleEditChange(name, value);
                    }}
                    value={editedItem.reason || ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cliente_id">Cliente:</label>
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      handleEditChange('cliente_id', newValue ? newValue.id : '');
                    }}
                    value={clientes.find((cat) => cat.id === editedItem.cliente_id) || null}
                    renderInput={(params) => <TextField {...params} label="Cliente" />}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-warning" onClick={updateItem}>
                <EditIcon /> ACTUALIZAR
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
