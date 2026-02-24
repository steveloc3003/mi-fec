import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from 'layouts/app-layout';
import { navRoutes } from 'app/routes';

export const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Navigate to="/videos" replace />} />
      {navRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
