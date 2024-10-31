import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import HomePage from '@pages/HomePage';
import ExplorePage from '@pages/ExplorePage';
import { State, SWRConfig } from 'swr';
import { fetcher } from '@utils/axios';
import ErrorPage from '@pages/ErrorPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/explore',
    element: <ExplorePage />,
    errorElement: <ErrorPage />,
  },
]);
const persistentProvider = () => {
  const cachedData = JSON.parse(sessionStorage.getItem('trackVStrack-swr-cache') || '[]');
  const map = new Map<string, State>(cachedData);
  // 페이지가 닫히거나 새로고침될 때, sessionStorage에 현재 캐시 저장
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('trackVStrack-swr-cache', JSON.stringify(Array.from(map.entries())));
  });

  return map;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <SWRConfig
    value={{
      fetcher: ([url, parm]) => fetcher(url, parm),
      provider: persistentProvider,
      revalidateOnFocus: false, //  창이 포커싱되었을 때 자동 갱신 x
      revalidateIfStale: false, // 오래된 데이터가 있더라도 자동으로 다시 확인 x
    }}
  >
    <RouterProvider router={router} />
  </SWRConfig>,
);
