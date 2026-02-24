import { Link } from 'react-router-dom';

import styles from 'pages/not-found/not-found-page.module.css';

export const NotFoundPage = () => (
  <div className={styles.wrapper}>
    <div>
      <h1>404 - Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/videos">Go to Videos</Link>
    </div>
  </div>
);
