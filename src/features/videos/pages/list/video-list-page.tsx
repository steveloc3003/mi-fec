import { useEffect, useMemo, useState } from 'react';

import type { ProcessedVideo } from 'common/interfaces';
import { getVideos, deleteVideo } from 'features/videos/services/videos';
import { VideosTable, SortDirection, SortField } from 'features/videos/components/videos-table';
import { Button } from 'components/button';
import styles from 'features/videos/styles/video-list.module.css';

export const VideoListPage = () => {
  const [videos, setVideos] = useState<ProcessedVideo[]>([]);
  const [search, setSearch] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filtered = useMemo(() => {
    const term = committedSearch.trim().toLowerCase();
    if (!term) return videos;
    return videos.filter(
      (video) =>
        video.name.toLowerCase().includes(term) ||
        video.author.toLowerCase().includes(term) ||
        video.categories.some((cat) => cat.toLowerCase().includes(term))
    );
  }, [videos, committedSearch]);

  const refreshVideos = () => getVideos().then(setVideos);

  useEffect(() => {
    refreshVideos();
  }, []);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const compare = (a: ProcessedVideo, b: ProcessedVideo) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      const getValue = (video: ProcessedVideo) => {
        switch (sortField) {
          case 'name':
            return video.name;
          case 'author':
            return video.author;
          case 'categories':
            return video.categories.join(', ');
          case 'highestQualityFormat':
            return video.highestQualityFormat;
          case 'releaseDate':
            return video.releaseDate ?? '';
          default:
            return '';
        }
      };
      const valA = getValue(a)?.toString().toLowerCase();
      const valB = getValue(b)?.toString().toLowerCase();
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    };
    return list.sort(compare);
  }, [filtered, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        return currentField;
      }
      setSortDirection('asc');
      return field;
    });
  };

  const handleDelete = async (id: number) => {
    await deleteVideo(id);
    refreshVideos();
  };

  return (
    <>
      <h1>VManager Demo v0.0.1</h1>
      <form
        className={styles['search-container']}
        onSubmit={(event) => {
          event.preventDefault();
          setCommittedSearch(search);
        }}>
        <input
          type="search"
          className={styles['search-input']}
          placeholder="Search by name, author, category..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button className={styles['search-button']} type="submit">
          Search
        </Button>
      </form>
      <VideosTable videos={sorted} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} onDelete={handleDelete} />
    </>
  );
};
