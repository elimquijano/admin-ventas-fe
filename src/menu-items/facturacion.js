// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

const facturacion = {
  id: 'facturacion',
  title: 'Facturacion',
  caption: 'Paginas de Facturacion',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Envio a Sunat',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'envio-entradas',
          title: 'Entradas',
          type: 'item',
          url: '/envio-entradas',
          target: false
        },
        {
          id: 'envio-barras',
          title: 'Barras',
          type: 'item',
          url: '/envio-barras',
          target: false
        },
        {
          id: 'envio-habitaciones',
          title: 'Habitaciones',
          type: 'item',
          url: '/envio-habitaciones',
          target: false
        },
      ]
    }
  ]
};

export default facturacion;
