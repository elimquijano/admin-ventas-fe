// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const habitaciones = {
  id: 'habitaciones',
  title: 'Habitaciones',
  caption: 'Paginas de Habitaciones',
  type: 'group',
  children: [
    /* {
      id: 'habitacion-offline',
      title: 'Habitaciones',
      type: 'item',
      url: '/habitacion',
      target: false
    }, */
    {
      id: 'habitacion-onnline',
      title: 'Habitaciones',
      type: 'item',
      url: '/habitaciones',
      target: false
    }
  ]
};

export default habitaciones;
