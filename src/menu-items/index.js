import seguridad from './seguridad';
import cuenta from './cuenta';
import inventario from './inventario';
import { getSession } from 'common/common';
import barras from './barras';
import tickets from './tickets';
import habitaciones from './habitaciones';
import facturacion from './facturacion';

const menuItems = {
  items: []
};
const privilegios = JSON.parse(getSession('PRIVILEGIOS'));
if (privilegios) {
  const tieneSeguridad = privilegios.some((item) => item.code === 'PRIV_MOD_SEGURIDAD');
  const tieneInventario = privilegios.some((item) => item.code === 'PRIV_MOD_INVENTARIO');
  const tieneFacturacion = privilegios.some((item) => item.code === 'PRIV_MOD_FACTURACION');
  const tieneCuenta = privilegios.some((item) => item.code === 'PRIV_MOD_CUENTA');
  const tieneBarras = privilegios.some((item) => item.code === 'PRIV_MOD_BARRAS');
  const tieneTickets = privilegios.some((item) => item.code === 'PRIV_MOD_TICKETS');
  const tieneHabitacion = privilegios.some((item) => item.code === 'PRIV_MOD_HABITACIONES');

  if (tieneInventario) {
    menuItems.items.push(inventario);
  }
  if (tieneSeguridad) {
    menuItems.items.push(seguridad);
  }
  if (tieneCuenta) {
    menuItems.items.push(cuenta);
  }
  if (tieneBarras) {
    menuItems.items.push(barras);
  }
  if (tieneTickets) {
    menuItems.items.push(tickets);
  }
  if (tieneHabitacion) {
    menuItems.items.push(habitaciones);
  }
  if (tieneFacturacion) {
    menuItems.items.push(facturacion);
  }
}

export default menuItems;
