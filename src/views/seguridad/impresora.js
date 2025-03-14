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
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { API_URL_IMPRESORAS, fetchAPIAsync, notificationSwal, eliminarSwal, API_URL_NEGOCIO, getSession } from 'common/common';
import { Autocomplete, TextField } from '@mui/material';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'name', label: 'NOMBRE', minWidth: 170, key: 1 },
  { id: 'negocio_id', label: 'EMPRESA', minWidth: 100, key: 2 },
  { id: 'ip', label: 'IP', minWidth: 170, key: 3 }
];

export default function ImpresoraPage() {
  const id = getSession('NEG_ID');
  const [negocios, setNegocios] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({form_negocio_id: id});
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState(0);
  const [editedItem, setEditedItem] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const negocio = data.filter((n) => n.id == id);
        setNegocios(negocio);
      })
      .catch((error) => console.error('Error en la solicitud de negocios:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_IMPRESORAS, filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({form_negocio_id: id});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    try {
      const result = await fetchAPIAsync(API_URL_IMPRESORAS, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.name + ' de forma exitosa!');
      SearchFilter(page);
    } catch (e) {
      notificationSwal('error', e);
    }
    handleCloseModal1();
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
    const { name, files } = event.target;

    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: files ? files[0] : event.target.value
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
      [name]: value
    }));
  };

  async function updateItem() {
    const elementoId = editedItem.id;
    const result = await fetchAPIAsync(API_URL_IMPRESORAS + `update/${elementoId}`, editedItem, 'POST');
    notificationSwal('success', '¡Se actualizó ' + result.name + ' de forma exitosa!');
    handleCloseModal2();
    SearchFilter(page);
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      name: row.name,
      description: row.description,
      ip: row.ip,
      port: row.port,
      mac: row.mac,
      negocio_id: row.negocio_id
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_IMPRESORAS, SearchFilter);
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
          Registrar Nueva Impresora
        </Button>

        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_id">ID:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_id"
                  id="form_id"
                  onChange={handleSearchChange}
                  value={searchFilter.form_id || ''}
                />
              </div>
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
                <label htmlFor="form_negocio_id">Empresa:</label>
                <Autocomplete
                  size="small"
                  options={negocios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_negocio_id: newValue ? newValue.id : '' });
                  }}
                  value={negocios.find((n) => n.id == searchFilter.form_negocio_id) || null}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_ip">Ip:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_ip"
                  id="form_ip"
                  onChange={handleSearchChange}
                  value={searchFilter.form_ip || ''}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
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
                        const value = column.id == 'negocio_id' ? negocios.find((n) => n.id == row[column.id])?.name : row[column.id];
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.format && typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
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
          rowsPerPageOptions={[10, 50, 100]}
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
              <h3 className="modal-title">Registre una nueva impresora</h3>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="name">Nombre(*):</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      id="name"
                      onChange={handleSaveChange}
                      value={itemSave.name || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="negocio_id">Empresa:</label>
                    <Autocomplete
                      size="small"
                      name="negocio_id"
                      options={negocios}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, newValue) => {
                        setItemSave({ ...itemSave, negocio_id: newValue ? newValue.id : '' });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                      value={negocios.find((n) => n.id === itemSave.negocio_id) || null}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="description">Descripción:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="description"
                      id="description"
                      onChange={handleSaveChange}
                      value={itemSave.description || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="ip">Ip:</label>
                    <input type="text" className="form-control" name="ip" id="ip" onChange={handleSaveChange} value={itemSave.ip || ''} />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="port">Puerto:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="port"
                      id="port"
                      onChange={handleSaveChange}
                      value={itemSave.port || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="mac">Direccion mac:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mac"
                      id="mac"
                      onChange={handleSaveChange}
                      value={itemSave.mac || ''}
                    />
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
              <h2 className="modal-title">Editar Documento</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="name">Nombre(*):</label>
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
                  <div className="col-md-6 form-group">
                    <label htmlFor="negocio_id">Empresa:</label>
                    <Autocomplete
                      size="small"
                      name="negocio_id"
                      options={negocios}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, newValue) => {
                        setEditedItem({ ...editedItem, negocio_id: newValue ? newValue.id : '' });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                      value={negocios.find((n) => n.id === editedItem.negocio_id) || null}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="description">Descripción:</label>
                    <input
                      type="text"
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
                  <div className="col-md-6 form-group">
                    <label htmlFor="ip">Ip:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ip"
                      id="ip"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.ip || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="port">Puerto:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="port"
                      id="port"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.port || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="mac">Direccion mac:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mac"
                      id="mac"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.mac || ''}
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
