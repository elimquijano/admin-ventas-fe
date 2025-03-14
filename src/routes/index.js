import { useRoutes } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
//import UserRoutes from './UserRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([MainRoutes, AuthenticationRoutes]);
}
