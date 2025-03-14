import * as React from 'react';
import { useEffect } from 'react';
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
import { API_URL_NEGOCIO, API_URL_TRANSACCIONES, fetchAPIAsync, getSession, notificationSwal, restarCincoHoras } from 'common/common';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsTransaccionesList } from 'common/ExportColums';
import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const columns = [
  { id: 'name_pro', label: 'PRODUCTO', align: 'left', minWidth: 150, key: 0 },
  { id: 'tipo', label: 'TIPO', align: 'left', minWidth: 100, key: 1 },
  { id: 'cantidad', label: 'CANTIDAD', align: 'right', minWidth: 20, key: 2 },
  { id: 'price', label: 'PRECIO', align: 'left', minWidth: 11, key: 4 },
  { id: 'name_neg', label: 'NEGOCIO', align: 'left', minWidth: 20, key: 6 },
  { id: 'created_at', label: 'FECHA Y HORA', align: 'left', minWidth: 10, key: 5 }
];

export default function TransaccionPage() {
  const id = getSession('NEG_ID');
  const [locales, setLocales] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({ form_negocio_id: id });
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_NEGOCIO + 'data')
      .then((response) => response.json())
      .then((data) => {
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
      const result = await fetchAPIAsync(API_URL_TRANSACCIONES, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_TRANSACCIONES, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsTransaccionesList, 'Transacciones');
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
                <label htmlFor="form_name_pro">Producto:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_name_pro"
                  id="form_name_pro"
                  onChange={handleSearchChange}
                  value={searchFilter.form_name_pro || ''}
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
              <div className="col-sm-4">
                <label htmlFor="form_tipo">Tipo:</label>
                <Autocomplete
                  size="small"
                  options={['ENTRADA', 'SALIDA']}
                  onChange={(event, newValue) => {
                    setSearchFilter({ ...searchFilter, form_tipo: newValue ? newValue : '' });
                  }}
                  value={searchFilter.form_tipo || null}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_fecha">Fecha:</label>
                <input
                  type="date"
                  className="form-control"
                  name="form_fecha"
                  id="form_fecha"
                  onChange={handleSearchChange}
                  value={searchFilter.form_fecha || ''}
                />
              </div>
            </form>
          </div>
          <div className="col-sm-3">
            <button className="btn btn-success w-100 mb-1" onClick={() => SearchFilter()}>
              <SearchIcon /> BUSCAR
            </button>
            <button className="btn btn-warning w-100 mb-1" onClick={ExportFilter}>
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
                  {/* <TableCell>Acciones</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const color = row['tipo'] === 'ENTRADA' ? 'text-success' : 'text-danger';
                        const icon = row['tipo'] === 'ENTRADA' ? ' + ' : ' - ';
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.id == 'price' ? (
                              `${row['moneda']} ${row['price']}`
                            ) : column.id == 'created_at' ? (
                              restarCincoHoras(row[column.id])
                            ) : column.id == 'cantidad' ? (
                              <span className={color}>
                                {icon}
                                {row[column.id]}
                              </span>
                            ) : (
                              row[column.id]
                            )}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      {/* <TableCell>
                        <Button className="btn btn-danger" onClick={() => handleEliminar(row)}>
                          <DeleteIcon />
                        </Button>
                      </TableCell> */}
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
    </div>
  );
}
