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
import {
  fetchAPIAsync,
  notificationSwal,
  API_URL_USER_DOCUMENTO,
  eliminarSwal,
  API_URL_DOCUMENTOS,
  API_URL_USER,
  getSession
} from 'common/common';
import { Link, useParams } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useEffect } from 'react';
import { Check, Delete, Edit } from '@mui/icons-material';
import { Alert, Autocomplete, MenuItem, Select, TextField } from '@mui/material';
import axios from 'axios';
const columns = [
  { id: 'id', label: 'ID', align: 'left', minWidth: 20, key: 0 },
  { id: 'documento_id', label: 'TIPO DOCUMENTO', align: 'left', minWidth: 170, key: 1 },
  { id: 'serie', label: 'SERIE', align: 'left', minWidth: 170, key: 1 },
  { id: 'latest_number', label: 'NUMERO', align: 'right', minWidth: 170, key: 2 }
];

export default function UserDocumentoPage() {
  const negocio_id = getSession('NEG_ID');
  const { id } = useParams();
  const [user, setUser] = React.useState({});
  const [documentos, setDocumentos] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [itemSave, setItemSave] = React.useState({});
  const [editedItem, setEditedItem] = React.useState({});
  const [openModal1, setOpenModal1] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);

  useEffect(() => {
    fetch(API_URL_USER + `/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Error en la obtencion de usuarios:', error));
    fetch(API_URL_DOCUMENTOS + 'negocio/' + negocio_id)
      .then((response) => response.json())
      .then((data) => setDocumentos(data))
      .catch((error) => console.error('Error en la obtencion de documentos:', error));
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
      const result = await fetchAPIAsync(API_URL_USER_DOCUMENTO, filter, 'GET');
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
      await fetchAPIAsync(API_URL_USER_DOCUMENTO, itemSave, 'POST');
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

  /* const handleSaveChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
    }));
  }; */

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  async function updateItem() {
    const elementoId = editedItem.id;
    await fetchAPIAsync(API_URL_USER_DOCUMENTO + `update/${elementoId}`, editedItem, 'POST');
    notificationSwal('success', '¡Se actualizó de forma exitosa!');
    await fetch(API_URL_USER + `/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Error en la obtencion de usuarios:', error));
    SearchFilter(page);
    handleCloseModal2();
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      documento_id: row.documento_id
    });
  }

  async function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_USER_DOCUMENTO, async () => {
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
      if (!itemSave.documento_id) {
        msgResponse += '* Debe seleccionar un Documento.<br>';
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
      await axios.put(API_URL_USER + '/' + id, { ...user, documento_id: row.documento_id });
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

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };

  return (
    <div>
      <div className="form">
        <Link to={'/usuario'} className="btn btn-light mb-3">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
          Agregar Documento a {user?.name}
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
                <label htmlFor="form_documento_id">Serie(*):</label>
                <Autocomplete
                  name="form_documento_id"
                  id="form_documento_id"
                  options={documentos}
                  getOptionLabel={(documento) => documento?.serie}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_documento_id: newValue ? newValue.id : '' });
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
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'documento_id'
                              ? documentos.find((prov) => prov.id === row.documento_id)?.name
                              : column.id === 'serie'
                              ? documentos.find((prov) => prov.id === row.documento_id)?.serie
                              : column.id === 'latest_number'
                              ? documentos.find((prov) => prov.id === row.documento_id)?.numero
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      <TableCell className="d-flex">
                        <button
                          onClick={() => {
                            handleDefaultDocument(row);
                          }}
                          className={`btn btn-${row.documento_id === user?.documento_id ? 'success' : 'secondary'}`}
                        >
                          <Check />
                        </button>
                        <button
                          onClick={() => {
                            handleOpenModal2();
                            handleEditar(row);
                          }}
                          className="btn btn-warning"
                        >
                          <Edit />
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
          {totalItems > 0 && user?.documento_id === null && (
            <Alert variant="filled" severity="warning">
              El Usuario <strong>{user?.name}</strong> no tiene ningún documento por defecto. Defina uno por defecto haciendo click en el
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
              <h3 className="modal-title">Registre un documento</h3>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="documento_id">Tipo Documento y Serie(*):</label>
                    <Select
                      id="documento_id"
                      name="documento_id"
                      value={itemSave.documento_id || ''}
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
                        <em>Seleccione un documento</em>
                      </MenuItem>
                      {documentos
                        .filter((obj2) => !filteredRows.some((obj1) => obj1.documento_id === obj2.id))
                        .map((doc, index) => {
                          return (
                            <MenuItem key={index} value={doc.id}>
                              {doc.name} : {doc.serie}
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
                  <div className="col-md-6">
                    <label htmlFor="documento_id">Tipo Documento y serie(*):</label>
                    <Select
                      id="documento_id"
                      name="documento_id"
                      value={editedItem.documento_id || ''}
                      onChange={(event) => {
                        const { name, value } = event.target;
                        setEditedItem((prevSearch) => ({
                          ...prevSearch,
                          [name]: value
                        }));
                      }}
                      fullWidth
                      size="small"
                    >
                      {documentos.map((doc, index) => {
                        return (
                          <MenuItem key={index} value={doc.id}>
                            {doc.name} : {doc.serie}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-warning" onClick={updateItem}>
                <Edit /> ACTUALIZAR
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
