import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import MainPage from '@pages/MainPage';
import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import TestMainPage from '@pages/TestMainPage';
import Test2MainPage from '@pages/Test2MainPage';
import ExplorePage from '@pages/ExplorePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/test',
    element: <TestMainPage />,
  },
  {
    path: '/testMain',
    element: <Test2MainPage />,
  },

  {
    path: '/explore',
    element: <ExplorePage />,
  },

]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RouterProvider router={router} />,
);
