import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from 'layouts/app-layout';
import { navRoutes } from 'features/videos/routes';
import { AddVideoPage } from 'features/videos/pages/add/add-video-page';
import { EditVideoPage } from 'features/videos/pages/add/edit-video-page';

export const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      {navRoutes.map(({ path, Component, index }) =>
        index ? <Route key="index" index element={<Component />} /> : <Route key={path} path={path} element={<Component />} />
      )}
      <Route path="videos/add" element={<AddVideoPage />} />
      <Route path="videos/:id/edit" element={<EditVideoPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
