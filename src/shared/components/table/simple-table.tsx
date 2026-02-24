import { ReactNode } from 'react';

import styles from './simple-table.module.css';

type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
};

type SimpleTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  rowKey: (row: T) => string;
};

const SortCaret = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
  if (!active) return <span className={styles.caret}>⇅</span>;
  return <span className={styles.caret}>{direction === 'asc' ? '▲' : '▼'}</span>;
};

export const SimpleTable = <T,>({
  data,
  columns,
  sortField,
  sortDirection = 'asc',
  onSort,
  rowKey,
}: SimpleTableProps<T>) => (
  <table className={styles.table}>
    <thead>
      <tr>
        {columns.map((col) => {
          const sortable = Boolean(onSort) && col.sortable;
          const active = sortable && sortField === col.key;
          const content = (
            <>
              {col.header}
              {sortable && <SortCaret active={Boolean(active)} direction={sortDirection} />}
            </>
          );
          return (
            <th key={col.key} className={`${styles.th} ${sortable ? styles.sortable : ''}`}>
              {sortable && onSort ? (
                <button className={styles.thButton} type="button" onClick={() => onSort(col.key)}>
                  {content}
                </button>
              ) : (
                content
              )}
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={rowKey(row)}>
          {columns.map((col) => (
            <td key={col.key}>
              {col.render
                ? col.render(row)
                : col.accessor
                ? col.accessor(row)
                : (row as Record<string, unknown>)[col.key] as ReactNode}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
