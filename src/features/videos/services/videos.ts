import { ProcessedVideo, Author, Video } from 'common/interfaces';
import { fetchAuthors, fetchAuthorById, fetchCategories, saveAuthor } from './api';
import { toProcessedVideos } from './helpers';

export const getVideos = async (): Promise<ProcessedVideo[]> => {
  const [categories, authors] = await Promise.all([fetchCategories(), fetchAuthors()]);
  return toProcessedVideos(authors, categories);
};

export const addVideoToAuthor = async (authorId: number, video: Video): Promise<Author> => {
  const author = await fetchAuthorById(authorId);

  const updatedAuthor: Author = {
    ...author,
    videos: [...author.videos, video],
  };

  await saveAuthor(updatedAuthor);
  return updatedAuthor;
};

export const getVideoWithAuthor = async (authorId: number, videoId: number): Promise<{ video: Video; author: Author } | null> => {
  const author = await fetchAuthorById(authorId);
  const found = author.videos.find((v) => v.id === videoId);
  if (!found) return null;
  return { video: found, author };
};

export const getMaxVideoIdForAuthor = async (_authorId: number): Promise<number> => {
  // Keep IDs globally unique to avoid edit/delete ambiguity across authors.
  const authors = await fetchAuthors();
  return authors.flatMap((author) => author.videos).reduce((max, video) => (video.id > max ? video.id : max), 0);
};

export const updateVideo = async (videoId: number, updatedVideo: Video, newAuthorId: number, currentAuthorId: number): Promise<void> => {
  // Scope lookup to the current author from route params to avoid matching same id under another author.
  const currentAuthor = await fetchAuthorById(currentAuthorId);
  if (!currentAuthor.videos.some((v) => v.id === videoId)) throw new Error('Video not found');

  const isSameAuthor = currentAuthor.id === newAuthorId;

  if (isSameAuthor) {
    const nextVideos = currentAuthor.videos.map((v) => (v.id === videoId ? updatedVideo : v));
    await saveAuthor({ ...currentAuthor, videos: nextVideos });
    return;
  }

  // Cross-author move: remove from current author, then append to destination author.
  const updatedOld = {
    ...currentAuthor,
    videos: currentAuthor.videos.filter((v) => v.id !== videoId),
  };
  await saveAuthor(updatedOld);

  const newAuthor = await fetchAuthorById(newAuthorId);

  await saveAuthor({ ...newAuthor, videos: [...newAuthor.videos, updatedVideo] });
};

export const deleteVideo = async (videoId: number, authorId: number): Promise<void> => {
  const author = await fetchAuthorById(authorId);
  if (!author.videos.some((v) => v.id === videoId)) throw new Error('Video not found');

  const updatedAuthor: Author = {
    ...author,
    videos: author.videos.filter((v) => v.id !== videoId),
  };

  await saveAuthor(updatedAuthor);
};
