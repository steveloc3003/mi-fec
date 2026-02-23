import type { FC } from 'react';

import { VideoListPage } from 'features/videos/pages/list/video-list-page';
import { AboutPage } from 'pages/about/about-page';
import { FaqPage } from 'pages/fag/faq-page';

export type NavRoute = {
  path: string;
  navPath: string;
  label: string;
  index?: boolean;
  navEnd?: boolean;
  Component: FC;
};

export const navRoutes: NavRoute[] = [
  { path: '', navPath: '/', label: 'Home', Component: VideoListPage, index: true, navEnd: false },
  { path: 'about', navPath: '/about', label: 'About Us', Component: AboutPage },
  { path: 'faq', navPath: '/faq', label: 'FAQ', Component: FaqPage },
];
