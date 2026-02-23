import { Link } from 'react-router-dom';

import type { ProcessedVideo } from 'common/interfaces';
import styles from 'features/videos/components/videos-table.module.css';

type VideosTableProps = {
  videos: ProcessedVideo[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDelete: (id: number) => void;
};

export type SortField = 'name' | 'author' | 'categories' | 'highestQualityFormat' | 'releaseDate';
export type SortDirection = 'asc' | 'desc';

const renderSortIndicator = (field: SortField, activeField: SortField, direction: SortDirection) => {
  if (field !== activeField) return <span className={styles['sort-caret']}>⇅</span>;
  return direction === 'asc' ? <span className={styles['sort-caret']}>▲</span> : <span className={styles['sort-caret']}>▼</span>;
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const VideosTable = ({ videos, sortField, sortDirection, onSort, onDelete }: VideosTableProps) => (
  <div className={styles.wrapper}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th role="button" onClick={() => onSort('name')}>
            <span className={styles['th-content']}>Video Name {renderSortIndicator('name', sortField, sortDirection)}</span>
          </th>
          <th role="button" onClick={() => onSort('author')}>
            <span className={styles['th-content']}>Author {renderSortIndicator('author', sortField, sortDirection)}</span>
          </th>
          <th role="button" onClick={() => onSort('categories')}>
            <span className={styles['th-content']}>Categories {renderSortIndicator('categories', sortField, sortDirection)}</span>
          </th>
          <th role="button" onClick={() => onSort('highestQualityFormat')}>
            <span className={styles['th-content']}>
              Highest quality format {renderSortIndicator('highestQualityFormat', sortField, sortDirection)}
            </span>
          </th>
          <th role="button" onClick={() => onSort('releaseDate')}>
            <span className={styles['th-content']}>Release Date {renderSortIndicator('releaseDate', sortField, sortDirection)}</span>
          </th>
          <th className={styles['actions-header']}>Options</th>
        </tr>
      </thead>

      <tbody>
        {videos.map((video) => (
          // because id can be duplicate across author so we need to use the author name also to avoid duplicate render
          <tr key={`${video.id}-${video.author}`}>
            <td className={styles['cell-primary']}>{video.name}</td>
            <td>{video.author}</td>
            <td>
              <div className={styles.pills}>
                {video.categories.map((cat) => (
                  <span key={cat} className={styles.pill}>
                    {cat}
                  </span>
                ))}
              </div>
            </td>
            <td>{video.highestQualityFormat}</td>
            <td>{formatDate(video.releaseDate)}</td>
            <td className={styles['actions-cell']}>
              <Link to={`/videos/${video.id}/edit`} className={styles['link-button']}>
                Edit
              </Link>
              <button
                className={styles['danger-button']}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this video?')) {
                    onDelete(video.id);
                  }
                }}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
