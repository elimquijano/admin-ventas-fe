

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const tickets = {
  id: 'tickets',
  title: 'Tickets',
  caption: 'Paginas de Tickets',
  type: 'group',
  children: [
    {
      id: 'venta',
      title: 'Entradas',
      type: 'item',
      url: '/entradas',
      target: false
    },
  ]
};

export default tickets;
