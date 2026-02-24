import type { Author, Category, ProcessedVideo, Video } from 'common/interfaces';

export const pickHighestQualityLabel = (formats: Record<string, { res: string; size: number | string }>): string => {
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

export const toProcessedVideos = (authors: Author[], categories: Category[]): ProcessedVideo[] => {
  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));

  return authors.flatMap((author) =>
    author.videos.map((video: Video) => ({
      id: video.id,
      authorId: author.id,
      name: video.name,
      author: author.name,
      releaseDate: video.releaseDate,
      highestQualityFormat: pickHighestQualityLabel(video.formats),
      categories: video.catIds.map((catId) => categoriesById.get(catId)).filter((catName): catName is string => Boolean(catName)),
    }))
  );
};
