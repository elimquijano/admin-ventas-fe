import { AddCircle, Close, FilterList, FilterListOff, RemoveCircle, Send } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material';
import { notificationSwal } from 'common/common';
import React from 'react';
import { useState } from 'react';

const MainProducts = ({ categorias = [], productos, totalDinnerCaja, onHandleSubmit, onChangeFilters }) => {
  const [preVenta, setPreVenta] = useState([]);
  const [subTotal, setSubTotal] = useState((0).toFixed(2));
  const [total, setTotal] = useState((0).toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  function addProductToPreVenta(id) {
    const item = preVenta.filter((p) => p.id == id);
    if (item.length > 0) {
      addQuantityToProduct(item[0].id);
    } else {
      const producto = productos.filter((p) => p.id == id)[0];
      const newPreVenta = { ...producto, quantity: 1, total: producto.price };
      setPreVenta([...preVenta, newPreVenta]);
      sumar([...preVenta, newPreVenta]);
    }
  }
  function addQuantityToProduct(id) {
    const newPreVenta = preVenta.map((producto) => {
      if (producto.id === id && producto.quantity < producto.amount) {
        const newQuantity = producto.quantity + 1;
        return { ...producto, quantity: newQuantity, total: newQuantity * producto.price };
      } else {
        return { ...producto };
      }
    });
    setPreVenta(newPreVenta);
    sumar(newPreVenta);
  }
  function removeQuantityToProduct(id) {
    const newPreVenta = preVenta.map((producto) => {
      if (producto.id === id && producto.quantity > 1) {
        const newQuantity = producto.quantity - 1;
        return { ...producto, quantity: newQuantity, total: newQuantity * producto.price };
      } else {
        return { ...producto };
      }
    });
    setPreVenta(newPreVenta);
    sumar(newPreVenta);
  }
  function removeProductFromPreVenta(id) {
    const newPreVenta = preVenta.filter((p) => p.id !== id);
    setPreVenta(newPreVenta);
    sumar(newPreVenta);
  }
  function sumar(newPreVenta) {
    if (newPreVenta.length > 0) {
      let suma = 0;
      newPreVenta.forEach((element) => {
        suma += element.total;
      });
      setSubTotal((suma / 1.18).toFixed(2));
      setTotal(suma.toFixed(2));
    } else {
      setSubTotal((0).toFixed(2));
      setTotal((0).toFixed(2));
    }
  }

  const handleSubmit = async () => {
    if (!ValidacionItem(preVenta)) {
      return;
    }

    if (isSubmitting) return; // Retornar si ya se está enviando el formulario
    setIsSubmitting(true); // Establecer isSubmitting a true

    try {
      const response = await onHandleSubmit(preVenta, total);
      if (response?.success) {
        setPreVenta([]);
        setSubTotal((0).toFixed(2));
        setTotal((0).toFixed(2));
      } else {
        notificationSwal('error', response?.message);
      }
    } catch (error) {
      notificationSwal('error', 'Ocurrió un error al enviar la solicitud');
    } finally {
      setIsSubmitting(false); // Establecer isSubmitting a false
    }
  };

  const ValidacionItem = (itemSave) => {
    let response = true;
    if (!itemSave || Object.keys(itemSave).length === 0) {
      notificationSwal('error', 'No se puede enviar campos vacios');
      response = false;
      return response;
    }
    return response;
  };

  return (
    <div>
      <div className="row">
        <div className="col-9 d-flex align-items-end">
          <Button variant="contained" color="secondary" className="m-1" onClick={() => onChangeFilters(0)}>
            <FilterListOff />
          </Button>
          {categorias.length > 0 &&
            categorias.map((categoria, index) => {
              return (
                <Button key={index} variant="contained" color="secondary" className="m-1" onClick={() => onChangeFilters(categoria?.id)}>
                  <FilterList />
                  {categoria.name}
                </Button>
              );
            })}
        </div>
        <div className="col-3 px-4">
          <Stack direction="row" justifyContent="end" alignItems="center" className="py-1">
            <Alert icon={false} severity="success" variant="filled">
              <AlertTitle className="m-0">
                <Typography variant="h2">
                  {'S/. ' + Number(totalDinnerCaja.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </AlertTitle>
            </Alert>
          </Stack>
        </div>
      </div>
      <div className="d-flex">
        <div className="flex-grow-1">
          {productos.map((producto, index) => (
            <Button
              key={index}
              onClick={() => addProductToPreVenta(producto.id)}
              variant="contained"
              color="error"
              className="m-1"
              sx={{ width: '100px', height: '120px', overflow: 'hidden' }}
              disabled={producto.amount == 0}
            >
              <Stack direction="column" justifyContent="space-between" className="h-100 w-100">
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap>{producto?.ventas || 0}</Typography>
                  <Typography noWrap>{producto?.amount || 0}</Typography>
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
        <Paper elevation={12} className="mx-2 p-3 d-flex flex-column justify-content-between" sx={{ minWidth: '350px', height: '500px' }}>
          <TableContainer component={Paper}>
            <Typography className="h4 text-center">Detalles de Pre-Venta</Typography>
            <Table sx={{ maxHeight: 650 }} size="small" aria-label="a dense table">
              <TableBody>
                {preVenta.map((p, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="center" className="px-0">
                      <img src={p.image} alt="" height="20px" style={{ objectFit: 'cover' }} />
                    </TableCell>
                    <TableCell align="left" className="px-0">
                      <Typography sx={{ width: '100px' }} noWrap>
                        {p.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <Typography>s/.{p.price}</Typography>
                    </TableCell>
                    <TableCell align="center" className="px-0">
                      <IconButton size="small" color="secondary" onClick={() => removeQuantityToProduct(p.id)}>
                        <RemoveCircle fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <Typography>{p.quantity}</Typography>
                    </TableCell>
                    <TableCell align="center" className="px-0">
                      <IconButton size="small" color="secondary" onClick={() => addQuantityToProduct(p.id)}>
                        <AddCircle fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" className="px-0">
                      <Typography>s/.{p.total}</Typography>
                    </TableCell>
                    <TableCell align="center" className="px-0">
                      <IconButton size="small" color="error" onClick={() => removeProductFromPreVenta(p.id)}>
                        <Close fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div>
            <Box className="py-3">
              <Stack direction="row" justifyContent="space-between">
                <Typography>SUBTOTAL</Typography>
                <Typography>s/. {subTotal}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography>IGV</Typography>
                <Typography>s/. {(total - subTotal).toFixed(2)}</Typography>
              </Stack>
              <Divider className="my-2" variant="fullWidth" />
              <Stack direction="row" justifyContent="space-between">
                <Typography>TOTAL</Typography>
                <Typography>s/. {total}</Typography>
              </Stack>
            </Box>
            <LoadingButton
              loading={isSubmitting}
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => handleSubmit()}
              loadingPosition="start"
              startIcon={<Send />}
            >
              {isSubmitting ? 'Enviando...' : 'Registrar'}
            </LoadingButton>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default MainProducts;
