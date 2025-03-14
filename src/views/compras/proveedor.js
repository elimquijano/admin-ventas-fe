import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { API_URL_PROVEEDOR, fetchAPIAsync, notificationSwal, eliminarSwal, editarSwal, API_URL_NEGOCIO, getSession } from 'common/common';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsProveedoresList } from 'common/ExportColums';
import { Autocomplete, TextField } from '@mui/material';

const columns = [
  { id: 'id', label: 'ID', minWidth: 150, key: 0 },
  { id: 'name', label: 'NOMBRE', minWidth: 150, key: 1 },
  { id: 'address', label: 'DIRECCION', minWidth: 100, key: 2 },
  { id: 'negocio_id', label: 'EMPRESA', minWidth: 100, key: 3 },
  { id: 'email', label: 'E-MAIL', minWidth: 100, key: 4 },
  { id: 'ruc', label: 'RUC', minWidth: 11, key: 5 },
  { id: 'phone', label: 'TELEFONO', minWidth: 10, key: 6 }
];

export default function ProveedorPage() {
  const id = getSession('NEG_ID');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ form_negocio_id: id });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState(0);
  const [editedItem, setEditedItem] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [negocios, setNegocios] = useState([]);

  useEffect(() => {
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.id == id);
        setNegocios(filter);
      })
      .catch((error) => console.log(error));
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
      const result = await fetchAPIAsync(API_URL_PROVEEDOR, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_PROVEEDOR, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsProveedoresList, 'Proveedores');
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({ form_negocio_id: id });
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    if (ValidacionItemSave(itemSave) === false) {
      return false;
    }
    try {
      const result = await fetchAPIAsync(API_URL_PROVEEDOR, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.name + ' de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
    } catch (e) {
      notificationSwal('error', e);
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
      if (!itemSave.negocio_id) {
        msgResponse += '* Debe seleccionar un negocio.<br>';
        response = false;
      }
      if (!itemSave.name) {
        msgResponse += '* Debe ingresar el nombre.<br>';
        response = false;
      }
      if (!itemSave.email) {
        msgResponse += '* Debe añadir un email.<br>';
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

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedItem((prevEditedItem) => ({
      ...prevEditedItem,
      [name]: value
    }));
  };

  async function updateItem() {
    const elementoId = editedItem.id;
    if (ValidacionItemSave(editedItem) === false) {
      return false;
    }
    editarSwal(API_URL_PROVEEDOR, elementoId, editedItem, SearchFilter);
    handleCloseModal2();
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      name: row.name,
      address: row.address,
      contact: row.contact,
      negocio_id: row.negocio_id,
      email: row.email,
      ruc: row.ruc,
      phone: row.phone,
      attachment: row.attachment,
      payment_method: row.payment_method
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_PROVEEDOR, SearchFilter);
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

  return (
    <div>
      <div className="form">
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Registrar proveedor
        </Button>
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_name">Nombre:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_name"
                  id="form_name"
                  onChange={handleSearchChange}
                  value={searchFilter.form_name || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_address">Dirección:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_address"
                  id="form_address"
                  onChange={handleSearchChange}
                  value={searchFilter.form_address || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_phone">Teléfono:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_phone"
                  id="form_phone"
                  onChange={handleSearchChange}
                  value={searchFilter.form_phone || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_email">Email:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_email"
                  id="form_email"
                  onChange={handleSearchChange}
                  value={searchFilter.form_email || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_negocio_id">Empresa:</label>
                <Autocomplete
                  size="small"
                  options={negocios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_negocio_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={negocios?.find((n) => n.id === searchFilter.form_negocio_id) || null}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" onClick={ExportFilter}>
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
                  {columns.map((column, index) => (
                    <TableCell key={index} align={column.align} style={{ minWidth: column.minWidth }}>
                      {column.label}
                    </TableCell>
                  ))}
                  {/* Columna adicional para botones de acción */}
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'negocio_id' ? negocios.find((n) => n.id == row[column.id])?.name : row[column.id]}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      <TableCell>
                        <Button
                          onClick={() => {
                            handleOpenModal2();
                            handleEditar(row);
                          }}
                          className="btn btn-warning"
                        >
                          <EditIcon />
                        </Button>
                        <Button className="btn btn-danger" onClick={() => handleEliminar(row)}>
                          <DeleteIcon />
                        </Button>
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
              <h2 className="modal-title">Registre un nuevo proveedor</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="name">Nombre:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        id="name"
                        onChange={handleSaveChange}
                        value={itemSave.name || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email:(*)</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="email"
                        onChange={handleSaveChange}
                        value={itemSave.email || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="negocio_id">Empresa:</label>
                      <Autocomplete
                        size="small"
                        options={negocios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, negocio_id: newValue ? newValue.id : '' });
                        }}
                        renderInput={(params) => <TextField {...params} />}
                        value={negocios?.find((n) => n.id === itemSave.negocio_id) || null}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="address">Dirección:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        id="address"
                        onChange={handleSaveChange}
                        value={itemSave.address || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="contact">Contacto:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact"
                        id="contact"
                        onChange={handleSaveChange}
                        value={itemSave.contact || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ruc">RUC:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ruc"
                        id="ruc"
                        onChange={handleSaveChange}
                        value={itemSave.ruc || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone">Teléfono:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        id="phone"
                        onChange={handleSaveChange}
                        value={itemSave.phone || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="attachment">ANEXO:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="attachment"
                        id="attachment"
                        onChange={handleSaveChange}
                        value={itemSave.attachment || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="payment_method">Método de pago:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="payment_method"
                        id="payment_method"
                        onChange={handleSaveChange}
                        value={itemSave.payment_method || ''}
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
              <h2 className="modal-title">Editar proveedor</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="name">Nombre:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        id="name"
                        onChange={handleEditChange}
                        value={editedItem.name || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email:(*)</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="email"
                        onChange={handleEditChange}
                        value={editedItem.email || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="negocio_id">Empresa:</label>
                      <Autocomplete
                        size="small"
                        options={negocios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setEditedItem({ ...editedItem, negocio_id: newValue ? newValue.id : '' });
                        }}
                        renderInput={(params) => <TextField {...params} />}
                        value={negocios?.find((n) => n.id === editedItem.negocio_id) || null}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="address">Dirección:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        id="address"
                        onChange={handleEditChange}
                        value={editedItem.address || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="contact">Contacto:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact"
                        id="contact"
                        onChange={handleEditChange}
                        value={editedItem.contact || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ruc">RUC:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ruc"
                        id="ruc"
                        onChange={handleEditChange}
                        value={editedItem.ruc || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone">Teléfono:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        id="phone"
                        onChange={handleEditChange}
                        value={editedItem.phone || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="attachment">ANEXO:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="attachment"
                        id="attachment"
                        onChange={handleEditChange}
                        value={editedItem.attachment || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="payment_method">Método de pago:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="payment_method"
                        id="payment_method"
                        onChange={handleEditChange}
                        value={editedItem.payment_method || ''}
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
