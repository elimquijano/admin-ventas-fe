import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ListIcon from '@mui/icons-material/List';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ArticleIcon from '@mui/icons-material/Article';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsDetComprasList } from 'common/ExportColums';
import {
  API_URL_DETCOMPRA,
  API_URL_PRODUCTO,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  API_URL_MODELOEQUIPO,
  API_URL_DETSERVTECNICO,
  descargarDocumento,
  API_URL_DES_INGRESO,
  API_URL_DES_ENTREGA,
  API_URL_DES_COTIZACION
} from 'common/common';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'modelo_code', label: 'Modelo', minWidth: 20, key: 1 },
  { id: 'serie', label: 'Serie', minWidth: 20, key: 2 },
  { id: 'state', label: 'Estado', minWidth: 100, key: 3 },
  { id: 'problem', label: 'Problema', minWidth: 200, key: 4 },
  { id: 'action', label: 'Acción', minWidth: 200, key: 5 },
  { id: 'observation', label: 'Observación', minWidth: 200, key: 6 },
  { id: 'rep_price', label: 'Costo Reparación', minWidth: 100, key: 7 },
  { id: 'cost_rep_sin_price', label: 'Costo Sin Acc', minWidth: 100, key: 8 },
  { id: 'plazo_ent', label: 'Plazo Entrega', minWidth: 100, key: 9 },
  { id: 'acc_incluye', label: 'Incluye', minWidth: 100, key: 10 },
  { id: 'total_cost', label: 'Costo Total', minWidth: 100, key: 11 }
];

export default function DetServicioTecnico() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [monedas, setMonedas] = React.useState([]);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  const [itemSave, setItemSave] = React.useState({
    id_ser_tecnico: id,
    state: 'nuevo'
  });
  const [modelo, setModelo] = React.useState([]);
  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_PRODUCTO + 'data')
      .then((response) => response.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error en la solicitud de productos:', error));
    fetch(API_URL_PRODUCTO + 'moneda')
      .then((response) => response.json())
      .then((data) => setMonedas(data))
      .catch((error) => console.error('Error:', error));
    fetch(API_URL_MODELOEQUIPO + 'autocomplete')
      .then((response) => response.json())
      .then((data) => setModelo(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_id_ser_tecnico = id;

    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_DETSERVTECNICO, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_DETCOMPRA, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsDetComprasList, 'Detalle Compra');
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    if (!ValidacionItemSave(itemSave)) {
      return false;
    }
    try {
      await fetchAPIAsync(API_URL_DETSERVTECNICO, itemSave, 'POST');
      notificationSwal('success', '¡Se registraron los detalles de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
    } catch (error) {
      console.error('Error al registrar los detalles:', error);
      notificationSwal('error', 'No se pudieron registrar los detalles.');
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
      if (!itemSave.id_ser_tecnico) {
        msgResponse += '* No existe servicio tecnico.<br>';
        response = false;
      }
      if (!itemSave.id_model) {
        msgResponse += '* Debe añadir un modelo.<br>';
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
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: value
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
      id_model: editedItem.id_model,
      id_ser_tecnico: editedItem.id_ser_tecnico,
      observation: editedItem.observation,
      problem: editedItem.problem,
      action: editedItem.action,
      serie: editedItem.serie,
      cost_rep_moneda: editedItem.cost_rep_moneda,
      cost_rep_price: editedItem.cost_rep_price,
      cost_rep_sin_moneda: editedItem.cost_rep_sin_moneda,
      cost_rep_sin_price: editedItem.cost_rep_sin_price,
      rep_moneda: editedItem.rep_moneda,
      rep_price: editedItem.rep_price,
      acc_incluye: editedItem.acc_incluye,
      plazo_ent: editedItem.plazo_ent
    };
    if (ValidacionItemSave(updatedData) === false) {
      return;
    }
    editarSwal(API_URL_DETSERVTECNICO, elementoId, updatedData, SearchFilter);
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
    console.log(row);
    setEditedItem({
      id: row.id,
      id_model: row.id_model,
      id_ser_tecnico: row.id_ser_tecnico,
      observation: row.observation,
      problem: row.problem,
      action: row.action,
      serie: row.serie,
      cost_rep_moneda: row.cost_rep_moneda,
      cost_rep_price: row.cost_rep_price,
      cost_rep_sin_moneda: row.cost_rep_sin_moneda,
      cost_rep_sin_price: row.cost_rep_sin_price,
      rep_moneda: row.rep_moneda,
      rep_price: row.rep_price,
      acc_incluye: row.acc_incluye,
      plazo_ent: row.plazo_ent
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_DETSERVTECNICO, SearchFilter);
  }

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };
  async function descargarIngreso() {
    try {
      await descargarDocumento(API_URL_DES_INGRESO+'?page=1&paginate=100000&form_id_ser_tecnico='+itemSave.id_ser_tecnico, 'products');
    } catch (error) {
      notificationSwal('error', error);
    }
  }  
  async function descargarCotizacion() {
    try {
      await descargarDocumento(API_URL_DES_COTIZACION+'?page=1&paginate=100000&form_id_ser_tecnico='+itemSave.id_ser_tecnico, 'products');
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  async function descargarEntrega() {
    try {
      await descargarDocumento(API_URL_DES_ENTREGA+'?page=1&paginate=100000&form_id_ser_tecnico='+itemSave.id_ser_tecnico, 'products');
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  return (
    <div>
      <div>
        <div className="form">
          <Link to={'/serviciotecnico'} className="btn btn-light m-2">
            <KeyboardArrowLeftIcon /> Retornar
          </Link>{' '}
          <Button onClick={handleOpenModal1} className="btn btn-info m-2">
            Registrar
          </Button>
          <button className="btn btn-success m-2" onClick={() => descargarIngreso()}>
            Ingreso
          </button>
          <button className="btn btn-success m-2" onClick={() => descargarCotizacion()}>
            Cotización
          </button>
          <button className="btn btn-success m-2" onClick={() => descargarEntrega()}>
            Entrega
          </button>
          <div className="row content">
            <div className="col-sm-9">
              <form className="form row mb-4">
                <div className="col-sm-4">
                  <label htmlFor="form_amount">Cantidad:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="form_amount"
                    id="form_amount"
                    onChange={handleSearchChange}
                    value={searchFilter.form_amount || ''}
                  />
                </div>
                <div className="col-sm-4">
                  <label htmlFor="form_price">Precio:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="form_price"
                    id="form_price"
                    onChange={handleSearchChange}
                    value={searchFilter.form_price || ''}
                  />
                </div>
                <div className="col-sm-4">
                  <label htmlFor="form_id_producto">Producto:</label>
                  <Autocomplete
                    options={productos}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setSearchFilter({ ...searchFilter, form_id_producto: newValue ? newValue.id : '' });
                    }}
                    renderInput={(params) => <TextField {...params} label="Productos" />}
                  />
                </div>
                <div className="col-sm-4">
                  <label htmlFor="form_moneda">Moneda:</label>
                  <Autocomplete
                    options={monedas}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setSearchFilter({ ...searchFilter, form_moneda: newValue ? newValue.id : '' });
                    }}
                    renderInput={(params) => <TextField {...params} label="Moneda" />}
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
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                        {columns.map((column) => (
                          <TableCell key={column.id} align={column.align}>
                            {column.id === 'id_producto'
                              ? productos.find((prov) => prov.id === row.id_producto)?.name || ''
                              : row[column.id]}
                          </TableCell>
                        ))}
                        {/* Columna de botones de acción */}
                        <TableCell>
                          <Link to={'/informe/' + id + '/' + row.id} className="btn btn-secondary" title="Informe">
                            <ArticleIcon />
                          </Link>
                          <Link to={'/detrepuesto/' + id + '/' + row.id} className="btn btn-info" title="Detalle">
                            <ListIcon />
                          </Link>
                          <Button
                            onClick={() => {
                              handleOpenModal2();
                              handleEditar(row);
                            }}
                            className="btn btn-warning"
                            title="Editar"
                          >
                            <EditIcon />
                          </Button>
                          <button className="btn btn-danger" onClick={() => handleEliminar(row)} title="Eliminar">
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
                <h2 className="modal-title">Nuevo detalle de compra</h2>
                <button onClick={handleCloseModal1} className="btn btn-link">
                  <CloseIcon />
                </button>
              </div>
              <div className="modal-body">
                <form encType="multipart/form-data">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="id_model">Modelo(*):</label>
                        <Autocomplete
                          options={modelo}
                          getOptionLabel={(option) => option.code}
                          onChange={(event, newValue) => {
                            setItemSave({ ...itemSave, id_model: newValue ? newValue.id : '' });
                          }}
                          value={modelo.find((cat) => cat.id === itemSave.id_model) || null}
                          renderInput={(params) => <TextField {...params} label="modelo" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="serie">Serie(*):</label>
                        <input
                          type="text"
                          className="form-control"
                          name="serie"
                          id="serie"
                          onChange={handleSaveChange}
                          value={itemSave.serie || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="problem">Problema:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="problem"
                          id="problem"
                          onChange={handleSaveChange}
                          value={itemSave.problem || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="action">Acción:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="action"
                          id="action"
                          onChange={handleSaveChange}
                          value={itemSave.action || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="observation">Obeservación:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="observation"
                          id="observation"
                          onChange={handleSaveChange}
                          value={itemSave.observation || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_moneda">Moneda Reparación:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setItemSave({ ...itemSave, cost_rep_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === itemSave.cost_rep_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_price">Cos. Reparación:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="cost_rep_price"
                          id="cost_rep_price"
                          onChange={handleSaveChange}
                          value={itemSave.cost_rep_price || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_sin_moneda">Moneda Sin Acc:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setItemSave({ ...itemSave, cost_rep_sin_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === itemSave.cost_rep_sin_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_sin_price">Cos. Sin Acc:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="cost_rep_sin_price"
                          id="cost_rep_sin_price"
                          onChange={handleSaveChange}
                          value={itemSave.cost_rep_sin_price || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="rep_moneda">Moneda Costo Total:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setItemSave({ ...itemSave, rep_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === itemSave.rep_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="rep_price">Costo Total:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="rep_price"
                          id="rep_price"
                          onChange={handleSaveChange}
                          value={itemSave.rep_price || ''}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button className="btn btn-info" onClick={SaveItem}>
                  <ReceiptLongIcon /> AÑADIR A LA LISTA
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
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="id_model">Modelo(*):</label>
                        <Autocomplete
                          options={modelo}
                          getOptionLabel={(option) => option.code}
                          onChange={(event, newValue) => {
                            setEditedItem({ ...editedItem, id_model: newValue ? newValue.id : '' });
                          }}
                          value={modelo.find((cat) => cat.id === editedItem.id_model) || null}
                          renderInput={(params) => <TextField {...params} label="modelo" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="serie">Serie(*):</label>
                        <input
                          type="text"
                          className="form-control"
                          name="serie"
                          id="serie"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.serie || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="problem">Problema:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="problem"
                          id="problem"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.problem || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="action">Acción:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="action"
                          id="action"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.action || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="observation">Obeservación:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="observation"
                          id="observation"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.observation || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_moneda">Moneda Reparación:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setEditedItem({ ...editedItem, cost_rep_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === editedItem.cost_rep_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_price">Cos. Reparación:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="cost_rep_price"
                          id="cost_rep_price"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.cost_rep_price || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_sin_moneda">Moneda Sin Acc:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setEditedItem({ ...editedItem, cost_rep_sin_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === editedItem.cost_rep_sin_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="cost_rep_sin_price">Cos. Sin Acc:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="cost_rep_sin_price"
                          id="cost_rep_sin_price"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.cost_rep_sin_price || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="rep_moneda">Moneda Costo Total:</label>
                        <Autocomplete
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setEditedItem({ ...editedItem, rep_moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === editedItem.rep_moneda) || null}
                          renderInput={(params) => <TextField {...params} label="Moneda Reparación" />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="rep_price">Costo Reparación:</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="rep_price"
                          id="rep_price"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.rep_price || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="acc_incluye">Incluye:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="acc_incluye"
                          id="acc_incluye"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.acc_incluye || ''}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="plazo_ent">Plazo Entrega:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="plazo_ent"
                          id="plazo_ent"
                          onChange={(event) => {
                            const { name, value } = event.target;
                            handleEditChange(name, value);
                          }}
                          value={editedItem.plazo_ent || ''}
                        />
                      </div>
                    </div>
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
    </div>
  );
}
