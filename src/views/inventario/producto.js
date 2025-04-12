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
  API_HOST,
  API_URL_PRODUCTO,
  API_URL_CATEGORIA,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  API_URL_NEGOCIO,
  getSession
} from 'common/common';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsProductosList } from 'common/ExportColums';

const columns = [
  { id: 'code', label: 'CODIGO', minWidth: 10, key: 0 },
  { id: 'name', label: 'NOMBRE', minWidth: 100, key: 2 },
  { id: 'price', label: 'PRECIO', minWidth: 50, key: 4 },
  { id: 'image', label: 'IMAGEN', minWidth: 60, key: 6 },
  { id: 'categoria_id', label: 'CATEGORIA', minWidth: 60, key: 7 },
  { id: 'negocio_id', label: 'EMPRESA', minWidth: 100, key: 8 }
];

export default function ProductoPage() {
  const id = getSession('NEG_ID');
  const [negocios, setNegocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ form_negocio_id: id });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState({ negocio_id: id, moneda: 'PEN' });
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.id == id);
        setNegocios(filter);
      })
      .catch((error) => console.error('Error en la solicitud de negocios:', error));

    fetch(API_URL_CATEGORIA + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter((cat) => cat.negocio_id == id);
        setCategorias(filteredData);
      })
      .catch((error) => console.error('Error:', error));

    fetch(API_URL_PRODUCTO + 'moneda')
      .then((response) => response.json())
      .then((data) => setMonedas(data))
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
      const result = await fetchAPIAsync(API_URL_PRODUCTO, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_PRODUCTO, filter, 'GET');
      if (result && result.data.length > 0) {
        exportToExcel(result.data, columnsProductosList, 'Productos');
      } else {
        notificationSwal('info', 'No hay datos para exportar.');
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
      return;
    }
    try {
      const result = await fetchAPIAsync(API_URL_PRODUCTO, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.name + ' de forma exitosa!');
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
      if (!itemSave.code) {
        msgResponse += '* Debe agregar un código.<br>';
        response = false;
      }
      if (!itemSave.name) {
        msgResponse += '* Debe añadir una descripción.<br>';
        response = false;
      }
      if (!itemSave.moneda) {
        msgResponse += '* Debe seleccionar una moneda.<br>';
        response = false;
      }
      if (!itemSave.price) {
        msgResponse += '* Debe ingresar un precio.<br>';
        response = false;
      }
      if (!itemSave.negocio_id) {
        msgResponse += '* Debe ingresar una empresa.<br>';
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
    setSearchFilter((prevSearch) => ({
      ...prevSearch,
      [name]: value
    }));
  };

  const handleSaveChange = (event) => {
    const { name, files } = event.target;

    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: files ? files[0] : event.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setItemSave({ ...itemSave, image: file });
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
    if (ValidacionItemSave(editedItem) === false) {
      return;
    }
    const result = await fetchAPIAsync(API_URL_PRODUCTO + `update/${elementoId}`, editedItem, 'POST');
    notificationSwal('success', '¡Se actualizó ' + result?.name + ' de forma exitosa!');
    handleCloseModal2();
    SearchFilter(page);
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      code: row.code,
      barcode: row.barcode,
      name: row.name,
      description: row.description,
      categoria_id: row.categoria_id,
      moneda: row.moneda,
      price: row.price,
      observacion: row.observacion,
      negocio_id: row.negocio_id
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_PRODUCTO, SearchFilter);
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
          Registrar producto
        </Button>

        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_code">Código:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_code"
                  id="form_code"
                  onChange={handleSearchChange}
                  value={searchFilter.form_code || ''}
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
                  renderInput={(params) => <TextField {...params} />}
                  value={negocios.find((n) => n.id === searchFilter.form_negocio_id) || null}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_categoria_id">Categoría:</label>
                <Autocomplete
                  size="small"
                  options={categorias}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_categoria_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={categorias.find((n) => n.id === searchFilter.form_categoria_id) || null}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_moneda">Moneda:</label>
                <Autocomplete
                  size="small"
                  options={monedas}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_moneda: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={monedas.find((n) => n.id === searchFilter.form_moneda) || null}
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
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column, index) => (
                        <TableCell key={index} align={column.align}>
                          {column.id === 'negocio_id' ? (
                            negocios.find((prov) => prov.id == row.negocio_id)?.name
                          ) : column.id === 'categoria_id' ? (
                            categorias.find((prov) => prov.id == row.categoria_id)?.name
                          ) : column.id === 'image' ? (
                            <div>
                              {row.image ? (
                                <img
                                  src={API_HOST + row.image}
                                  alt={row.image}
                                  style={{
                                    maxHeight: '50px',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                'Sin imagen'
                              )}
                            </div>
                          ) : column.id === 'price' ? (
                            `${row.moneda} ${Number(row.price).toFixed(2)}`
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
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
              <h2 className="modal-title">Registre un nuevo producto</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="code">Código Interno:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="code"
                        id="code"
                        onChange={handleSaveChange}
                        value={itemSave.code || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="barcode">Código de Barras:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="barcode"
                        id="barcode"
                        onChange={handleSaveChange}
                        value={itemSave.barcode || ''}
                      />
                    </div>
                  </div>
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
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="negocio_id">Empresa:(*)</label>
                      <Autocomplete
                        size="small"
                        options={negocios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, negocio_id: newValue ? newValue.id : '' });
                        }}
                        value={negocios.find((cat) => cat.id === itemSave.negocio_id) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="categoria_id">Categoría:</label>
                      <Autocomplete
                        size="small"
                        options={categorias}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, categoria_id: newValue ? newValue.id : '' });
                        }}
                        value={categorias.find((cat) => cat.id === itemSave.categoria_id) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="moneda">Moneda:(*)</label>
                      <Autocomplete
                        size="small"
                        options={monedas}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, moneda: newValue ? newValue.id : '' });
                        }}
                        value={monedas.find((cat) => cat.id === itemSave.moneda) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="price">Precio:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="price"
                        id="price"
                        onChange={handleSaveChange}
                        value={itemSave.price || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="image">Imagen:</label>
                      <input type="file" accept="image/*" className="form-control" name="image" id="image" onChange={handleImageChange} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="observacion">Observación:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="observacion"
                        id="observacion"
                        onChange={handleSaveChange}
                        value={itemSave.observacion || ''}
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
              <h2 className="modal-title">Editar Producto</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="code">Código Interno:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="code"
                        id="code"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.code || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="barcode">Código de Barras:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="barcode"
                        id="barcode"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.barcode || ''}
                      />
                    </div>
                  </div>
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
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
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
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="negocio_id">Empresa(*):</label>
                      <Autocomplete
                        size="small"
                        options={negocios}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          handleEditChange('negocio_id', newValue ? newValue.id : '');
                        }}
                        value={negocios.find((cat) => cat.id === editedItem.negocio_id) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="categoria_id">Categoría:</label>
                      <Autocomplete
                        size="small"
                        options={categorias}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          handleEditChange('categoria_id', newValue ? newValue.id : '');
                        }}
                        value={categorias.find((cat) => cat.id === editedItem.categoria_id) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="moneda">Moneda:(*)</label>
                      <Autocomplete
                        size="small"
                        options={monedas}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          handleEditChange('moneda', newValue ? newValue.id : '');
                        }}
                        value={monedas.find((cat) => cat.id === editedItem.moneda) || null}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="price">Precio:(*)</label>
                      <input
                        type="text"
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
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="image">Imagen:</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        name="image"
                        id="image"
                        onChange={(event) => {
                          const { name, files } = event.target;
                          setEditedItem((prevSearch) => ({
                            ...prevSearch,
                            [name]: files ? files[0] : event.target.value
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="observacion">Observación:</label>
                      <textarea
                        type="text"
                        className="form-control"
                        name="observacion"
                        id="observacion"
                        onChange={(event) => {
                          const { name, value } = event.target;
                          handleEditChange(name, value);
                        }}
                        value={editedItem.observacion || ''}
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
