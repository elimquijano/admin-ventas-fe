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
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { exportToExcel } from 'common/MaterialExportToExel';
import {
  API_URL_VENTA,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  API_URL_NEGOCIO,
  API_URL_USER,
  API_URL_TICKETS,
  API_URL_TIPO_TICKETS,
  API_URL_IMPRESION,
  getSession
} from 'common/common';
import { Print } from '@mui/icons-material';
import { columnsVentaTicketList } from 'common/ExportColums';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'barcode', label: 'BARRAS', minWidth: 100, key: 1 },
  { id: 'tipo_id', label: 'TIPO', minWidth: 100, key: 2 },
  { id: 'quantity', label: 'CANT', minWidth: 100, key: 3 },
  { id: 'unit_price', label: 'PU', minWidth: 100, key: 4 },
  { id: 'total', label: 'TOTAL', minWidth: 100, key: 5 },
  { id: 'code', label: 'CODIGO', minWidth: 100, key: 6 },
  { id: 'negocio_id', label: 'NEGOCIO', minWidth: 100, key: 7 },
  { id: 'user_id', label: 'USUARIO', minWidth: 100, key: 7 },
  { id: 'caja_id', label: 'CAJA', minWidth: 100, key: 7 }
];

export default function VentasTicketsPage() {
  const id = getSession('NEG_ID');
  const [negocios, setNegocios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ negocio_id: id });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_TIPO_TICKETS + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.negocio_id == id);
        setTipos(filter);
      })
      .catch((error) => console.error('Error en la solicitud de tipos de ticket:', error));
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.id == id);
        setNegocios(filter);
      })
      .catch((error) => console.error('Error en la solicitud de negocios:', error));
    fetch(API_URL_USER + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filter = data.filter((n) => n.negocio_id == id);
        setUsuarios(filter);
      })
      .catch((error) => console.error('Error en la solicitud de usuarios:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_TICKETS, filter, 'GET');
      setFilteredRows(result?.data);
      setTotalItems(result?.total);
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  async function ExportFilter() {
    let filter = searchFilter;
    filter.page = 1;
    filter.paginate = 1000000;
    try {
      const result = await fetchAPIAsync(API_URL_TICKETS, filter, 'GET');
      if (result && result.data) {
        const dataMapeada = result.data.map((ticket) => {
          const fechaFormateada = String(ticket.created_at).split('T')[0];
          const tipoFolio = '03';
          const tipoDocumento = '0';
          const documento = '0000000';
          const name = 'Varios Varios Varios';
          const [serie, numero] = String(ticket.code).split('-');
          const total = Number(ticket.total).toFixed(2);
          const IGV = (Number(ticket.total) * 0.18).toFixed(2);
          const precioBase = (Number(ticket.total) - Number(IGV)).toFixed(2);

          return {
            fechae: fechaFormateada,
            fechav: fechaFormateada,
            tipoc: tipoFolio,
            serie: serie,
            numero: numero,
            tipodoc: tipoDocumento,
            documento: documento,
            nombre: name,
            basei: precioBase,
            igv: IGV,
            icbper: Number(0).toFixed(2),
            exonerado: Number(0).toFixed(2),
            retencion: Number(0).toFixed(2),
            total: total
          };
        });

        exportToExcel(dataMapeada, columnsVentaTicketList, 'TICKETS');
      }
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  function CleanFilter() {
    setFilteredRows({});
    setSearchFilter({negocio_id: id});
    setPage(0);
    setRowsPerPage(10);
    setTotalItems(0);
  }

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setSearchFilter((prevSearch) => ({
      ...prevSearch,
      [name]: cleanedValue
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
    const updatedData = {
      reason: editedItem.reason,
      cliente_id: editedItem.cliente_id,
      negocio_id: editedItem.negocio_id
    };

    editarSwal(API_URL_VENTA, elementoId, updatedData, SearchFilter);
    handleCloseModal2();
  }

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      reason: row.reason,
      cliente_id: row.cliente_id,
      negocio_id: row.negocio_id
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_VENTA, SearchFilter);
  }

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };

  return (
    <div>
      <div className="form">
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_barcode">Código de Barras:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_barcode"
                  id="form_barcode"
                  onChange={handleSearchChange}
                  value={searchFilter.form_barcode || ''}
                />
              </div>
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
                <label htmlFor="caja_id">Caja:</label>
                <input
                  type="text"
                  className="form-control"
                  name="caja_id"
                  id="caja_id"
                  onChange={handleSearchChange}
                  value={searchFilter.caja_id || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="negocio_id">Negocio:</label>
                <Autocomplete
                  options={negocios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, negocio_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={negocios.find((n) => n.id == searchFilter.negocio_id) || null}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="user_id">Usuario:</label>
                <Autocomplete
                  options={usuarios}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, user_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  value={usuarios.find((n) => n.id == searchFilter.user_id) || null}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_tipo_id">Tipos:</label>
                <Autocomplete
                  options={tipos}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, tipo_id: newValue ? newValue.id : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  size="small"
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_desde_fecha">Desde:</label>
                <input
                  type="date"
                  className="form-control"
                  name="form_desde_fecha"
                  id="form_desde_fecha"
                  onChange={handleSearchChange}
                  value={searchFilter.form_desde_fecha || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_hasta_fecha">Hasta:</label>
                <input
                  type="date"
                  className="form-control"
                  name="form_hasta_fecha"
                  id="form_hasta_fecha"
                  onChange={handleSearchChange}
                  value={searchFilter.form_hasta_fecha || ''}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" onClick={() => ExportFilter()}>
              <FileDownloadIcon /> EXPORTAR
            </button>
            <button className="btn btn-danger w-100 mb-1" onClick={CleanFilter}>
              <CleaningServicesIcon /> LIMPIAR
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
                      {columns.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'tipo_id'
                              ? tipos.find((prov) => prov.id === row.tipo_id)?.name
                              : column.id === 'unit_price' || column.id === 'total'
                              ? Number(row[column.id]).toFixed(2)
                              : column.id === 'negocio_id'
                              ? negocios.find((prov) => prov.id === row.negocio_id)?.name
                              : column.id === 'user_id'
                              ? usuarios.find((prov) => prov.id === row.user_id)?.name
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      <TableCell className="d-flex">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            fetchAPIAsync(API_URL_IMPRESION + `ticket/${row.id}`, 'GET');
                          }}
                          disabled
                        >
                          <Print />
                        </button>
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
          rowsPerPageOptions={[10, 100, 1000]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal
        open={openModal2}
        onClose={handleCloseModal2}
        aria-labelledby="edition-modal-title"
        aria-describedby="edition-modal-description"
      >
        <div className="modal-dialog modal-dialog-centered d-flex justify-content-center align-items-center">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Venta</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="reason">Razón:</label>
                  <textarea
                    type="text"
                    className="form-control"
                    name="reason"
                    id="reason"
                    onChange={(event) => {
                      const { name, value } = event.target;
                      handleEditChange(name, value);
                    }}
                    value={editedItem.reason || ''}
                  />
                </div>
                {/* <div className="form-group">
                  <label htmlFor="cliente_id">Cliente:</label>
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, newValue) => {
                      handleEditChange('cliente_id', newValue ? newValue.id : '');
                    }}
                    value={clientes.find((cat) => cat.id === editedItem.cliente_id) || null}
                    renderInput={(params) => <TextField {...params} label="Cliente" />}
                  />
                </div> */}
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
