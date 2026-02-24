import { pickHighestQualityLabel, toProcessedVideos } from 'features/videos/services/helpers';
import type { Author, Category } from 'common/interfaces';

describe('videos service helpers', () => {
  it('pickHighestQualityLabel prefers largest size, then higher resolution on ties', () => {
    const label = pickHighestQualityLabel({
      one: { res: '720p', size: 1000 },
      two: { res: '1080p', size: 1000 },
      three: { res: '480p', size: 900 },
    });

    expect(label).toBe('two 1080p');
  });

  it('toProcessedVideos maps author/category data and keeps authorId', () => {
    const authors: Author[] = [
      {
        id: 7,
        name: 'Author A',
        videos: [
          {
            id: 10,
            name: 'Video A',
            catIds: [1, 999],
            formats: { one: { res: '1080p', size: 1500 } },
            releaseDate: '2024-01-02',
          },
        ],
      },
    ];
    const categories: Category[] = [{ id: 1, name: 'Thriller' }];

    const result = toProcessedVideos(authors, categories);

    expect(result).toEqual([
      {
        id: 10,
        authorId: 7,
        name: 'Video A',
        author: 'Author A',
        releaseDate: '2024-01-02',
        highestQualityFormat: 'one 1080p',
        categories: ['Thriller'],
      },
    ]);
  });
});
