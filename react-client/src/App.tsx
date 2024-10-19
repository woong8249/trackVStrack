import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import MainPage from '@pages/MainPage';
import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Dashboard from '@pages/Dashboard';

import TestMainPage from '@pages/TestMainPage';

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
    path: '/dashboard',
    element: <Dashboard />,
  },

]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
