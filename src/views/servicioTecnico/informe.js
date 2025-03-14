import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsInforme } from 'common/ExportColums';
import DownloadIcon from '@mui/icons-material/Download';
import {
  API_URL_INFORME,
  API_URL_PRODUCTO,
  fetchAPIAsync,
  notificationSwal,
  eliminarSwal,
  editarSwal,
  descargarDocumento,
  API_URL_DES_INFORME
} from 'common/common';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'observation', label: 'Observación', minWidth: 20, key: 1 },
  { id: 'conclusion', label: 'Conclusión', minWidth: 20, key: 2 }
];

export default function InformePage() {
  const { id, detid } = useParams();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  const [itemSave, setItemSave] = React.useState({
    id_det_ser_tec: detid,
    images: []
  });

  useEffect(() => {
    SearchFilter(page);
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_id_det_ser_tec = detid;

    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_INFORME, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_INFORME, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsInforme, 'Informes');
      }
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
      console.log(itemSave);
      const result = await fetchAPIAsync(API_URL_INFORME, itemSave, 'POST');
      notificationSwal('success', '¡Se registró el ' + result.id + ' informe de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
    } catch (error) {
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
      if (!itemSave.observation) {
        msgResponse += '* Debe agregar una Observación.<br>';
        response = false;
      }
      if (!itemSave.conclusion) {
        msgResponse += '* Debe añadir una Conclusión.<br>';
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

  const handleImageChange = (e) => {
    const files = e.target.files;

    if (files.length > 0) {
      const fileList = Array.from(files);

      setItemSave((prevItemSave) => ({
        ...prevItemSave,
        images: fileList
      }));
    }
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
      amount: editedItem.amount,
      price: editedItem.price,
      moneda: editedItem.moneda,
      id_replacement: editedItem.id_replacement,
      description: editedItem.description
    };

    editarSwal(API_URL_INFORME, elementoId, updatedData, SearchFilter);
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
      amount: row.amount,
      price: row.price,
      moneda: row.moneda,
      id_replacement: row.id_replacement,
      description: row.description
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    eliminarSwal(elementoId, API_URL_INFORME, SearchFilter);
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

  useEffect(() => {
    fetch(API_URL_PRODUCTO + 'data')
      .then((response) => response.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error en la solicitud de productos:', error));
  }, []);

  async function descargarInforme(row) {
    try {
      await descargarDocumento(API_URL_DES_INFORME + '?page=1&paginate=100000&id_informe=' + row.id, 'products');
    } catch (error) {
      notificationSwal('error', error);
    }
  }
  return (
    <div>
      <div className="form">
        <Link to={'/detserviciotecnico/' + id} className="btn btn-light m-2">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpenModal1} className="btn btn-info m-2">
          Registrar Informe
        </Button>
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_observation">Obeservación:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_observation"
                  id="form_observation"
                  onChange={handleSearchChange}
                  value={searchFilter.form_observation || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_conclusion">Obeservación:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_conclusion"
                  id="form_conclusion"
                  onChange={handleSearchChange}
                  value={searchFilter.form_conclusion || ''}
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
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          {row[column.id]}
                        </TableCell>
                      ))}
                      {/* Columna de botones de acción */}

                      <TableCell>
                        <button className="btn btn-success" onClick={() => descargarInforme(row)}>
                          <DownloadIcon />
                        </button>
                        <Button
                          onClick={() => {
                            handleOpenModal2();
                            handleEditar(row);
                          }}
                          className="btn btn-warning"
                        >
                          <EditIcon />
                        </Button>
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
              <h2 className="modal-title">Registre una nuevo informe</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="observation">Obeservación:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="observation"
                        id="observation"
                        onChange={handleSaveChange}
                        value={itemSave.observation || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="conclusion">Conclusión:(*)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="conclusion"
                        id="conclusion"
                        onChange={handleSaveChange}
                        value={itemSave.conclusion || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <input type="file" accept="image/*" name="images" id="images" multiple onChange={handleImageChange} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-info" onClick={SaveItem}>
                REGISTRAR
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
              <h2 className="modal-title">Editar Informe</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="observation">Obeservación:(*)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="observation"
                      id="observation"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.observation || ''}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="conclusion">Conclusión:(*)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="conclusion"
                      id="conclusion"
                      onChange={(event) => {
                        const { name, value } = event.target;
                        handleEditChange(name, value);
                      }}
                      value={editedItem.conclusion || ''}
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
