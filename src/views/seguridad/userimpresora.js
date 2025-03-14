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
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { fetchAPIAsync, notificationSwal, eliminarSwal, API_URL_IMPRESORAS, API_URL_USER, getSession } from 'common/common';
import { Link, useParams } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useEffect } from 'react';
import { Check, Delete } from '@mui/icons-material';
import { Alert, Autocomplete, MenuItem, Select, TextField } from '@mui/material';
import axios from 'axios';
const columns = [
  { id: 'id', label: 'ID', align: 'left', minWidth: 20, key: 0 },
  { id: 'impresora_id', label: 'IMPRESORA', align: 'left', minWidth: 170, key: 1 }
];

export default function UserImpresoraPage() {
  const { id } = useParams();
  const negocio_id = getSession('NEG_ID');
  const [user, setUser] = React.useState({});
  const [impresoras, setImpresoras] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [itemSave, setItemSave] = React.useState({});
  const [openModal1, setOpenModal1] = React.useState(false);

  useEffect(() => {
    fetch(API_URL_USER + `/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Error en la obtencion de usuarios:', error));
    fetch(API_URL_IMPRESORAS + 'negocio/' + negocio_id)
      .then((response) => response.json())
      .then((data) => setImpresoras(data))
      .catch((error) => console.error('Error en la obtencion de impresoras:', error));
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
      const result = await fetchAPIAsync(API_URL_USER + 'impresora', filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
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
      itemSave.user_id = id;
      await fetchAPIAsync(API_URL_USER + 'impresora', itemSave, 'POST');
      notificationSwal('success', '¡Registro exitoso!');
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
    eliminarSwal(elementoId, API_URL_USER + 'impresora', async () => {
      await fetch(API_URL_USER + `/${id}`)
        .then((response) => response.json())
        .then((data) => setUser(data))
        .catch((error) => console.error('Error en la obtencion de usuarios:', error));
      SearchFilter(page);
    });
  }

  function ValidacionItemSave(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      msgResponse += '* Debe completar los campos obligatorios.<br>';
      response = false;
    } else {
      if (!itemSave.impresora_id) {
        msgResponse += '* Debe seleccionar una Impresora.<br>';
        response = false;
      }
    }

    if (response === false) {
      notificationSwal('error', msgResponse);
    }

    return response;
  }

  async function handleDefaultDocument(row) {
    try {
      await axios.put(API_URL_USER + '/' + id, { ...user, impresora_id: row.impresora_id });
      notificationSwal('success', '¡Operación exitosa!');
      await fetch(API_URL_USER + `/${id}`)
        .then((response) => response.json())
        .then((data) => setUser(data))
        .catch((error) => console.error('Error en la obtencion de usuarios:', error));
      SearchFilter(page);
    } catch (e) {
      notificationSwal('error', e);
    }
  }

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  return (
    <div>
      <div className="form">
        <Link to={'/usuario'} className="btn btn-light mb-3">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Agregar Impresora a {user?.name}
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
                <label htmlFor="form_impresora_id">Impresora(*):</label>
                <Autocomplete
                  name="form_impresora_id"
                  id="form_impresora_id"
                  options={impresoras}
                  getOptionLabel={(impresora) => impresora?.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_impresora_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  size="small"
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
                            {column.id === 'impresora_id' ? impresoras.find((prov) => prov.id === row.impresora_id)?.name : row[column.id]}
                          </TableCell>
                        );
                      })}
                      <TableCell className="d-flex">
                        <button
                          onClick={() => {
                            handleDefaultDocument(row);
                          }}
                          className={`btn btn-${row.impresora_id === user?.impresora_id ? 'success' : 'secondary'}`}
                        >
                          <Check />
                        </button>
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
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <div className="d-flex justify-content-center p-4">
          {totalItems > 0 && user?.impresora_id === null && (
            <Alert variant="filled" severity="warning">
              El Usuario <strong>{user?.name}</strong> no tiene ninguna impresora por defecto. Defina uno por defecto haciendo click en el
              botón{' '}
              <span className="rounded p-1 bg-secondary text-white">
                <Check />
              </span>
            </Alert>
          )}
        </div>
      </Paper>
      <Modal
        open={openModal1}
        onClose={handleCloseModal1}
        aria-labelledby="registration-modal-title"
        aria-describedby="registration-modal-description"
        sx={{ zIndex: 100 }}
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Agregue una nueva impresora</h3>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-12">
                    <label htmlFor="impresora_id">Impresora(*):</label>
                    <Select
                      id="impresora_id"
                      name="impresora_id"
                      value={itemSave.impresora_id || ''}
                      onChange={(event) => {
                        const { name, value } = event.target;
                        setItemSave((prevSearch) => ({
                          ...prevSearch,
                          [name]: value
                        }));
                      }}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Seleccione una impresora</em>
                      </MenuItem>
                      {impresoras
                        .filter((obj2) => !filteredRows.some((obj1) => obj1.impresora_id === obj2.id))
                        .map((pirinter, index) => {
                          return (
                            <MenuItem key={index} value={pirinter.id}>
                              {pirinter.name}
                            </MenuItem>
                          );
                        })}
                    </Select>
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
    </div>
  );
}
