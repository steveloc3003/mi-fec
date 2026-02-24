import styles from 'app.module.css';

export const AboutPage = () => (
  <div className={styles['top-bar']}>
    <div>
      <h1>About VManager</h1>
      <p>
        VManager is a lightweight demo for managing videos, authors, and categories. It showcases fetching data from a JSON API,
        transforming it into a tidy view model, and navigating between list, add, and edit screens.
      </p>
    </div>
  </div>
);
