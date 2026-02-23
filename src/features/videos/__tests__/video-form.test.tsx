import { render } from '@testing-library/react';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import { VideoForm } from '../pages/add/video-form';
import { addVideoToAuthor, updateVideo, getAuthors, getCategories, getMaxVideoIdForAuthor } from '../services';

jest.mock('../services', () => ({
  getAuthors: jest.fn(),
  getCategories: jest.fn(),
  addVideoToAuthor: jest.fn(),
  updateVideo: jest.fn(),
  getMaxVideoIdForAuthor: jest.fn(),
}));

const mockedGetAuthors = getAuthors as jest.Mock;
const mockedGetCategories = getCategories as jest.Mock;
const mockedAddVideoToAuthor = addVideoToAuthor as jest.Mock;
const mockedUpdateVideo = updateVideo as jest.Mock;
const mockedGetMaxVideoIdForAuthor = getMaxVideoIdForAuthor as jest.Mock;

const authors = [{ id: 1, name: 'Author One', videos: [] }];
const categories = [
  { id: 1, name: 'Thriller' },
  { id: 2, name: 'Comedy' },
];

describe('VideoForm', () => {
  beforeEach(() => {
    (global as any).alert = jest.fn();
    mockedGetAuthors.mockResolvedValue(authors);
    mockedGetCategories.mockResolvedValue(categories);
    mockedAddVideoToAuthor.mockResolvedValue(undefined);
    mockedUpdateVideo.mockResolvedValue(undefined);
    mockedGetMaxVideoIdForAuthor.mockResolvedValue(2);
  });

  afterEach(jest.clearAllMocks);

  it('disables submit until required fields are filled', async () => {
    render(<VideoForm mode="create" />);

    const submit = await screen.findByRole('button', { name: /submit/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/video name/i), 'New Title');
    await userEvent.selectOptions(screen.getByLabelText(/video author/i), ['1']);
    await userEvent.selectOptions(screen.getByLabelText(/video categories/i), ['1']);

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('creates a video via addVideoToAuthor and calls onSubmit', async () => {
    const onSubmit = jest.fn();
    render(<VideoForm mode="create" onSubmit={onSubmit} />);

    await userEvent.type(await screen.findByLabelText(/video name/i), 'New Title');
    await userEvent.selectOptions(screen.getByLabelText(/video author/i), ['1']);
    await userEvent.selectOptions(screen.getByLabelText(/video categories/i), ['1', '2']);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockedAddVideoToAuthor).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalled();
    const [authorId, videoPayload] = mockedAddVideoToAuthor.mock.calls[0];
    expect(authorId).toBe(1);
    expect(videoPayload.formats.one).toEqual({ res: '1080p', size: 1000 });
  });

  it('updates a video in edit mode', async () => {
    const onSubmit = jest.fn();
    render(
      <VideoForm
        mode="edit"
        initialVideo={{
          id: 10,
          name: 'Old Name',
          catIds: [1],
          formats: { one: { res: '1080p', size: 1000 } },
          releaseDate: '2020-01-01',
        }}
        initialAuthorId={1}
        onSubmit={onSubmit}
      />
    );

    const nameInput = await screen.findByLabelText(/video name/i);
    expect(nameInput).toHaveValue('Old Name');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockedUpdateVideo).toHaveBeenCalledWith(10, expect.objectContaining({ name: 'Updated Name' }), 1));
    expect(onSubmit).toHaveBeenCalled();
  });
});
