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
import {
  API_URL_EXISTENCIA,
  API_URL,
  API_URL_PRODUCTO,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  API_URL_PRODUCTOSPDF,
  descargarDocumento,
  getSession,
  API_URL_NEGOCIO,
  API_URL_USER
} from 'common/common';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'producto_id', label: 'PRODUCTO', minWidth: 100, key: 1 },
  { id: 'amount', label: 'CANTIDAD', minWidth: 100, key: 2 },
  { id: 'price', label: 'PRECIO', minWidth: 100, key: 3 },
  { id: 'negocio_id', label: 'EMPRESA', minWidth: 100, key: 4 }
];

export default function ExistenciaPage() {
  const id = getSession('NEG_ID');
  const [productos, setProductos] = useState([]);
  const [locales, setLocales] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ form_negocio_id: id });
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState({
    negocio_id_origen: id
  });
  const [userItemSave, setUserItemSave] = useState({
    negocio_id_origen: id,
    negocio_id_destino: id
  });
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal3, setOpenModal3] = useState(false);
  const [editedItem, setEditedItem] = useState(0);

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_PRODUCTO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((prod) => prod.negocio_id == id);
        setProductos(filter);
      })
      .catch((error) => console.error('Error:', error));
    fetch(API_URL_USER + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((prod) => prod.negocio_id == id && String(prod?.name).includes('Barra'));
        setUsuarios(filter);
      })
      .catch((error) => console.error('Error:', error));
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        setNegocios(data);
        const filter = data.filter((loc) => loc.id == id);
        setLocales(filter);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_EXISTENCIA, filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  async function ExportarFilter(numPage) {
    let filter = searchFilter;
    filter.page = 1;
    filter.paginate = 10000000;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      await descargarDocumento(API_URL_PRODUCTOSPDF, 'products');
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
    try {
      const result = await fetchAPIAsync(API_URL + 'reassignStock', itemSave, 'POST');
      notificationSwal('success', result?.message);
      SearchFilter(page);
    } catch (_) {
      notificationSwal('error', 'No se pudo registrar.');
    } finally {
      handleCloseModal1();
    }
  }

  async function SaveUserItem() {
    try {
      const result = await fetchAPIAsync(API_URL + 'reassignStockUser', userItemSave, 'POST');
      notificationSwal('success', result?.message);
      SearchFilter(page);
    } catch (_) {
      notificationSwal('error', 'No se pudo registrar.');
    } finally {
      handleCloseModal3();
    }
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

  const handleUserSaveChange = (event) => {
    const { name, value } = event.target;
    setUserItemSave((prevSearch) => ({
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
    editarSwal(API_URL_EXISTENCIA, elementoId, editedItem, SearchFilter);
    handleCloseModal2();
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      amount: row.amount,
      producto_id: row.producto_id,
      price: row.price
    });
  }

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_EXISTENCIA, SearchFilter);
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

  const handleOpenModal3 = () => {
    setOpenModal3(true);
  };

  const handleCloseModal3 = () => {
    setOpenModal3(false);
  };

  return (
    <div>
      <div className="form">
        <Button onClick={handleOpenModal3} className="btn btn-info mb-3 mr-3">
          Transferir Stock a un Usuario
        </Button>
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Transferir Stock a otra Empresa
        </Button>
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_producto_id">Producto:</label>
                <Autocomplete
                  size="small"
                  options={productos}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_producto_id: newValue ? newValue.id : '' });
                  }}
                  value={productos.find((prod) => prod.id === searchFilter.form_producto_id) || null}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
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
                <label htmlFor="form_negocio_id">Negocio:</label>
                <Autocomplete
                  size="small"
                  options={locales}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_negocio_id: newValue ? newValue.id : '' });
                  }}
                  value={locales.find((loc) => loc.id === searchFilter.form_negocio_id) || null}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" onClick={() => ExportarFilter()}>
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
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.id == 'producto_id'
                              ? productos.find((prod) => prod.id == row.producto_id)?.name || ''
                              : column.id == 'negocio_id'
                              ? locales.find((loc) => loc.id == row.negocio_id)?.name || ''
                              : column.id == 'price'
                              ? `${row['moneda']} ${row['price']}`
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      <TableCell>
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
              <h2 className="modal-title">Envie a otra Empresa</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form className="row">
                <div className="col-12 form-group">
                  <label htmlFor="negocio_id_origen">Empresa origen:</label>
                  <Autocomplete
                    size="small"
                    options={locales}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setItemSave({ ...itemSave, negocio_id_origen: newValue ? newValue.id : '' });
                    }}
                    value={locales.find((neg) => neg.id === itemSave.negocio_id_origen) || locales.find((neg) => neg.id === 1) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </div>
                <div className="col-12 form-group">
                  <label htmlFor="producto_id">Producto:</label>
                  <Autocomplete
                    size="small"
                    options={filteredRows}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setItemSave({ ...itemSave, producto_id: newValue ? newValue.producto_id : '' });
                    }}
                    value={filteredRows?.find((prod) => prod.producto_id === itemSave.producto_id) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </div>
                <div className="col-6 form-group">
                  <label htmlFor="amount">Cantidad:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    id="amount"
                    onChange={handleSaveChange}
                    value={itemSave.amount || ''}
                    required
                  />
                </div>
                <div className="col-6 form-group">
                  <label htmlFor="price">Precio:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    id="price"
                    onChange={handleSaveChange}
                    value={itemSave.price || ''}
                    required
                  />
                </div>
                <div className="col-12 form-group">
                  <label htmlFor="negocio_id_destino">Negocio destino</label>
                  <Autocomplete
                    size="small"
                    options={negocios}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setItemSave({ ...itemSave, negocio_id_destino: newValue ? newValue.id : '' });
                    }}
                    value={negocios.find((cat) => cat.id === itemSave.negocio_id_destino) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
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
        open={openModal3}
        onClose={handleCloseModal3}
        aria-labelledby="registration-modal-title"
        aria-describedby="registration-modal-description"
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Envie a su Usuario</h2>
              <button onClick={handleCloseModal3} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form className="row">
                <div className="col-12 form-group">
                  <label htmlFor="negocio_id_origen">Empresa origen:</label>
                  <Autocomplete
                    size="small"
                    options={locales}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setUserItemSave({ ...userItemSave, negocio_id_origen: newValue ? newValue.id : '' });
                    }}
                    value={locales.find((neg) => neg.id === userItemSave.negocio_id_origen) || locales.find((neg) => neg.id === 1) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </div>
                <div className="col-12 form-group">
                  <label htmlFor="producto_id">Producto:</label>
                  <Autocomplete
                    size="small"
                    options={filteredRows}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setUserItemSave({ ...userItemSave, producto_id: newValue ? newValue.producto_id : '' });
                    }}
                    value={filteredRows?.find((prod) => prod.producto_id === userItemSave.producto_id) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </div>
                <div className="col-6 form-group">
                  <label htmlFor="amount">Cantidad:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    id="amount"
                    onChange={handleUserSaveChange}
                    value={userItemSave.amount || ''}
                    required
                  />
                </div>
                <div className="col-6 form-group">
                  <label htmlFor="price">Precio:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    id="price"
                    onChange={handleUserSaveChange}
                    value={userItemSave.price || ''}
                    required
                  />
                </div>
                <div className="col-12 form-group">
                  <label htmlFor="user_id">Usuario</label>
                  <Autocomplete
                    size="small"
                    options={usuarios}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setUserItemSave({ ...userItemSave, user_id: newValue ? newValue.id : '' });
                    }}
                    value={usuarios.find((cat) => cat.id === userItemSave.user_id) || null}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-info" onClick={SaveUserItem}>
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
              <h2 className="modal-title">Editar Stock</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-12 form-group">
                    <label htmlFor="producto_id">Producto:</label>
                    <Autocomplete
                      size="small"
                      options={productos}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, newValue) => {
                        handleEditChange({ ...editedItem, producto_id: newValue ? newValue.id : '' });
                      }}
                      value={productos.find((prod) => prod.id === editedItem.producto_id) || null}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label htmlFor="amount">Cantidad:</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      className="form-control"
                      name="amount"
                      id="amount"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.amount || ''}
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label htmlFor="price">Precio:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      name="price"
                      id="price"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.price || ''}
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
