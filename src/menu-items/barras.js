

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const barras = {
  id: 'barras',
  title: 'POS',
  caption: 'Venta de Productos',
  type: 'group',
  children: [
    {
      id: 'venta',
      title: 'Punto de Venta',
      type: 'item',
      url: '/venta',
      target: false
    },
  ]
};

export default barras;
