import type { FC } from 'react';

import { VideoListPage } from 'features/videos/pages/list/video-list-page';
import { AddVideoPage } from 'features/videos/pages/add/add-video-page';
import { EditVideoPage } from 'features/videos/pages/edit/edit-video-page';
import { AboutPage } from 'pages/about/about-page';
import { FaqPage } from 'pages/faq/faq-page';

export type RouteConfig = {
  path: string;
  navPath: string;
  label: string;
  index?: boolean;
  navEnd?: boolean;
  showInNav?: boolean;
  Component: FC;
};

export const navRoutes: RouteConfig[] = [
  { path: 'videos', navPath: '/videos', label: 'Videos', Component: VideoListPage, navEnd: true, showInNav: true },
  { path: 'videos/add', navPath: '/videos/add', label: 'Add', Component: AddVideoPage, showInNav: false },
  { path: 'videos/:authorId/:id/edit', navPath: '/videos/:authorId/:id/edit', label: 'Edit', Component: EditVideoPage, navEnd: true, showInNav: false },
  { path: 'about', navPath: '/about', label: 'About Us', Component: AboutPage, showInNav: true },
  { path: 'faq', navPath: '/faq', label: 'FAQ', Component: FaqPage, showInNav: true },
];
