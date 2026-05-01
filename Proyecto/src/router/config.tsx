import HomePage from '../pages/home/page';
import InventoryPage from '../pages/inventory/page';
import RankingPage from '../pages/ranking/page';
import AyudaPage from '../pages/ayuda/page';
import ContactoPage from '../pages/contacto/page';
import TerminosPage from '../pages/terminos/page';
import NotFound from '../pages/NotFound';

const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/crear',
    element: <HomePage />,
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  {
    path: '/ranking',
    element: <RankingPage />,
  },
  {
    path: '/ayuda',
    element: <AyudaPage />,
  },
  {
    path: '/contacto',
    element: <ContactoPage />,
  },
  {
    path: '/terminos',
    element: <TerminosPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;