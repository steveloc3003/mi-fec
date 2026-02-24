import type { Author, Category, Video } from 'common/interfaces';
import {
  buildAuthorPatchForCreate,
  buildAuthorPatchForDelete,
  buildAuthorPatchForUpdate,
  buildVideoLocatorIndex,
  getGlobalMaxVideoId,
  normalizeAuthorsToVideos,
} from 'features/videos/services/adapters';

const makeVideo = (id: number, name: string, catIds: number[] = [1]): Video => ({
  id,
  name,
  catIds,
  formats: {
    one: { res: '720p', size: 800 },
    two: { res: '1080p', size: 1000 },
  },
  releaseDate: '2024-01-01',
});

describe('videos adapters', () => {
  it('normalizes nested backend data into flat processed videos', () => {
    const authors: Author[] = [{ id: 10, name: 'Author A', videos: [makeVideo(2, 'Sample')] }];
    const categories: Category[] = [{ id: 1, name: 'Thriller' }];

    const result = normalizeAuthorsToVideos(authors, categories);

    expect(result).toEqual([
      {
        id: 2,
        authorId: 10,
        name: 'Sample',
        author: 'Author A',
        releaseDate: '2024-01-01',
        highestQualityFormat: 'two 1080p',
        categories: ['Thriller'],
      },
    ]);
  });

  it('buildAuthorPatchForCreate appends a video to the target author', () => {
    const author: Author = { id: 1, name: 'Author', videos: [makeVideo(1, 'One')] };
    const patch = buildAuthorPatchForCreate(author, makeVideo(2, 'Two'));

    expect(patch.videos.map((video) => video.id)).toEqual([1, 2]);
  });

  it('buildAuthorPatchForUpdate replaces an existing video', () => {
    const author: Author = { id: 1, name: 'Author', videos: [makeVideo(1, 'Old')] };
    const patch = buildAuthorPatchForUpdate(author, 1, makeVideo(1, 'New'));

    expect(patch.videos[0].name).toBe('New');
  });

  it('buildAuthorPatchForUpdate throws for unknown video id', () => {
    const author: Author = { id: 1, name: 'Author', videos: [makeVideo(1, 'Old')] };

    expect(() => buildAuthorPatchForUpdate(author, 99, makeVideo(99, 'New'))).toThrow('Video not found');
  });

  it('buildAuthorPatchForDelete removes a video and throws for unknown id', () => {
    const author: Author = { id: 1, name: 'Author', videos: [makeVideo(1, 'One'), makeVideo(2, 'Two')] };
    const patch = buildAuthorPatchForDelete(author, 1);

    expect(patch.videos.map((video) => video.id)).toEqual([2]);
    expect(() => buildAuthorPatchForDelete(author, 99)).toThrow('Video not found');
  });

  it('buildVideoLocatorIndex tracks author ownership including duplicated ids', () => {
    const authors: Author[] = [
      { id: 1, name: 'A', videos: [makeVideo(5, 'A-5')] },
      { id: 2, name: 'B', videos: [makeVideo(5, 'B-5')] },
    ];

    const index = buildVideoLocatorIndex(authors);

    expect(index.get(5)).toEqual([
      { videoId: 5, authorId: 1 },
      { videoId: 5, authorId: 2 },
    ]);
  });

  it('getGlobalMaxVideoId finds max id across all authors', () => {
    const authors: Author[] = [
      { id: 1, name: 'A', videos: [makeVideo(2, 'Two')] },
      { id: 2, name: 'B', videos: [makeVideo(9, 'Nine')] },
    ];

    expect(getGlobalMaxVideoId(authors)).toBe(9);
  });
});
