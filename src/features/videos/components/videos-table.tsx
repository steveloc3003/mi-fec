import { Link } from 'react-router-dom';

import type { ProcessedVideo } from 'common/interfaces';
import styles from 'features/videos/components/videos-table.module.css';
import { SimpleTable } from 'shared/components/index';
import { formatDate } from 'shared/utils/date';

type VideosTableProps = {
  videos: ProcessedVideo[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDelete: (id: number, authorId: number) => void;
};

export type SortField = 'name' | 'author' | 'categories' | 'highestQualityFormat' | 'releaseDate';
export type SortDirection = 'asc' | 'desc';

export const VideosTable = ({ videos, sortField, sortDirection, onSort, onDelete }: VideosTableProps) => {
  const columns = [
    {
      key: 'name',
      header: 'Video Name',
      sortable: true,
      render: (row: ProcessedVideo) => <span className={styles['cell-primary']}>{row.name}</span>,
    },
    {
      key: 'author',
      header: 'Author',
      sortable: true,
      accessor: (row: ProcessedVideo) => row.author,
    },
    {
      key: 'categories',
      header: 'Categories',
      sortable: false,
      render: (row: ProcessedVideo) => (
        <div className={styles.pills}>
          {row.categories.map((cat) => (
            <span key={cat} className={styles.pill}>
              {cat}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'highestQualityFormat',
      header: 'Highest quality format',
      sortable: true,
      accessor: (row: ProcessedVideo) => row.highestQualityFormat,
    },
    {
      key: 'releaseDate',
      header: 'Release Date',
      sortable: true,
      accessor: (row: ProcessedVideo) => formatDate(row.releaseDate),
    },
    {
      key: 'actions',
      header: 'Options',
      sortable: false,
      render: (row: ProcessedVideo) => (
        <div className={styles['actions-cell']}>
          <Link to={`/videos/${row.authorId}/${row.id}/edit`} className={styles['link-button']}>
            Edit
          </Link>
          <button
            className={styles['danger-button']}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this video?')) {
                onDelete(row.id, row.authorId);
              }
            }}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <SimpleTable
        data={videos}
        columns={columns}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={(field) => onSort(field as SortField)}
        rowKey={(row) => `${row.authorId}-${row.id}`}
      />
    </div>
  );
};
