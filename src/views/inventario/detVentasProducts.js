import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsDetVentasList } from 'common/ExportColums';
import { API_URL_DETVENTA, API_URL_PRODUCTO, fetchAPIAsync, getSession, notificationSwal } from 'common/common';
import { Link } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'producto_id', label: 'Producto', minWidth: 100, key: 1 },
  { id: 'quantity', label: 'Cantidad', minWidth: 20, key: 2 },
  { id: 'price', label: 'Precio Unitario', minWidth: 20, key: 3 },
  { id: 'total', label: 'Total', minWidth: 20, key: 4 }
];

export default function DetVentasProductsPage() {
  const { id } = useParams();
  const negocio_id = getSession('NEG_ID');
  const [productos, setProductos] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchFilter, setSearchFilter] = React.useState({});
  const [filteredRows, setFilteredRows] = React.useState({});
  const [totalItems, setTotalItems] = React.useState(0);
  const [monedas, setMonedas] = React.useState([]);
  const [itemSave, setItemSave] = React.useState({
    venta_id: id
  });
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_PRODUCTO + 'moneda')
      .then((response) => response.json())
      .then((data) => setMonedas(data))
      .catch((error) => console.error('Error:', error));
    fetch(API_URL_PRODUCTO + '?paginate=1000000000&negocio_id=' + negocio_id)
      .then((response) => response.json())
      .then((data) => setProductos(data?.data))
      .catch((error) => console.error('Error en la solicitud de productos:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.venta_id = id;

    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_DETVENTA, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_DETVENTA, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsDetVentasList, 'Detalle Ventas');
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
    const jsonData = JSON.stringify(filteredRows);
    let dataForm = {
      venta_id: id,
      detalle: jsonData
    };

    await fetchAPIAsync(API_URL_DETVENTA, dataForm, 'POST');
    notificationSwal('success', '¡Detalles actualizados correctamente!');
    handleCloseModal1();
    SearchFilter(page);
    redirectToRelativePage('/#/venta/');
  }

  function ValidacionItemSave(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      notificationSwal('error', 'Debe completar los campos obligatorios');
      response = false;
      return response;
    } else {
      if (!itemSave.amount) {
        msgResponse += '* Debe agregar una cantidad.<br>';
        response = false;
      }
      if (!itemSave.price) {
        msgResponse += '* Debe añadir un precio.<br>';
        response = false;
      }
      if (!itemSave.moneda) {
        msgResponse += '* Debe seleccionar un tipo de cambio.<br>';
        response = false;
      }
      if (!itemSave.producto_id) {
        msgResponse += '* Debe seleccionar un producto.<br>';
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
    const cleanedValue = value.trim();
    setItemSave((prevSearch) => ({
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
      amount: editedItem.amount,
      price: editedItem.price,
      moneda: editedItem.moneda,
      producto_id: editedItem.producto_id
    };

    setFilteredRows((prevRows) => prevRows.map((item) => (item.id === elementoId ? { ...item, ...updatedData } : item)));
    notificationSwal('success', 'Editado correctamente de tu lista');
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
      producto_id: row.producto_id
    });
  }

  function handleEliminar(row) {
    const elementoId = row.id;
    setFilteredRows((prevRows) => prevRows.filter((item) => item.id !== elementoId));
    setTotalItems((prevTotalItems) => prevTotalItems - 1);
    notificationSwal('success', 'Eliminado de tu lista');
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

  const handleAddToDetalleList = () => {
    if (ValidacionItemSave(itemSave) === false) {
      handleCloseModal1();
      return;
    }

    setFilteredRows((prevList) => {
      const lastId = prevList.length > 0 ? prevList[prevList.length - 1].id : 0;
      const newId = lastId + 1;

      const newList = [...prevList, { ...itemSave, id: newId, state: 'nuevo' }];
      return newList;
    });

    setItemSave({
      venta_id: id,
      state: 'nuevo'
    });

    setTotalItems((prevTotalItems) => prevTotalItems + 1);

    notificationSwal('success', 'Añadido a la lista');
  };

  return (
    <div>
      <div className="form">
        <Link to={'/venta-productos'} className="btn btn-light m-3">
          <KeyboardArrowLeftIcon /> Retornar
        </Link>{' '}
        <Button onClick={handleOpenModal1} className="btn btn-info m-3">
          Agregar Productos a la compra {id}
        </Button>
        <Button onClick={SaveItem} className="btn btn-primary m-3">
          {totalItems === 0 ? 'Guardar cambios' : 'Actualizar cambios'}
        </Button>
        <div className="row content">
          <div className="col-sm-9">
            <form className="form row mb-4">
              <div className="col-sm-4">
                <label htmlFor="form_amount">Cantidad:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_amount"
                  id="form_amount"
                  onChange={handleSearchChange}
                  value={searchFilter.form_amount || ''}
                />
              </div>
              <div className="col-sm-4">
                <label htmlFor="form_price">Precio:</label>
                <input
                  type="text"
                  className="form-control"
                  name="form_price"
                  id="form_price"
                  onChange={handleSearchChange}
                  value={searchFilter.form_price || ''}
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
                      {columns.map((column, index) => {
                        return (
                          <TableCell key={index} align={column.align}>
                            {column.id === 'producto_id'
                              ? productos.find((prov) => prov.id === row.producto_id)?.name
                              : column.id === 'price'
                              ? Number(productos.find((prov) => prov.id === row.producto_id)?.price).toFixed(2)
                              : column.id === 'total'
                              ? Number(row[column.id]).toFixed(2)
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      {/* Columna de botones de acción */}
                      <TableCell>
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
              <h2 className="modal-title">Registre una nuevo detalle de venta</h2>
              <button onClick={handleCloseModal1} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="amount">Cantidad:</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        id="amount"
                        onChange={handleSaveChange}
                        value={itemSave.amount || ''}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="producto_id">Producto:</label>
                      <Autocomplete
                        options={productos}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, producto_id: newValue ? newValue.id : '' });
                        }}
                        value={productos.find((prov) => prov.id === itemSave.producto_id) || null}
                        renderInput={(params) => <TextField {...params} label="Producto" />}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="moneda">Moneda:</label>
                      <Autocomplete
                        options={monedas}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => {
                          setItemSave({ ...itemSave, moneda: newValue ? newValue.id : '' });
                        }}
                        value={monedas.find((cat) => cat.id === itemSave.moneda) || null}
                        renderInput={(params) => <TextField {...params} label="Moneda" />}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="price">Precio:</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        id="price"
                        onChange={handleSaveChange}
                        value={itemSave.price || ''}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <button className="btn btn-info" onClick={handleAddToDetalleList}>
                <ReceiptLongIcon /> AÑADIR A LA LISTA
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
              <h2 className="modal-title">Editar detalle de venta</h2>
              <button onClick={handleCloseModal2} className="btn btn-link">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="amount">Cantidad:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    id="amount"
                    onChange={(event) => {
                      const { name, value } = event.target;
                      handleEditChange(name, value);
                    }}
                    value={editedItem.amount || ''}
                  />
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
