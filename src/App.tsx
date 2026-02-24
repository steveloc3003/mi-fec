import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from 'layouts/app-layout';
import { navRoutes } from 'app/routes';
import { NotFoundPage } from 'pages/not-found/not-found-page';

export const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/videos" replace />} />
      {navRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
