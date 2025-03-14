// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const inventario = {
  id: 'inventario',
  title: 'Inventario',
  caption: 'Paginas de Inventario',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Productos',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'categoria',
          title: 'Categorias',
          type: 'item',
          url: '/categoria',
          target: false
        },
        {
          id: 'producto',
          title: 'Productos',
          type: 'item',
          url: '/producto',
          target: false
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Servicios',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'producto',
          title: 'Tickets',
          type: 'item',
          url: '/tipoticket',
          target: false
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Compras',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'proovedor',
          title: 'Proveedores',
          type: 'item',
          url: '/proveedor',
          target: false
        },
        {
          id: 'compra',
          title: 'Ordenes de compra',
          type: 'item',
          url: '/compra',
          target: false
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Ventas',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'venta-entradas',
          title: 'Entradas',
          type: 'item',
          url: '/venta-entradas',
          target: false
        },
        {
          id: 'venta-productos',
          title: 'Productos',
          type: 'item',
          url: '/venta-productos',
          target: false
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Inventario',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'reporte_existencia',
          title: 'Stock de productos',
          type: 'item',
          url: '/reporte/inventario',
          target: false
        },
        {
          id: 'transaccion',
          title: 'Transacciones',
          type: 'item',
          url: '/transacciones',
          target: false
        }
      ]
    }
  ]
};

export default inventario;
