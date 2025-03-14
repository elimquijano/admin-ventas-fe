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
import Button from '@mui/material/Button';
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
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsServicioTecnico } from 'common/ExportColums';
import {
  API_URL_SERVTECNICO,
  API_URL_CLIENTE,
  API_URL_USER,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  redirectToRelativePage
} from 'common/common';
import { Link } from 'react-router-dom';
import ListIcon from '@mui/icons-material/List';
const columns = [
  { id: 'id', label: 'N°', minWidth: 20, key: 0 },
  { id: 'entry_date', label: 'Fecha Ingreso', minWidth: 20, key: 0 },
  { id: 'cliente_id', label: 'Cliente', minWidth: 20, key: 1 },
  { id: 'id_technician', label: 'Técnico', minWidth: 20, key: 2 },
  { id: 'id_manager', label: 'Encargado', minWidth: 100, key: 3 },
  { id: 'state', label: 'Estado', minWidth: 50, key: 4 },
  { id: 'departure_date', label: 'Fecha Entrega', minWidth: 50, key: 5 },
  { id: 'description', label: 'Descripción', minWidth: 50, key: 6 }
];

export default function ServicioTecnico() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [itemSave, setitemSave] = React.useState({
    entry_date: getCurrentDate(),
    state: 'nada',
  });
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  const [clientes, setClientes] = React.useState([]);
  const [usuarios, setUsuarios] = React.useState([]);

  useEffect(() => {
    SearchFilter(page);
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_SERVTECNICO, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_SERVTECNICO, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsServicioTecnico, 'Servicio Técnico');
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
    if (ValidacionItemSave(itemSave) === false) {
      return;
    }
    try {
      const result = await fetchAPIAsync(API_URL_SERVTECNICO, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.reason + ' de forma exitosa!');
      handleCloseModal1();
      redirectToRelativePage('/#/admin/detserviciotecnico/' + result.id);
      SearchFilter(page);
    } catch (error) {
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
      if (!itemSave.cliente_id) {
        msgResponse += '* Debe añadir un Cliente.<br>';
        response = false;
      }
      if (!itemSave.entry_date) {
        msgResponse += '* Debe seleccionar una fecha de ingreso.<br>';
        response = false;
      }
      if (!itemSave.id_manager) {
        msgResponse += '* Debe seleccionar un encargado.<br>';
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
    setitemSave((prevSearch) => ({
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
      entry_date: editedItem.entry_date,
      cliente_id: editedItem.cliente_id,
      id_technician: editedItem.id_technician,
      id_manager: editedItem.id_manager,
      state: editedItem.state,
      departure_date: editedItem.departure_date,
      description: editedItem.description
    };

    editarSwal(API_URL_SERVTECNICO, elementoId, updatedData, SearchFilter);
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
      entry_date: row.entry_date,
      cliente_id: row.cliente_id,
      id_technician: row.id_technician,
      id_manager: row.id_manager,
      state: row.state,
      departure_date: row.departure_date,
      description: row.description
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_SERVTECNICO, SearchFilter);
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

  useEffect(() => {
    fetch(API_URL_CLIENTE + 'data')
      .then((response) => response.json())
      .then((data) => setClientes(data))
      .catch((error) => console.error('Error:', error));
    fetch(API_URL_USER + 'data')
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch((error) => console.error('Error:', error));
  }, []);
  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return (
    <div>
      <div className="form">
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Registrar
        </Button>
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_cliente_id">Cliente:</label>
                <Autocomplete
                  options={clientes}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_cliente_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} label="Cliente" />}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_id_technician">Técnico:</label>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_id_technician: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} label="Técnico" />}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_id_manager">Encargado:</label>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_id_manager: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} label="Encargado" />}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_description">Descripción:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_description"
                  id="form_description"
                  onChange={handleSearchChange}
                  value={searchFilter.form_description || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_state">Estado:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_state"
                  id="form_state"
                  onChange={handleSearchChange}
                  value={searchFilter.form_state || ''}
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
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === 'cliente_id'
                            ? clientes.find((cli) => cli.id === row.cliente_id)?.name || ''
                            : column.id === 'id_technician'
                            ? usuarios.find((tec) => tec.id === row.id_technician)?.name || ''
                            : column.id === 'id_manager'
                            ? usuarios.find((man) => man.id === row.id_manager)?.name || ''
                            : row[column.id]}
                        </TableCell>
                      ))}
                      {/* Columna de botones de acción */}

                      <TableCell>
                        <Link to={'/detserviciotecnico/' + row.id} className="btn btn-info">
                          <ListIcon />
                        </Link>
                        <Button
                          onClick={() => {
                            handleOpenModal2();
                            handleEditar(row);
                          }}
                          className="btn btn-warning"
                        >
                          <EditIcon />
                        </Button>
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
              <h2 className="modal-title">Registre un nuevo Servicio Técnico</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="entry_date">Fecha de Ingreso(*):</label>
                      <input
                        type="date"
                        className="form-control"
                        name="entry_date"
                        id="entry_date"
                        onChange={handleSaveChange}
                        value={itemSave.entry_date || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="cliente_id">Cliente(*):</label>
                      <Autocomplete
                        options={clientes}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setitemSave({ ...itemSave, cliente_id: newValue ? newValue.id : '' });
                        }}
                        value={clientes.find((prov) => prov.id === itemSave.cliente_id) || null}
                        renderInput={(params) => <TextField {...params} label="Cliente" />}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_technician">Técnico:</label>
                      <Autocomplete
                        options={usuarios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setitemSave({ ...itemSave, id_technician: newValue ? newValue.id : '' });
                        }}
                        value={usuarios.find((usu) => usu.id === itemSave.id_technician) || null}
                        renderInput={(params) => <TextField {...params} label="Técnico" />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_manager">Encargado(*):</label>
                      <Autocomplete
                        options={usuarios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setitemSave({ ...itemSave, id_manager: newValue ? newValue.id : '' });
                        }}
                        value={usuarios.find((prov) => prov.id === itemSave.id_manager) || null}
                        renderInput={(params) => <TextField {...params} label="Encargado" />}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="description">Descripción:</label>
                      <textarea
                        type="textarea"
                        className="form-control"
                        name="description"
                        id="description"
                        onChange={handleSaveChange}
                        value={itemSave.description || ''}
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
              <h2 className="modal-title">Editar Servicio Técnico</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="entry_date">Fecha de Ingreso:</label>
                      <input
                        type="date"
                        className="form-control"
                        name="entry_date"
                        id="entry_date"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.entry_date || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="departure_date">Fecha de Entrega:</label>
                      <input
                        type="date"
                        className="form-control"
                        name="departure_date"
                        id="departure_date"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.departure_date || ''}
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
                          handleEditChange('cliente_id', newValue ? newValue.id : '');
                        }}
                        value={clientes.find((cli) => cli.id === editedItem.cliente_id) || null}
                        renderInput={(params) => <TextField {...params} label="Cliente" />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_technician">Técnico:</label>
                      <Autocomplete
                        options={usuarios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          handleEditChange('id_technician', newValue ? newValue.id : '');
                        }}
                        value={usuarios.find((cli) => cli.id === editedItem.id_technician) || null}
                        renderInput={(params) => <TextField {...params} label="Técnico" />}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_manager">Encargado:</label>
                      <Autocomplete
                        options={usuarios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          handleEditChange('id_manager', newValue ? newValue.id : '');
                        }}
                        value={usuarios.find((cli) => cli.id === editedItem.id_manager) || null}
                        renderInput={(params) => <TextField {...params} label="Encargado" />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="state">Estado:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        id="state"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.state || ''}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="description">Descripción:</label>
                      <textarea
                        type="textarea"
                        className="form-control"
                        name="description"
                        id="description"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.description || ''}
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
  );
}
