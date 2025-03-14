// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const seguridad = {
  id: 'seguridad',
  title: 'Seguridad',
  caption: 'Paginas de seguridad',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Seguridad',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'modulo',
          title: 'Modulos',
          type: 'item',
          url: '/modulo',
          target: false
        },
        {
          id: 'privilegio',
          title: 'Privilegios',
          type: 'item',
          url: '/privilegio',
          target: false
        },
        {
          id: 'rol',
          title: 'Roles',
          type: 'item',
          url: '/rol',
          target: false
        },
        {
          id: 'negocio',
          title: 'Negocios',
          type: 'item',
          url: '/negocios',
          target: false
        },
        {
          id: 'documento',
          title: 'Documentos',
          type: 'item',
          url: '/documento',
          target: false
        },
        {
          id: 'impresora',
          title: 'Impresoras',
          type: 'item',
          url: '/impresora',
          target: false
        },
        {
          id: 'usuario',
          title: 'Usuarios',
          type: 'item',
          url: '/usuario',
          target: false
        }
      ]
    }
  ]
};

export default seguridad;
