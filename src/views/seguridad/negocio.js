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
import { API_URL_NEGOCIO, fetchAPIAsync, notificationSwal, eliminarSwal, API_HOST, getSession } from 'common/common';
import { Search } from '@mui/icons-material';
import { Autocomplete, MenuItem, Select, TextField } from '@mui/material';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'name', label: 'NOMBRE', minWidth: 170, key: 1 },
  { id: 'ruc', label: 'RUC', minWidth: 20, key: 2 },
  { id: 'logo', label: 'LOGOTIPO', minWidth: 20, key: 3 },
  { id: 'address', label: 'DIRECCIÓN', minWidth: 100, key: 4 },
  { id: 'sede', label: 'SEDE', minWidth: 100, key: 5 }
];

export default function NegocioPage() {
  const id = getSession('NEG_ID');
  const [sedes, setSedes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({form_id: id});
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [itemSave, setItemSave] = useState(0);
  const [editedItem, setEditedItem] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);

  useEffect(() => {
    fetch(API_URL_NEGOCIO + 'sedes')
      .then((response) => response.json())
      .then((data) => setSedes(data))
      .catch((error) => console.error('Error en la solicitud de Sedes:', error));
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
      const result = await fetchAPIAsync(API_URL_NEGOCIO, filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({form_id: id});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  async function SaveItem() {
    try {
      const result = await fetchAPIAsync(API_URL_NEGOCIO, itemSave, 'POST');
      notificationSwal('success', '¡Se registró ' + result.name + ' de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
    } catch (e) {
      notificationSwal('error', e);
      handleCloseModal1();
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
    const result = await fetchAPIAsync(API_URL_NEGOCIO + `update/${elementoId}`, editedItem, 'POST');
    notificationSwal('success', '¡Se actualizó ' + result.name + ' de forma exitosa!');
    handleCloseModal2();
    SearchFilter(page);
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      name: row.name,
      ruc: row.ruc,
      address: row.address,
      sede: row.sede,
      numeros_sms: row.numeros_sms,
      token_reporte: row.token_reporte,
      url_facturacion: row.url_facturacion,
      token_facturacion: row.token_facturacion,
      porcent_envio_ticket_facturacion: row.porcent_envio_ticket_facturacion,
      porcent_envio_ventas_facturacion: row.porcent_envio_ventas_facturacion
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_NEGOCIO, SearchFilter);
  }

  const searchEmpresas = async (save = true) => {
    const ruc = save ? itemSave.ruc : editedItem.ruc;

    if (ruc) {
      await fetch('https://apiperu.dev/api/ruc', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer 27979c4825749caf1d156e747b61b1317c13487ac42ce18d5a66c079b55ce5a1'
        },
        body: JSON.stringify({
          ruc: ruc
        })
      })
        .then((response) => response.json())
        .then((data) => {
          if (save) {
            setItemSave((prevSearch) => ({
              ...prevSearch,
              name: data?.data.nombre_o_razon_social,
              address: data?.data.direccion
            }));
          } else {
            setEditedItem((prevSearch) => ({
              ...prevSearch,
              name: data?.data.nombre_o_razon_social,
              address: data?.data.direccion
            }));
          }
        })
        .catch((error) => {
          console.error('Error al obtener informacion del ruc: ', error);
        });
    }
  };

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
          Registrar Nueva Empresa
        </Button>

        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_ruc">RUC:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_ruc"
                  id="form_ruc"
                  onChange={handleSearchChange}
                  value={searchFilter.form_ruc || ''}
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
                <label htmlFor="form_sede">Sede:</label>
                <Autocomplete
                  options={sedes}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_sede: newValue ? newValue : '' });
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
                            {column.id === 'logo' ? (
                              <div>
                                {row.logo ? (
                                  <img
                                    src={API_HOST + row.logo}
                                    alt={row.logo}
                                    style={{
                                      maxWidth: '150px',
                                      maxHeight: '50px',
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  'Sin imagen'
                                )}
                              </div>
                            ) : (
                              row[column.id]
                            )}
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
              <h3 className="modal-title">Registre una nueva empresa</h3>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="name">Nombre o Razón Social:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      id="name"
                      onChange={handleSaveChange}
                      value={itemSave.name || ''}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="ruc">RUC:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="ruc"
                        id="ruc"
                        onChange={handleSaveChange}
                        value={itemSave.ruc || ''}
                      />
                      <div className="input-group-btn">
                        <button className="btn btn-success" type="button" onClick={() => searchEmpresas()}>
                          <Search />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
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
                  <div className="col-md-6 form-group">
                    <label htmlFor="form_sede">Sede:</label>
                    <Autocomplete
                      options={sedes}
                      onChange={(event, newValue) => {
                        setItemSave({ ...itemSave, sede: newValue ? newValue : '' });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                      size="small"
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="numeros_sms">Números a enviar SMS:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numeros_sms"
                      id="numeros_sms"
                      placeholder="9xxxxxxx,9xxxxxxx,..."
                      onChange={handleSaveChange}
                      value={itemSave.numeros_sms || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="token_reporte">Token para reporte PDF:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="token_reporte"
                      id="token_reporte"
                      onChange={handleSaveChange}
                      value={itemSave.token_reporte || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="url_facturacion">URL para facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="url_facturacion"
                      id="url_facturacion"
                      placeholder="http://..."
                      onChange={handleSaveChange}
                      value={itemSave.url_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="token_facturacion">Token para facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="token_facturacion"
                      id="token_facturacion"
                      onChange={handleSaveChange}
                      value={itemSave.token_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="porcent_envio_ventas_facturacion">Porcentaje de envio del total de ventas a facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="porcent_envio_ventas_facturacion"
                      id="porcent_envio_ventas_facturacion"
                      placeholder="0.6"
                      onChange={handleSaveChange}
                      value={itemSave.porcent_envio_ventas_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="porcent_envio_ticket_facturacion">Porcentaje de envio del total de tickets a facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="porcent_envio_ticket_facturacion"
                      id="porcent_envio_ticket_facturacion"
                      placeholder="0.8"
                      onChange={handleSaveChange}
                      value={itemSave.porcent_envio_ticket_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-12 form-group">
                    <label htmlFor="logo">Logotipo:</label>
                    <input type="file" className="form-control" name="logo" id="logo" onChange={handleSaveChange} accept="image/*" />
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
              <h2 className="modal-title">Editar Empresa</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="name">Nombre:</label>
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
                    <label htmlFor="ruc">RUC:</label>
                    <div className="input-group">
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
                      <div className="input-group-btn">
                        <button className="btn btn-success" type="button" onClick={() => searchEmpresas(false)}>
                          <Search />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="address">Dirección:</label>
                    <input
                      type="text"
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
                  <div className="col-md-6 form-group">
                    <label htmlFor="form_sede">Sede:</label>
                    <Select
                      id="sede"
                      name="sede"
                      value={editedItem.sede}
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      fullWidth
                      size="small"
                    >
                      {sedes.map((sede, index) => {
                        return (
                          <MenuItem key={index} value={sede}>
                            {sede}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="numeros_sms">Números a enviar SMS:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numeros_sms"
                      id="numeros_sms"
                      placeholder="9xxxxxxx,9xxxxxxx,..."
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.numeros_sms || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="token_reporte">Token para reporte PDF:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="token_reporte"
                      id="token_reporte"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.token_reporte || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="url_facturacion">URL para facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="url_facturacion"
                      id="url_facturacion"
                      placeholder="http://..."
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.url_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="token_facturacion">Token para facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="token_facturacion"
                      id="token_facturacion"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.token_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="porcent_envio_ventas_facturacion">Porcentaje de envio del total de ventas a facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="porcent_envio_ventas_facturacion"
                      id="porcent_envio_ventas_facturacion"
                      placeholder="0.6"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.porcent_envio_ventas_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="porcent_envio_ticket_facturacion">Porcentaje de envio del total de tickets a facturación:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="porcent_envio_ticket_facturacion"
                      id="porcent_envio_ticket_facturacion"
                      placeholder="0.8"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.porcent_envio_ticket_facturacion || ''}
                    />
                  </div>
                  <div className="col-md-12 form-group">
                    <label htmlFor="logo">Logotipo:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      name="logo"
                      id="logo"
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
