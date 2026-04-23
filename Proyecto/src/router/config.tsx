
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/home/page';
import RankingPage from '../pages/ranking/page';
import InventoryPage from '../pages/inventory/page';
import NotFound from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/ranking',
    element: <RankingPage />,
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
