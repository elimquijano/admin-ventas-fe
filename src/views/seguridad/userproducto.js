import * as React from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { fetchAPIAsync, notificationSwal, eliminarSwal, API_URL_USER, API_HOST, getSession, API_URL_PRODUCTO } from 'common/common';
import { Link, useParams } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useEffect } from 'react';
import { Delete } from '@mui/icons-material';
import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import axios from 'axios';
const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'code', label: 'CODIGO', minWidth: 0 },
  { id: 'producto_id', label: 'PRODUCTO', minWidth: 170, key: 1 },
  { id: 'image', label: 'IMAGEN', minWidth: 0 },
  { id: 'price', label: 'PRECIO', minWidth: 0 }
];
const columnsProducts = [
  { id: 'code', label: 'CODIGO', minWidth: 0 },
  { id: 'name', label: 'NOMBRE', minWidth: 0 },
  { id: 'image', label: 'IMAGEN', minWidth: 0 },
  { id: 'price', label: 'PRECIO', minWidth: 0 }
];

export default function UserProductoPage() {
  const { id } = useParams();
  const negocio_id = getSession('NEG_ID');
  const [user, setUser] = React.useState({});
  const [productos, setProductos] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(1000);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [openModal1, setOpenModal1] = React.useState(false);

  useEffect(() => {
    fetch(API_URL_USER + `/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Error en la obtencion de usuarios:', error));
    fetch(API_URL_PRODUCTO + `negocio/${negocio_id}`)
      .then((response) => response.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error en la obtencion de productos:', error));
    SearchFilter(page);
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_user_id = id;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_USER + 'producto', filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  function CleanFilter() {
    setFilteredRows([]);
    setSearchFilter({});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    const itemSave = {
      user_id: id,
      productos_id: selected
    };
    if (ValidacionItemSave(itemSave) === false) {
      return;
    }
    try {
      await axios.post(API_URL_USER + 'productobloque', itemSave);
      notificationSwal('success', '¡Registro exitoso!');
      setSelected([]);
    } catch (e) {
      notificationSwal('error', e);
    }
    handleCloseModal1();
    SearchFilter(page);
  }

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setSearchFilter((prevSearch) => ({
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

  async function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_USER + 'producto', SearchFilter);
  }

  function ValidacionItemSave(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      msgResponse += '* Debe completar los campos obligatorios.<br>';
      response = false;
    } else {
      if (!itemSave.user_id) {
        msgResponse += '* Debe seleccionar un Usuario.<br>';
        response = false;
      }
      if (!itemSave.productos_id || Object.keys(itemSave.productos_id).length === 0) {
        msgResponse += '* Debe seleccionar un Producto.<br>';
        response = false;
      }
    }

    if (response === false) {
      notificationSwal('error', msgResponse);
    }

    return response;
  }

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleSelect = (id) => {
    setSelected((prevSelected) => (prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]));
  };

  return (
    <div>
      <div className="form">
        <Link to={'/usuario'} className="btn btn-light mb-3">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Agregar Productos a {user?.name}
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
                <label htmlFor="form_producto_id">Producto:</label>
                <Autocomplete
                  size="small"
                  options={productos}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_producto_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" disabled>
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
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column, index) => {
                        const producto = productos.find((prov) => prov.id === row.producto_id);
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'code' ? (
                              producto?.code
                            ) : column.id === 'producto_id' ? (
                              producto?.name
                            ) : column.id === 'image' ? (
                              <div>
                                {producto.image ? (
                                  <img
                                    src={API_HOST + producto.image}
                                    alt={producto.image}
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
                              `${producto.moneda} ${Number(producto.price).toFixed(2)}`
                            ) : (
                              row[column.id]
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="d-flex">
                        <button className="btn btn-danger" onClick={() => handleEliminar(row)}>
                          <Delete />
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
          rowsPerPageOptions={[100, 200, 300]}
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
        sx={{ zIndex: 100 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Agregar Productos</h3>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <FormControlLabel
                          control={
                            <Checkbox
                              indeterminate={
                                selected.length > 0 &&
                                selected.length <
                                  productos.filter((obj2) => !filteredRows.some((obj1) => obj1.producto_id === obj2.id)).length
                              }
                              checked={
                                selected.length ===
                                productos.filter((obj2) => !filteredRows.some((obj1) => obj1.producto_id === obj2.id)).length
                              }
                              onChange={() => {
                                if (
                                  selected.length ===
                                  productos.filter((obj2) => !filteredRows.some((obj1) => obj1.producto_id === obj2.id)).length
                                ) {
                                  setSelected([]);
                                } else {
                                  setSelected(
                                    productos
                                      .filter((obj2) => !filteredRows.some((obj1) => obj1.producto_id === obj2.id))
                                      .map((row) => row.id)
                                  );
                                }
                              }}
                            />
                          }
                          label="Seleccionar todo"
                        />
                      </TableCell>
                      {columnsProducts.map((column, index) => (
                        <TableCell key={index} align={column.align} style={{ minWidth: column.minWidth }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productos
                      .filter((obj2) => !filteredRows.some((obj1) => obj1.producto_id === obj2.id))
                      .map((row) => (
                        <TableRow key={row.id}>
                          <TableCell padding="checkbox">
                            <Checkbox checked={selected.includes(row.id)} onChange={() => handleSelect(row.id)} />
                          </TableCell>
                          {columnsProducts.map((column, index) => (
                            <TableCell key={index} align={column.align}>
                              {column.id === 'image' ? (
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
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-info" onClick={SaveItem}>
                <AddCircleOutlineIcon /> REGISTRAR
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
