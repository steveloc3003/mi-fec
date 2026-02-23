import { getCategories } from 'features/videos/services/categories';
import { getAuthors } from 'features/videos/services/authors';
import { ProcessedVideo, Author, Video } from 'common/interfaces';

export const getVideos = async (): Promise<ProcessedVideo[]> => {
  const [categories, authors] = await Promise.all([getCategories(), getAuthors()]);

  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));

  const pickHighestQualityLabel = (formats: Record<string, { res: string; size: number | string }>): string => {
    let bestName = '';
    let bestSize = -Infinity;
    let bestRes = -Infinity;

    for (const name in formats) {
      const format = formats[name];
      if (!format) continue;

      const size = typeof format.size === 'number' ? format.size : Number(format.size);
      const resValue = typeof format.res === 'string' ? parseInt(format.res, 10) : Number(format.res);

      if (size > bestSize || (size === bestSize && resValue > bestRes)) {
        bestSize = size;
        bestRes = resValue;
        bestName = name;
      }
    }

    return bestName ? `${bestName} ${bestRes}p` : '';
  };

  return authors.flatMap((author) =>
    author.videos.map((video) => ({
      id: video.id,
      name: video.name,
      author: author.name,
      releaseDate: video.releaseDate,
      highestQualityFormat: pickHighestQualityLabel(video.formats),
      categories: video.catIds.map((catId) => categoriesById.get(catId)).filter((catName): catName is string => Boolean(catName)),
    }))
  );
};

export const addVideoToAuthor = async (authorId: number, video: Video): Promise<Author> => {
  const authorResponse = await fetch(`${process.env.REACT_APP_API}/authors/${authorId}`);
  if (!authorResponse.ok) throw new Error('Failed to fetch author');
  const author = (await authorResponse.json()) as Author;

  const updatedAuthor: Author = {
    ...author,
    videos: [...author.videos, video],
  };

  const saveResponse = await fetch(`${process.env.REACT_APP_API}/authors/${authorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAuthor),
  });
  if (!saveResponse.ok) throw new Error('Failed to update author videos');

  return updatedAuthor;
};

export const getVideoWithAuthor = async (videoId: number): Promise<{ video: Video; author: Author } | null> => {
  const authors = await getAuthors();
  for (const author of authors) {
    const found = author.videos.find((v) => v.id === videoId);
    if (found) return { video: found, author };
  }
  return null;
};

export const getMaxVideoIdForAuthor = async (authorId: number): Promise<number> => {
  const author = await fetch(`${process.env.REACT_APP_API}/authors/${authorId}`).then((r) => r.json() as Promise<Author>);
  return author.videos.reduce((max, v) => (v.id > max ? v.id : max), 0);
};

export const updateVideo = async (videoId: number, updatedVideo: Video, newAuthorId: number): Promise<void> => {
  const authors = await getAuthors();
  const currentAuthor = authors.find((a) => a.videos.some((v) => v.id === videoId));
  if (!currentAuthor) throw new Error('Video not found');

  const isSameAuthor = currentAuthor.id === newAuthorId;

  if (isSameAuthor) {
    const nextVideos = currentAuthor.videos.map((v) => (v.id === videoId ? updatedVideo : v));
    const saveResponse = await fetch(`${process.env.REACT_APP_API}/authors/${currentAuthor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentAuthor, videos: nextVideos }),
    });
    if (!saveResponse.ok) throw new Error('Failed to update video');
    return;
  }

  // Move to new author
  const updatedOld = {
    ...currentAuthor,
    videos: currentAuthor.videos.filter((v) => v.id !== videoId),
  };
  const oldSave = await fetch(`${process.env.REACT_APP_API}/authors/${currentAuthor.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedOld),
  });
  if (!oldSave.ok) throw new Error('Failed to remove video from old author');

  const newAuthor = authors.find((a) => a.id === newAuthorId);
  if (!newAuthor) throw new Error('New author not found');

  const newSave = await fetch(`${process.env.REACT_APP_API}/authors/${newAuthorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newAuthor, videos: [...newAuthor.videos, updatedVideo] }),
  });
  if (!newSave.ok) throw new Error('Failed to add video to new author');
};

export const deleteVideo = async (videoId: number): Promise<void> => {
  const authors = await getAuthors();
  const author = authors.find((a) => a.videos.some((v) => v.id === videoId));
  if (!author) throw new Error('Video not found');

  const updatedAuthor: Author = {
    ...author,
    videos: author.videos.filter((v) => v.id !== videoId),
  };

  const saveResponse = await fetch(`${process.env.REACT_APP_API}/authors/${author.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedAuthor),
  });

  if (!saveResponse.ok) throw new Error('Failed to delete video');
};
