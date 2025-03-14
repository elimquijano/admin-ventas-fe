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
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { exportToExcel } from 'common/MaterialExportToExel';
import { columnsModeloEquipo } from 'common/ExportColums';
import {
    API_URL_MODELOEQUIPO,
    API_URL_PRODUCTO,
    fetchAPIAsync,
    notificationSwal,
    eliminarSwal,
    editarSwal,
} from 'common/common';

const columns = [
    { id: 'code', label: 'Código', minWidth: 20, key: 0 },
    { id: 'description', label: 'Descripción', minWidth: 20, key: 1 },
    { id: 'num_part', label: 'Nro. Parte', minWidth: 20, key: 2 },
    { id: 'amount', label: 'Monto', minWidth: 100, key: 3 },
    { id: 'moneda', label: 'Moneda', minWidth: 50, key: 4 }
];

export default function ModeloEquipo() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchFilter, setSearchFilter] = React.useState({});
    const [filteredRows, setFilteredRows] = React.useState({});
    const [totalItems, setTotalItems] = React.useState(0);
    const [itemSave, setitemSave] = React.useState(0);
    const [openModal1, setOpenModal1] = useState(false);
    const [openModal2, setOpenModal2] = useState(false);
    const [editedItem, setEditedItem] = useState(0);
    const [monedas, setMonedas] = React.useState([]);


    useEffect(() => {
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
            const result = await fetchAPIAsync(API_URL_MODELOEQUIPO, filter, 'GET');
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
            const result = await fetchAPIAsync(API_URL_MODELOEQUIPO, filter, 'GET');
            if (result) {
                exportToExcel(result.data, columnsModeloEquipo, "Modelo de equipo");
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
            const result = await fetchAPIAsync(API_URL_MODELOEQUIPO, itemSave, 'POST');
            notificationSwal('success', '¡Se registró ' + result.reason + ' de forma exitosa!');
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
            if (!itemSave.code) {
                msgResponse += '* Debe añadir un código.<br>';
                response = false;
            }
            if (!itemSave.moneda) {
                msgResponse += '* Debe seleccionar el tipo de cambio.<br>';
                response = false;
            }
            if (!itemSave.amount) {
                msgResponse += '* Debe ingresaruna cantidad.<br>';
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
        setitemSave((prevSearch) => ({
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
            code: editedItem.code,
            amount: editedItem.amount,
            num_part: editedItem.num_part,
            moneda: editedItem.moneda,
            description: editedItem.description,
        };

        editarSwal(API_URL_MODELOEQUIPO, elementoId, updatedData, SearchFilter);
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
            code: row.code,
            amount: row.amount,
            num_part: row.num_part,
            moneda: row.moneda,
            description: row.description
        });
    }

    function handleEliminar(row) {
        const elementoId = row.id;
        eliminarSwal(elementoId, API_URL_MODELOEQUIPO, SearchFilter);
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
        fetch(API_URL_PRODUCTO + 'moneda')
            .then(response => response.json())
            .then(data => setMonedas(data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <div className="form">
                <Button onClick={handleOpenModal1} className="btn btn-info mb-3">
                    Registrar
                </Button>
                <div className="row content">
                    <div className="col-sm-9">
                        <form className="form row mb-4">
                            <div className="col-sm-4">
                                <label htmlFor="form_description">Descripción:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="form_description"
                                    id="form_description"
                                    onChange={handleSearchChange}
                                    value={searchFilter.form_description || ''}
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
                                <label htmlFor="form_num_part">Nro. Parte:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="form_num_part"
                                    id="form_num_part"
                                    onChange={handleSearchChange}
                                    value={searchFilter.form_num_part || ''}
                                />
                            </div>
                            <div className="col-sm-4">
                                <label htmlFor="form_amount">Monto:</label>
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
                                <label htmlFor="form_moneda">Moneda:</label>
                                <Autocomplete
                                    options={monedas}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(event, newValue) => {
                                        setSearchFilter({ ...searchFilter, form_moneda: newValue ? newValue.id : '' });
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Moneda" />}
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
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.id === 'price' ? (
                                                        `${row.moneda} ${row.price / 100}`
                                                    ) : (
                                                        row[column.id]
                                                    )}
                                                </TableCell>
                                            ))}
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
                            <h2 className="modal-title">Registre una nuevo Modelo de equipo</h2>
                            <button onClick={handleCloseModal1} className="btn btn-link">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form encType="multipart/form-data">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="code">Modelo(*):</label>
                                            <textarea
                                                type="text"
                                                className="form-control"
                                                name="code"
                                                id="code"
                                                onChange={handleSaveChange}
                                                value={itemSave.code || ''}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="num_part">Nro Parte:</label>
                                            <textarea
                                                type="int"
                                                className="form-control"
                                                name="num_part"
                                                id="num_part"
                                                onChange={handleSaveChange}
                                                value={itemSave.num_part || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="moneda">Moneda(*):</label>
                                            <Autocomplete
                                                options={monedas}
                                                getOptionLabel={(option) => option.name}
                                                onChange={(event, newValue) => {
                                                    setitemSave({ ...itemSave, moneda: newValue ? newValue.id : '' });
                                                }}
                                                value={monedas.find((prov) => prov.id === itemSave.moneda) || null}
                                                renderInput={(params) => <TextField {...params} label="Moneda" />}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="amount">Monto(*):</label>
                                            <textarea
                                                type="int"
                                                className="form-control"
                                                name="amount"
                                                id="amount"
                                                onChange={handleSaveChange}
                                                value={itemSave.amount || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="description">Descripción(*):</label>
                                            <textarea
                                                type="textarea"
                                                className="form-control"
                                                name="description"
                                                id="description"
                                                onChange={handleSaveChange}
                                                value={itemSave.description || ''}
                                            />
                                        </div>
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
                            <h2 className="modal-title">Editar Modelo de equipo</h2>
                            <button onClick={handleCloseModal2} className="btn btn-link">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form encType="multipart/form-data">
                                <div className="form-group">
                                    <label htmlFor="code">Código:</label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        name="code"
                                        id="code"
                                        onChange={(event) => {
                                            const { name, value } = event.target;
                                            handleEditChange(name, value);
                                        }}
                                        value={editedItem.code || ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="amount">Cantidad:</label>
                                    <textarea
                                        type="int"
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
                                <div className="form-group">
                                    <label htmlFor="num_part">Nro. Parte:</label>
                                    <textarea
                                        type="text"
                                        className="form-control"
                                        name="num_part"
                                        id="num_part"
                                        onChange={(event) => {
                                            const { name, value } = event.target;
                                            handleEditChange(name, value);
                                        }}
                                        value={editedItem.num_part || ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="moneda">Moneda:</label>
                                    <Autocomplete
                                        options={monedas}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event, newValue) => {
                                            handleEditChange('moneda', newValue ? newValue.id : '');
                                        }}
                                        value={monedas.find((cat) => cat.id === editedItem.moneda) || null}
                                        renderInput={(params) => <TextField {...params} label="Moneda" />}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Descripción:</label>
                                    <textarea
                                        type="textarea"
                                        className="form-control"
                                        name="description"
                                        id="description"
                                        onChange={(event) => {
                                            const { name, value } = event.target;
                                            handleEditChange(name, value);
                                        }}
                                        value={editedItem.description || ''}
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
