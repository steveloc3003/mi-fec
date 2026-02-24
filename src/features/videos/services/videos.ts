import { ProcessedVideo, Author, Video } from 'common/interfaces';
import { fetchAuthors, fetchAuthorById, fetchCategories, saveAuthor } from './api';
import {
  buildAuthorPatchForCreate,
  buildAuthorPatchForDelete,
  buildAuthorPatchForUpdate,
  buildVideoLocatorIndex,
  getGlobalMaxVideoId,
  normalizeAuthorsToVideos,
} from 'features/videos/services/adapters';

export const getVideos = async (): Promise<ProcessedVideo[]> => {
  const [categories, authors] = await Promise.all([fetchCategories(), fetchAuthors()]);
  // Keep backend DTO shape isolated from page components by normalizing immediately.
  return normalizeAuthorsToVideos(authors, categories);
};

export const addVideoToAuthor = async (authorId: number, video: Video): Promise<Author> => {
  const author = await fetchAuthorById(authorId);
  const updatedAuthor = buildAuthorPatchForCreate(author, video);

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
  return getGlobalMaxVideoId(authors);
};

export const updateVideo = async (videoId: number, updatedVideo: Video, newAuthorId: number, currentAuthorId: number): Promise<void> => {
  const currentAuthor = await fetchAuthorById(currentAuthorId);
  // Guard against ID collisions by validating the current author scope first.
  if (!buildVideoLocatorIndex([currentAuthor]).has(videoId)) throw new Error('Video not found');

  const isSameAuthor = currentAuthor.id === newAuthorId;

  if (isSameAuthor) {
    await saveAuthor(buildAuthorPatchForUpdate(currentAuthor, videoId, updatedVideo));
    return;
  }

  // Cross-author move: remove from current author, then append to destination author.
  const updatedOld = buildAuthorPatchForDelete(currentAuthor, videoId);
  await saveAuthor(updatedOld);

  const newAuthor = await fetchAuthorById(newAuthorId);
  await saveAuthor(buildAuthorPatchForCreate(newAuthor, updatedVideo));
};

export const deleteVideo = async (videoId: number, authorId: number): Promise<void> => {
  const author = await fetchAuthorById(authorId);
  const updatedAuthor = buildAuthorPatchForDelete(author, videoId);

  await saveAuthor(updatedAuthor);
};
