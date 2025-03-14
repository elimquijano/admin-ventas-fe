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
import { API_URL_CLIENTE, fetchAPIAsync, notificationSwal, eliminarSwal, editarSwal } from 'common/common';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsClientesList } from 'common/ExportColums';

const columns = [
  { id: 'name', label: 'Nombre', minWidth: 150, key: 0 },
  { id: 'address', label: 'Dirección', minWidth: 100, key: 1 },
  { id: 'contact', label: 'Contacto', minWidth: 20, key: 2 },
  { id: 'email', label: 'Email', minWidth: 100, key: 3 },
  { id: 'ruc', label: 'RUC', minWidth: 11, key: 4 },
  { id: 'phone', label: 'Teléfono', minWidth: 10, key: 5 },
  { id: 'attachment', label: 'ANEXO', minWidth: 20, key: 6 },
  { id: 'payment_method', label: 'Método de pago', minWidth: 20, key: 7 },
];

export default function ClientePage() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [itemSave, setItemSave] = React.useState(0);
  const [editedItem, setEditedItem] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);

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
      const result = await fetchAPIAsync(API_URL_CLIENTE, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_CLIENTE, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsClientesList, "Proveedores");
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
      return false;
    }
    try {
      const result = await fetchAPIAsync(API_URL_CLIENTE, itemSave, 'POST');
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
    const cleanedValue = value.trim();
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
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

  const handleEditChange = (name, value) => {
    setEditedItem((prevEditedItem) => ({
      ...prevEditedItem,
      [name]: value,
    }));
  };

  async function updateItem() {
    const elementoId = editedItem.id;
    const updatedData = {
      name: editedItem.name,
      address: editedItem.address,
      contact: editedItem.contact,
      email: editedItem.email,
      ruc: editedItem.ruc,
      phone: editedItem.phone,
      attachment: editedItem.attachment,
      payment_method: editedItem.payment_method,
    };
    if (ValidacionItemSave(updatedData) === false) {
      return false;
    }
    editarSwal(API_URL_CLIENTE, elementoId, updatedData, SearchFilter);
    handleCloseModal2();
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      name: row.name,
      address: row.address,
      contact: row.contact,
      email: row.email,
      ruc: row.ruc,
      phone: row.phone,
      attachment: row.attachment,
      payment_method: row.payment_method,
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_CLIENTE, SearchFilter);
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
        <Button onClick={handleOpenModal1} className='btn btn-info mb-3'>Registrar cliente</Button>
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
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      <TableCell>
                        <Button onClick={() => {
                          handleOpenModal2();
                          handleEditar(row);
                        }} className='btn btn-warning'>
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
              <h2 className="modal-title">Registre un nuevo cliente</h2>
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
                </div>
                <div className="row">
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
              <h2 className="modal-title">Editar cliente</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="name">Nombre:(*)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      id="name"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.name || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Dirección:</label>
                    <textarea
                      className="form-control"
                      name="address"
                      id="address"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.address || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact">Contacto:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact"
                      id="contact"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.contact || ''}
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
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.email || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ruc">RUC:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ruc"
                      id="ruc"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.ruc || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      id="phone"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.phone || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="attachment">ANEXO:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="attachment"
                      id="attachment"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.attachment || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="payment_method">Método de pago:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="payment_method"
                      id="payment_method"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.payment_method || ''}
                    />
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
