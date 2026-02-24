import {
  addVideoToAuthor,
  deleteVideo,
  getMaxVideoIdForAuthor,
  getVideoWithAuthor,
  getVideos,
  updateVideo,
} from 'features/videos/services/videos';
import { fetchAuthorById, fetchAuthors, fetchCategories, saveAuthor } from 'features/videos/services/api';
import type { Author, Category, Video } from 'common/interfaces';

jest.mock('features/videos/services/api', () => ({
  fetchAuthors: jest.fn(),
  fetchAuthorById: jest.fn(),
  fetchCategories: jest.fn(),
  saveAuthor: jest.fn(),
}));

const mockedFetchAuthors = fetchAuthors as jest.MockedFunction<typeof fetchAuthors>;
const mockedFetchAuthorById = fetchAuthorById as jest.MockedFunction<typeof fetchAuthorById>;
const mockedFetchCategories = fetchCategories as jest.MockedFunction<typeof fetchCategories>;
const mockedSaveAuthor = saveAuthor as jest.MockedFunction<typeof saveAuthor>;

const makeVideo = (id: number, name: string): Video => ({
  id,
  name,
  catIds: [1],
  formats: { one: { res: '1080p', size: 1000 } },
  releaseDate: '2024-01-01',
});

describe('videos service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getVideos composes authors + categories into processed videos', async () => {
    const categories: Category[] = [{ id: 1, name: 'Thriller' }];
    const authors: Author[] = [{ id: 1, name: 'Author One', videos: [makeVideo(10, 'Ten')] }];
    mockedFetchCategories.mockResolvedValue(categories);
    mockedFetchAuthors.mockResolvedValue(authors);

    const result = await getVideos();

    expect(result).toEqual([
      expect.objectContaining({
        id: 10,
        authorId: 1,
        name: 'Ten',
        author: 'Author One',
        categories: ['Thriller'],
      }),
    ]);
  });

  it('addVideoToAuthor appends and saves', async () => {
    const existing = makeVideo(1, 'Old');
    const newVideo = makeVideo(2, 'New');
    mockedFetchAuthorById.mockResolvedValue({ id: 1, name: 'Author One', videos: [existing] });

    await addVideoToAuthor(1, newVideo);

    expect(mockedSaveAuthor).toHaveBeenCalledWith({
      id: 1,
      name: 'Author One',
      videos: [existing, newVideo],
    });
  });

  it('getVideoWithAuthor returns null when video is missing', async () => {
    mockedFetchAuthorById.mockResolvedValue({ id: 1, name: 'Author One', videos: [makeVideo(2, 'Two')] });

    const result = await getVideoWithAuthor(1, 99);

    expect(result).toBeNull();
  });

  it('getMaxVideoIdForAuthor returns max id across all authors', async () => {
    mockedFetchAuthors.mockResolvedValue([
      { id: 1, name: 'A', videos: [makeVideo(2, 'Two'), makeVideo(8, 'Eight')] },
      { id: 2, name: 'B', videos: [makeVideo(5, 'Five')] },
    ]);

    const maxId = await getMaxVideoIdForAuthor(1);

    expect(maxId).toBe(8);
  });

  it('updateVideo replaces in place when author does not change', async () => {
    const oldVideo = makeVideo(2, 'Old');
    const updated = makeVideo(2, 'Updated');
    mockedFetchAuthorById.mockResolvedValue({ id: 1, name: 'Author One', videos: [oldVideo] });

    await updateVideo(2, updated, 1, 1);

    expect(mockedSaveAuthor).toHaveBeenCalledTimes(1);
    expect(mockedSaveAuthor).toHaveBeenCalledWith({
      id: 1,
      name: 'Author One',
      videos: [updated],
    });
  });

  it('updateVideo moves video to a different author', async () => {
    const moved = makeVideo(2, 'Moved');
    mockedFetchAuthorById
      .mockResolvedValueOnce({ id: 1, name: 'Old Author', videos: [makeVideo(2, 'Old')] })
      .mockResolvedValueOnce({ id: 2, name: 'New Author', videos: [makeVideo(5, 'Five')] });

    await updateVideo(2, moved, 2, 1);

    expect(mockedSaveAuthor).toHaveBeenNthCalledWith(1, {
      id: 1,
      name: 'Old Author',
      videos: [],
    });
    expect(mockedSaveAuthor).toHaveBeenNthCalledWith(2, {
      id: 2,
      name: 'New Author',
      videos: [makeVideo(5, 'Five'), moved],
    });
  });

  it('deleteVideo removes video from the specified author', async () => {
    mockedFetchAuthorById.mockResolvedValue({
      id: 1,
      name: 'Author One',
      videos: [makeVideo(2, 'Two'), makeVideo(3, 'Three')],
    });

    await deleteVideo(2, 1);

    expect(mockedSaveAuthor).toHaveBeenCalledWith({
      id: 1,
      name: 'Author One',
      videos: [makeVideo(3, 'Three')],
    });
  });
});
