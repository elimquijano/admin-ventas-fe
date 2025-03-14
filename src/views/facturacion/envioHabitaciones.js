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
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { API_URL_DOCUMENTOS, fetchAPIAsync, notificationSwal, getSession, API_URL_NEGOCIO, API_URL_FACTURACION } from 'common/common';
import { Autocomplete, TextField } from '@mui/material';

const getPrevMonthOnString = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
};
const getTodayOnString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const columns = [
  { id: 'negocio_id', label: 'EMPRESA', minWidth: 100 },
  { id: 'name', label: 'DOCUMENTO', minWidth: 170 },
  { id: 'serie', label: 'SERIE', minWidth: 170 },
  { id: 'monto_total', label: 'TOTAL', minWidth: 170 },
  { id: 'monto_total_enviado', label: 'TOTAL ENVIADO', minWidth: 170 },
  { id: 'porcentaje_enviado', label: 'PORCENTAJE', minWidth: 170 }
];

export default function EnvioHabitacionesPage() {
  const id = getSession('NEG_ID');
  const [negocios, setNegocios] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({
    form_negocio_id: id,
    form_desde_fecha: getPrevMonthOnString(),
    form_hasta_fecha: getTodayOnString()
  });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const negocio = data.filter((n) => n.id == id);
        setNegocios(negocio);
      })
      .catch((error) => console.error('Error en la solicitud de negocios:', error));
    fetch(API_URL_DOCUMENTOS + 'tipos')
      .then((response) => response.json())
      .then((data) => setDocumentos(data))
      .catch((error) => console.error('Error en la solicitud de documentos:', error));
    SearchFilter(page);
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_tipo = 'habitaciones';
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_FACTURACION, filter, 'GET');
      setFilteredRows(result);
      setTotalItems(result?.length);
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
  return (
    <div>
      <div className="form">
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
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
                  value={negocios.find((n) => n.id == searchFilter.form_negocio_id) || null}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_name">Tipo:</label>
                <Autocomplete
                  options={documentos}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_name: newValue ? newValue : '' });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  size="small"
                  value={searchFilter?.form_name || null}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_serie">Serie:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_serie"
                  id="form_serie"
                  onChange={handleSearchChange}
                  value={searchFilter.form_serie || ''}
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
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id == 'negocio_id' ? negocios.find((n) => n.id == row[column.id])?.name : row[column.id]}
                          </TableCell>
                        );
                      })}
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
    </div>
  );
}
