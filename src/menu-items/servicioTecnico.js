// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const servicioTecnico = {
  id: 'servicioTecnico',
  title: 'Servicio Tecnico',
  caption: 'Paginas de Servicio Tecnico',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Servicio',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'modeloequipo',
          title: 'Modelos de equipos',
          type: 'item',
          url: '/modeloequipo',
          target: false
        },
        {
          id: 'serviciontecnico',
          title: 'Servicio técnico',
          type: 'item',
          url: '/serviciotecnico',
          target: false
        }
      ]
    }
  ]
};

export default servicioTecnico;
