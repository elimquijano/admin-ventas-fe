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
import { API_URL_ROL, fetchAPIAsync, notificationSwal, API_URL_USER_ROL, eliminarSwal } from 'common/common';
import { Link, useParams } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import { Delete } from '@mui/icons-material';
const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'name', label: 'Nombre', minWidth: 170, key: 1 },
  { id: 'code', label: 'Codigo', minWidth: 100, key: 2 }
];

export default function UserRolPage() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [itemSave, setItemSave] = React.useState(0);
  const [roles, setRoles] = React.useState([]);
  const { id } = useParams();

  useEffect(() => {
    SearchFilter(page);
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_user_id = id;
    filter.rol_in = true;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_USER_ROL, filter, 'GET');
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
    try {
      itemSave.user_id = id;
      const result = await fetchAPIAsync(API_URL_USER_ROL, itemSave, 'POST');
      console.log(result);
      notificationSwal('success', '¡Registro exitoso!');
      SearchFilter(page);
      handleClose();
    } catch (e) {
      notificationSwal('error', e);
      handleClose();
    }
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_USER_ROL, SearchFilter);
  }

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setSearchFilter((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
    }));
  };

  /*  const handleSaveChange = (event) => {
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

  /* function handlePriv(row) {
      console.log('Privilegios:', row);
    } */

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    fetch(API_URL_ROL)
      .then((response) => response.json())
      .then((data) => setRoles(data?.data))
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <div>
      <div className="form">
        <Link to={'/usuario'} className="btn btn-light mb-3">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpen} className="btn btn-info mb-3">
          Asignar Rol
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
                <label htmlFor="form_code">Codigo:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_code"
                  id="form_code"
                  onChange={handleSearchChange}
                  value={searchFilter.form_code || ''}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1">
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
                  <TableCell>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                      {columns.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'name'
                              ? roles.find((rol) => rol.id == row.rol_id)?.name
                              : column.id === 'code'
                              ? roles.find((rol) => rol.id == row.rol_id)?.code
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      <TableCell>
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
      </Paper>
      <Modal open={open} onClose={handleClose} aria-labelledby="registration-modal-title" aria-describedby="registration-modal-description">
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Registre un nuevo rol</h2>
              <button onClick={handleClose} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="rol_id">Roles:</label>
                  <Autocomplete
                    options={roles}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      setItemSave({ ...itemSave, rol_id: newValue ? newValue.id : '' });
                    }}
                    renderInput={(params) => <TextField {...params} label="Roles" />}
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
    </div>
  );
}
