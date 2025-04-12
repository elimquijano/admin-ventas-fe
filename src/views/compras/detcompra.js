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
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsDetComprasList } from 'common/ExportColums';
import {
  API_URL_DETCOMPRA,
  API_URL_PRODUCTO,
  fetchAPIAsync,
  notificationSwal,
  redirectToRelativePage,
  getSession,
  postData
} from 'common/common';
import { Link } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const columns = [
  { id: 'id', label: 'ID', minWidth: 20, key: 0 },
  { id: 'amount', label: 'CANTIDAD', minWidth: 20, key: 1 },
  { id: 'price', label: 'PRECIO', minWidth: 20, key: 2 },
  { id: 'name_producto', label: 'PRODUCTO', minWidth: 100, key: 3 }
];

export default function DetCompraPage() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState({});
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [monedas, setMonedas] = useState([]);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [editedItem, setEditedItem] = useState(0);
  const [itemSave, setItemSave] = useState({
    compra_id: id,
    moneda: 'PEN'
  });

  useEffect(() => {
    SearchFilter(page);
    fetch(API_URL_PRODUCTO + 'data')
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data?.filter((n) => n.negocio_id == getSession('NEG_ID')) || data;
        setProductos(filteredData);
      })
      .catch((error) => console.error('Error en la solicitud de productos:', error));
    fetch(API_URL_PRODUCTO + 'moneda')
      .then((response) => response.json())
      .then((data) => setMonedas(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    filter.form_compra_id = id;

    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_DETCOMPRA, filter, 'GET');
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
      const result = await fetchAPIAsync(API_URL_DETCOMPRA, filter, 'GET');
      if (result) {
        exportToExcel(result.data, columnsDetComprasList, 'Detalle Compra');
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
    try {
      const dataForm = {
        compra_id: id,
        detalle: filteredRows
      };

      await postData(API_URL_DETCOMPRA, dataForm);

      notificationSwal('success', '¡Detalles actualizados correctamente!');
      handleCloseModal1();
      SearchFilter(page);
      redirectToRelativePage('/#/compra/');
    } catch (error) {
      notificationSwal('error', 'Error al realizar cambios.');
      handleCloseModal1();
      SearchFilter(page);
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
      if (!itemSave.amount || itemSave.amount < 0) {
        msgResponse += '* Debe agregar una cantidad correcta.<br>';
        response = false;
      }
      if (!itemSave.price || itemSave.price < 0) {
        msgResponse += '* Debe añadir un precio correcto.<br>';
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
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: value
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

  const handleAddToDetalleCompraList = () => {
    if (ValidacionItemSave(itemSave) === false) {
      handleCloseModal1();
      return;
    }

    setFilteredRows((prevList) => {
      const newList = [...prevList, { ...itemSave, id: prevList?.length + 1, state: 'nuevo' }];
      return newList;
    });
    setTotalItems((prevTotalItems) => prevTotalItems + 1);
    notificationSwal('success', 'Añadido a la lista');
    setItemSave({ compra_id: id });
  };

  return (
    <div>
      <div>
        <div className="form">
          <Link to={'/compra'} className="btn btn-light m-3">
            <KeyboardArrowLeftIcon /> Retornar
          </Link>{' '}
          <Button onClick={handleOpenModal1} className="btn btn-info m-3">
            Agregar Producto a la Compra {id}
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
                    type="number"
                    className="form-control"
                    name="form_price"
                    id="form_price"
                    onChange={handleSearchChange}
                    value={searchFilter.form_price || ''}
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
                    value={productos.find((cat) => cat.id === searchFilter.form_producto_id) || null}
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
                    value={monedas.find((cat) => cat.id === searchFilter.form_moneda) || null}
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
                  {filteredRows.map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                        {columns.map((column) => (
                          <TableCell key={column.id} align={column.align}>
                            {column.id === 'name_producto'
                              ? productos.find((prov) => prov.id === row.producto_id)?.name
                              : column.id === 'price'
                              ? `${row.moneda} ${row.price}`
                              : row[column.id]}
                          </TableCell>
                        ))}
                        {/* Columna de botones de acción */}
                        <TableCell>
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
                <h2 className="modal-title">Registre una nuevo detalle de compra</h2>
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
                          size="small"
                          options={productos}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setItemSave({
                              ...itemSave,
                              producto_id: newValue ? newValue.id : '',
                              price: newValue ? newValue.price : ''
                            });
                          }}
                          value={productos.find((prov) => prov.id === itemSave.producto_id) || null}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="moneda">Moneda:</label>
                        <Autocomplete
                          size="small"
                          options={monedas}
                          getOptionLabel={(option) => option.name}
                          onChange={(event, newValue) => {
                            setItemSave({ ...itemSave, moneda: newValue ? newValue.id : '' });
                          }}
                          value={monedas.find((cat) => cat.id === itemSave.moneda) || null}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button className="btn btn-info" onClick={handleAddToDetalleCompraList}>
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
                <h2 className="modal-title">Editar detalle de compra</h2>
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
    </div>
  );
}
