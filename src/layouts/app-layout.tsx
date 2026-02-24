import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

import styles from 'app.module.css';
import { navRoutes } from 'app/routes';
import appLayoutStyles from './app-layout.module.css';
import { Button } from 'shared/components/button/button';

export const AppLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showAddButton = !pathname.startsWith('/videos/');
  return (
    <>
      <header className={styles.header}>
        <div className={appLayoutStyles.bar}>
          <span className={appLayoutStyles.brand}>Videos</span>
          <nav className={appLayoutStyles.nav}>
            {navRoutes
              .filter((route) => route.showInNav !== false)
              .map(({ navPath, label, navEnd }) => (
                <NavLink
                  key={navPath}
                  end={navEnd ?? false}
                  className={({ isActive }) => (isActive ? appLayoutStyles['link-active'] : appLayoutStyles.link)}
                  to={navPath}>
                  {label}
                </NavLink>
              ))}
          </nav>
        </div>
        {showAddButton && (
          <div className={appLayoutStyles.bar}>
            <Button primary onClick={() => navigate('/videos/add')}>
              Add video
            </Button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>VManager Demo v0.0.1</footer>
    </>
  );
};
