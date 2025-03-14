import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
//Seguridad page
const RolPage = Loadable(lazy(() => import('views/seguridad/rol')));
const NegocioPage = Loadable(lazy(() => import('views/seguridad/negocio')));
const DocumentoPage = Loadable(lazy(() => import('views/seguridad/documento')));
const ImpresoraPage = Loadable(lazy(() => import('views/seguridad/impresora')));
const PrivilegiosPage = Loadable(lazy(() => import('views/seguridad/privilegios')));
const ModuloPage = Loadable(lazy(() => import('views/seguridad/modulo')));
const UsuarioPage = Loadable(lazy(() => import('views/seguridad/usuario')));
const TransaccionPage = Loadable(lazy(() => import('views/reportes/transacciones')));
const PrivilegiosRolPage = Loadable(lazy(() => import('views/seguridad/privilegiorol')));
const UserRolPage = Loadable(lazy(() => import('views/seguridad/userrol')));
const UserDocumentoPage = Loadable(lazy(() => import('views/seguridad/userdocumento')));
const UserProductoPage = Loadable(lazy(() => import('views/seguridad/userproducto')));
const UserTipoTicketPage = Loadable(lazy(() => import('views/seguridad/usertipoticket')));
const UserImpresoraPage = Loadable(lazy(() => import('views/seguridad/userimpresora')));

const NegocioTipoTicketPage = Loadable(lazy(() => import('views/seguridad/negociotipoticket')));
const NegocioCategoriaPage = Loadable(lazy(() => import('views/seguridad/negociocategoria')));
const NegocioProductoPage = Loadable(lazy(() => import('views/seguridad/negocioproducto')));

const ProductoPage = Loadable(lazy(() => import('views/inventario/producto')));
const CategoriaPage = Loadable(lazy(() => import('views/inventario/categoria')));
const TipoTicketPage = Loadable(lazy(() => import('views/inventario/ticket')));
const ProveedorPage = Loadable(lazy(() => import('views/compras/proveedor')));
const CompraPage = Loadable(lazy(() => import('views/compras/compra')));
const DetCompraPage = Loadable(lazy(() => import('views/compras/detcompra')));
//const VentaPage = Loadable(lazy(() => import('views/ventas/venta')));
//const DetVentaPage = Loadable(lazy(() => import('views/ventas/detventa')));
const VentasTicketsPage = Loadable(lazy(() => import('views/inventario/ventasTickets')));
const VentasProductsPage = Loadable(lazy(() => import('views/inventario/ventasProducts')));
const DetVentasProductsPage = Loadable(lazy(() => import('views/inventario/detVentasProducts')));
const ClientePage = Loadable(lazy(() => import('views/inventario/cliente')));
const PerfilPage = Loadable(lazy(() => import('views/cuenta/perfil')));

const DetRepuestoPage = Loadable(lazy(() => import('views/servicioTecnico/detrepuesto')));
const ModeloEquipoPage = Loadable(lazy(() => import('views/servicioTecnico/modeloequipo')));
const ServicioTecnicoPage = Loadable(lazy(() => import('views/servicioTecnico/serviciotecnico')));
const DetServicioTecnicoPage = Loadable(lazy(() => import('views/servicioTecnico/detserviciotecnico')));
const InformePage = Loadable(lazy(() => import('views/servicioTecnico/informe')));

const ReporteInventarioPage = Loadable(lazy(() => import('views/reportes/existencia')));

const Entradas = Loadable(lazy(() => import('views/venta/entrada')));
const Habitaciones = Loadable(lazy(() => import('views/ticket/habitacion')));
const Productos = Loadable(lazy(() => import('views/venta/barra')));
const HabitacionPage = Loadable(lazy(() => import('views/venta/habitacion')))

const EnvioEntradasPage = Loadable(lazy(() => import('views/facturacion/envioEntradas')));
const EnvioBarrasPage = Loadable(lazy(() => import('views/facturacion/envioBarras')));
const EnvioHabitacionesPage = Loadable(lazy(() => import('views/facturacion/envioHabitaciones')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'entradas',
      element: <Entradas />
    },
    {
      path: 'habitacion',
      element: <HabitacionPage />
    },
    {
      path: 'habitaciones',
      element: <Habitaciones />
    },
    {
      path: 'venta',
      element: <Productos />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: <UtilsColor />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'rol',
      element: <RolPage />
    },
    {
      path: 'producto',
      element: <ProductoPage />
    },
    {
      path: 'categoria',
      element: <CategoriaPage />
    },
    {
      path: 'tipoticket',
      element: <TipoTicketPage />
    },
    {
      path: 'proveedor',
      element: <ProveedorPage />
    },
    {
      path: 'negocios',
      element: <NegocioPage />
    },
    {
      path: 'negocio-tipo-ticket/:id',
      element: <NegocioTipoTicketPage />
    },
    {
      path: 'negocio-categorias/:id',
      element: <NegocioCategoriaPage />
    },
    {
      path: 'negocio-productos/:id',
      element: <NegocioProductoPage />
    },
    {
      path: 'compra',
      element: <CompraPage />
    },
    {
      path: 'detcompra/:id',
      element: <DetCompraPage />
    },
    /* {
      path: 'ventas',
      element: <VentaPage />
    },
    {
      path: 'detventa/:id',
      element: <DetVentaPage />
    }, */
    {
      path: 'venta-entradas',
      element: <VentasTicketsPage />
    },
    {
      path: 'venta-productos',
      element: <VentasProductsPage />
    },
    {
      path: 'detventaproductos/:id',
      element: <DetVentasProductsPage />
    },
    {
      path: 'privilegio',
      element: <PrivilegiosPage />
    },
    {
      path: 'modulo',
      element: <ModuloPage />
    },
    {
      path: 'usuario',
      element: <UsuarioPage />
    },
    {
      path: 'cliente',
      element: <ClientePage />
    },
    {
      path: 'rol/:id',
      element: <PrivilegiosRolPage />
    },
    {
      path: 'usuario/rol/:id',
      element: <UserRolPage />
    },
    {
      path: 'usuario/documento/:id',
      element: <UserDocumentoPage />
    },
    {
      path: 'usuario/producto/:id',
      element: <UserProductoPage />
    },
    {
      path: 'usuario/tipo-ticket/:id',
      element: <UserTipoTicketPage />
    },
    {
      path: 'usuario/impresora/:id',
      element: <UserImpresoraPage />
    },
    {
      path: 'documento',
      element: <DocumentoPage />
    },
    {
      path: 'impresora',
      element: <ImpresoraPage />
    },
    {
      path: 'perfil',
      element: <PerfilPage />
    },
    {
      path: 'detrepuesto/:id/:detid',
      element: <DetRepuestoPage />
    },
    {
      path: 'modeloequipo',
      element: <ModeloEquipoPage />
    },
    {
      path: 'serviciotecnico',
      element: <ServicioTecnicoPage />
    },
    {
      path: 'detserviciotecnico/:id',
      element: <DetServicioTecnicoPage />
    },
    {
      path: 'reporte/inventario',
      element: <ReporteInventarioPage />
    },
    {
      path: 'transacciones',
      element: <TransaccionPage />
    },
    {
      path: 'informe/:id/:detid',
      element: <InformePage />
    },
    {
      path: 'envio-entradas',
      element: <EnvioEntradasPage />
    },
    {
      path: 'envio-barras',
      element: <EnvioBarrasPage />
    },
    {
      path: 'envio-habitaciones',
      element: <EnvioHabitacionesPage />
    },
  ]
};

export default MainRoutes;
