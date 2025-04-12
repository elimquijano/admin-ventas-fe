import { AddCircle, Close, FilterList, FilterListOff, RemoveCircle, Send, ShoppingCart } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Badge,
  Alert
} from '@mui/material';
import { API_HOST, notificationSwal } from 'common/common';
import React, { useState, useEffect } from 'react';

const MainProducts = ({ categorias = [], productos, totalDinnerCaja, onHandleSubmit, onChangeFilters }) => {
  const [preVenta, setPreVenta] = useState([]);
  const [subTotal, setSubTotal] = useState((0).toFixed(2));
  const [total, setTotal] = useState((0).toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [totalInCart, setTotalInCart] = useState(0);

  useEffect(() => {
    sumar(preVenta);
  }, [preVenta]);

  const addProductToPreVenta = (id) => {
    setPreVenta((prevPreVenta) => {
      const item = prevPreVenta.find((p) => p.id === id);
      if (item) {
        return prevPreVenta.map((producto) =>
          producto.id === id && producto.quantity < producto.amount
            ? { ...producto, quantity: producto.quantity + 1, total: (producto.quantity + 1) * producto.price }
            : producto
        );
      } else {
        const producto = productos.find((p) => p.id === id);
        return [...prevPreVenta, { ...producto, quantity: 1, total: producto.price }];
      }
    });
  };

  const removeQuantityToProduct = (id) => {
    setPreVenta((prevPreVenta) =>
      prevPreVenta.map((producto) =>
        producto.id === id && producto.quantity > 1
          ? { ...producto, quantity: producto.quantity - 1, total: (producto.quantity - 1) * producto.price }
          : producto
      )
    );
  };

  const addQuantityToProduct = (id) => {
    setPreVenta((prevPreVenta) =>
      prevPreVenta.map((producto) =>
        producto.id === id && producto.quantity < producto.amount
          ? { ...producto, quantity: producto.quantity + 1, total: (producto.quantity + 1) * producto.price }
          : producto
      )
    );
  };

  const removeProductFromPreVenta = (id) => {
    setPreVenta((prevPreVenta) => prevPreVenta.filter((p) => p.id !== id));
  };

  const sumar = (newPreVenta) => {
    const suma = newPreVenta.reduce((acc, element) => acc + element.total, 0);
    const sumaCart = newPreVenta.reduce((acc, element) => acc + element.quantity, 0);
    setSubTotal((suma / 1.18).toFixed(2));
    setTotal(suma.toFixed(2));
    setTotalInCart(sumaCart);
  };

  const handleSubmit = async () => {
    if (!ValidacionItem(preVenta)) {
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await onHandleSubmit(preVenta, total);
      if (response?.success) {
        setPreVenta([]);
        setSubTotal((0).toFixed(2));
        setTotal((0).toFixed(2));
        setOpenModal(false);
      } else {
        notificationSwal('error', response?.message);
      }
    } catch (error) {
      notificationSwal('error', 'Ocurrió un error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ValidacionItem = (itemSave) => {
    if (!itemSave || itemSave.length === 0) {
      notificationSwal('error', 'No se puede enviar campos vacios');
      return false;
    }
    return true;
  };

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start' }}>
            <Button variant="contained" color="secondary" onClick={() => onChangeFilters(0)}>
              <FilterListOff />
            </Button>
            {categorias.length > 0 &&
              categorias.map((categoria, index) => (
                <Button key={index} variant="contained" color="secondary" onClick={() => onChangeFilters(categoria?.id)}>
                  <FilterList />
                  {categoria.name}
                </Button>
              ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }} textAlign={{ xs: 'right' }}>
          <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-end' }}>
            <Button variant="contained" color="success">
              {`S/. ${Number(totalDinnerCaja.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </Button>
            <IconButton
              style={{
                backgroundColor: 'yellow',
                borderRadius: '50%',
                padding: '10px'
              }}
              color="secondary"
              onClick={() => setOpenModal(true)}
            >
              <Badge badgeContent={totalInCart} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
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
              disabled={producto.amount === 0}
            >
              <Stack direction="column" justifyContent="space-between" className="h-100 w-100">
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap>{producto?.ventas || 0}</Typography>
                  <Typography noWrap>{producto?.amount || 0}</Typography>
                </Stack>
                <Stack direction="column" alignItems="center">
                  <img src={API_HOST + producto?.image} alt="" style={{ objectFit: 'cover', height: '50px' }} />
                </Stack>
                <Stack direction="column" alignItems="center" sx={{ fontSize: '10px' }}>
                  {producto?.name}
                </Stack>
              </Stack>
            </Button>
          ))}
        </div>
      </div>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle className="text-center h4">Carrito de Compras</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 300 }} aria-label="a dense table">
              <TableBody>
                {preVenta.length > 0 ? (
                  preVenta.map((p, index) => (
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
                  ))
                ) : (
                  <Alert severity="info">No hay productos agregados aún</Alert>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={isSubmitting}
            fullWidth
            variant="contained"
            color="secondary"
            onClick={() => handleSubmit()}
            loadingPosition="start"
            startIcon={<Send />}
          >
            {isSubmitting ? 'Vendiendo...' : 'Vender'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MainProducts;
