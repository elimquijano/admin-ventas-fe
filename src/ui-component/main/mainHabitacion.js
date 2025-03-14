import { Close, PersonAddAlt1, Search, Send } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Autocomplete, Avatar, Button, Grid, Modal, Paper, Stack, TextField, Typography } from '@mui/material';
import { notificationSwal } from 'common/common';
import React from 'react';
import { useState } from 'react';

const MainHabitacion = ({ productos, clientes, totalDinnerCaja, handleSubmit }) => {
  const [cliente, setCliente] = useState({ document_type: 'DNI' });
  const [tipoDocuments] = useState(['DNI', 'PASAPORTE', 'CARNE DE EXTRANJERIA', 'CEDULA']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [isViewForm, setIsViewForm] = useState(false);
  const [disabledSearchButton, setDisabledsearchButton] = useState(false);
  const [productoInfo, setProductoInfo] = useState(null);

  const onHandleSubmit = async () => {
    if (!ValidacionItem(cliente)) {
      return;
    }

    if (isSubmitting) return; // Retornar si ya se está enviando el formulario
    setIsSubmitting(true); // Establecer isSubmitting a true

    try {
      const response = await handleSubmit(cliente, productoInfo?.id);
      if (response?.success) {
        setCliente({ document_type: 'DNI' });
      } else {
        notificationSwal('error', response?.message);
      }
    } catch (error) {
      notificationSwal('error', 'Ocurrió un error al enviar la solicitud');
    } finally {
      setIsSubmitting(false); // Establecer isSubmitting a false
      onCloseInfo();
    }
  };

  function ValidacionItem(itemSave) {
    let response = true;
    let msgResponse = '';

    if (!itemSave || Object.keys(itemSave).length === 0) {
      msgResponse += '* Debe completar los campos obligatorios.<br>';
      response = false;
    } else {
      if (!itemSave.document_type) {
        msgResponse += '* Debe seleccionar un tipo de Documento.<br>';
        response = false;
      }
      if (!itemSave.document_number) {
        msgResponse += '* Debe agregar un Número de Documento.<br>';
        response = false;
      }
      if (!itemSave.name) {
        msgResponse += '* Debe agregar un Nombre.<br>';
        response = false;
      }
    }

    if (response === false) {
      notificationSwal('error', msgResponse);
    }

    return response;
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const cleanedValue = value.trim();
    setCliente((prevClient) => ({
      ...prevClient,
      [name]: cleanedValue
    }));

    const autocomplete = clientes.find((c) => c[name] == cleanedValue);

    if (autocomplete) {
      setCliente(autocomplete);
      setDisabledsearchButton(true);
    } else {
      setDisabledsearchButton(false);
    }
  };

  const searchCliente = async () => {
    if (cliente?.document_type !== 'DNI') {
      notificationSwal('error', 'Solo funciona con DNI, rellene los datos manualmente para otros tipos');
      return;
    }
    if (!cliente?.document_number) {
      notificationSwal('error', 'Ingrese el Número de documento');
      return;
    }
    if (!(cliente?.document_number?.length === 8)) {
      notificationSwal('error', 'El número de documento debe contener 8 caracteres');
      return;
    }
    try {
      await fetch('https://apiperu.dev/api/dni', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer 27979c4825749caf1d156e747b61b1317c13487ac42ce18d5a66c079b55ce5a1'
        },
        body: JSON.stringify({
          dni: cliente?.document_number
        })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.success) {
            const result = data?.data;
            setCliente((prevClient) => ({
              ...prevClient,
              ['name']: result?.nombre_completo
            }));
            setDisabledsearchButton(true);
          } else {
            notificationSwal('error', data?.message + '. Rellene manualmente');
            setDisabledsearchButton(false);
          }
        })
        .catch((error) => {
          notificationSwal('error', 'No se encontró, ingrese sus datos manualmente');
          console.error('Error al obtener informacion del cliente: ', error);
        });
    } catch (error) {
      setDisabledsearchButton(false);
      notificationSwal('error', 'No se encontró, ingrese sus datos manualmente');
      console.error('Error al obtener informacion del cliente: ', error);
    }
  };

  const onOpenInfo = (producto) => {
    setIsViewForm(producto?.clientes?.length === 0);
    setOpenInfo(true);
    setProductoInfo(producto);
  };

  const onCloseInfo = () => {
    setIsViewForm(false);
    setOpenInfo(false);
    setProductoInfo(null);
  };

  return (
    <div>
      <Stack direction="row" justifyContent="end" alignItems="center" className="py-1">
        <Alert icon={false} severity="success" variant="filled">
          <AlertTitle className="m-0">
            <Typography variant="h2">
              {'S/. ' + Number(totalDinnerCaja.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </AlertTitle>
        </Alert>
      </Stack>
      <div className="d-flex">
        <div className="flex-grow-1">
          {productos.map((producto, index) => (
            <Button
              key={index}
              onClick={() => onOpenInfo(producto)}
              variant="contained"
              color={producto?.clientes?.length === 0 ? 'success' : 'error'}
              className="m-1"
              sx={{ width: '100px', height: '120px', overflow: 'hidden' }}
            >
              <Stack direction="column" justifyContent="space-between" className="h-100 w-100">
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap>{producto?.clientes?.length || 0}</Typography>
                  <Typography>{''}</Typography>
                </Stack>
                <Stack direction="column" alignItems="center">
                  <img src={producto?.image} alt="" style={{ objectFit: 'cover', height: '50px' }} />
                </Stack>
                <Stack direction="column" alignItems="center" sx={{ fontSize: '10px' }}>
                  {producto?.name}
                </Stack>
              </Stack>
            </Button>
          ))}
        </div>
      </div>
      {productoInfo && (
        <Modal open={openInfo} onClose={onCloseInfo} sx={{ zIndex: 100 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered d-flex justify-content-center align-items-center">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Habitación {productoInfo?.name || ''}</h4>
                <button onClick={onCloseInfo} className="btn btn-link">
                  <Close />
                </button>
              </div>
              <div className="modal-body">
                {isViewForm ? (
                  <div className="form">
                    <div className="row content">
                      <div className="col-sm-12">
                        <form className="form row">
                          <div className="col-sm-6 mb-4">
                            <label htmlFor="document_type">Tipo de Documento(*):</label>
                            <Autocomplete
                              size="small"
                              options={tipoDocuments}
                              getOptionLabel={(option) => option}
                              onChange={(event, newValue) => {
                                setCliente((prevClient) => ({ ...prevClient, document_type: newValue }));
                              }}
                              value={cliente.document_type || ''}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          </div>
                          <div className="col-sm-6 mb-4">
                            <label htmlFor="document_number">Número de documento(*):</label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                name="document_number"
                                id="document_number"
                                onChange={handleInputChange}
                                value={cliente.document_number || ''}
                              />
                              <div className="input-group-btn">
                                <button
                                  className="btn btn-success"
                                  type="button"
                                  onClick={() => searchCliente()}
                                  disabled={disabledSearchButton}
                                >
                                  <Search />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-6 mb-4">
                            <label htmlFor="name">Nombre(*):</label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              id="name"
                              onChange={handleInputChange}
                              value={cliente.name || ''}
                            />
                          </div>
                          <div className="col-sm-6 mb-4">
                            <label htmlFor="phone">Teléfono(opcional):</label>
                            <input
                              type="text"
                              className="form-control"
                              name="phone"
                              id="phone"
                              onChange={handleInputChange}
                              value={cliente.phone || ''}
                            />
                          </div>
                          <div className="col-sm-12">
                            <Stack direction={'row'} gap={2} justifyContent={'center'}>
                              <Button type="button" variant="contained" className="btn-secondary" onClick={onCloseInfo}>
                                Cancelar
                              </Button>
                              <LoadingButton
                                loading={isSubmitting}
                                variant="contained"
                                color="success"
                                onClick={onHandleSubmit}
                                loadingPosition="start"
                                startIcon={<Send />}
                              >
                                {isSubmitting ? 'Enviando...' : 'Asignar Habitacion'}
                              </LoadingButton>
                            </Stack>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Grid container>
                    <Grid item xs={12}>
                      <Stack direction={'row'} justifyContent={'center'} gap={1}>
                        {productoInfo?.clientes?.map((cliente, index) => {
                          return (
                            <Paper key={index} elevation={2} sx={{ padding: 2 }}>
                              <Stack justifyContent={'center'} alignItems={'center'} gap={2}>
                                <Avatar />
                                <Typography align="center" variant="h4">
                                  {cliente?.name || ''}
                                </Typography>
                                <Typography align="center" variant="h5">
                                  {`${cliente?.document_type}: ${cliente?.document_number}`}
                                </Typography>
                                <Typography align="center" variant="">
                                  {cliente?.phone || ''}
                                </Typography>
                              </Stack>
                            </Paper>
                          );
                        })}
                        <Button sx={{ flexGrow: 0, minHeight: 80 }} variant="contained" color="success" onClick={() => setIsViewForm(true)}>
                          <PersonAddAlt1 />
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MainHabitacion;
