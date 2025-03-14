// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const cuenta = {
  id: 'cuenta',
  title: 'cuenta',
  caption: 'Paginas de cuenta',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'cuenta',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'perfil',
          title: 'Mi perfil',
          type: 'item',
          url: '/perfil',
          target: false
        },
      ]
    }
  ]
};

export default cuenta;
