import type { Author, Category, ProcessedVideo, Video } from 'common/interfaces';
import { toProcessedVideos } from 'features/videos/services/helpers';

export type VideoLocator = {
  videoId: number;
  authorId: number;
};

export const normalizeAuthorsToVideos = (authors: Author[], categories: Category[]): ProcessedVideo[] => {
  // Flatten backend nested shape (authors[].videos[]) into UI-friendly list rows.
  return toProcessedVideos(authors, categories);
};

export const buildAuthorPatchForCreate = (author: Author, video: Video): Author => {
  return {
    ...author,
    videos: [...author.videos, video],
  };
};

export const buildAuthorPatchForUpdate = (author: Author, videoId: number, updatedVideo: Video): Author => {
  const hasVideo = author.videos.some((video) => video.id === videoId);
  if (!hasVideo) throw new Error('Video not found');

  return {
    ...author,
    videos: author.videos.map((video) => (video.id === videoId ? updatedVideo : video)),
  };
};

export const buildAuthorPatchForDelete = (author: Author, videoId: number): Author => {
  const hasVideo = author.videos.some((video) => video.id === videoId);
  if (!hasVideo) throw new Error('Video not found');

  return {
    ...author,
    videos: author.videos.filter((video) => video.id !== videoId),
  };
};

export const buildVideoLocatorIndex = (authors: Author[]): Map<number, VideoLocator[]> => {
  // Keeps possible multiple owners for same video id in case dataset contains collisions.
  const index = new Map<number, VideoLocator[]>();

  for (const author of authors) {
    for (const video of author.videos) {
      const current = index.get(video.id) ?? [];
      current.push({ videoId: video.id, authorId: author.id });
      index.set(video.id, current);
    }
  }

  return index;
};

export const getGlobalMaxVideoId = (authors: Author[]): number => {
  // New IDs should be unique globally, not only per author.
  return authors.flatMap((author) => author.videos).reduce((max, video) => (video.id > max ? video.id : max), 0);
};
