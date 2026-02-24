import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { VideosTable, SortDirection, SortField } from '../components/videos-table';
import type { ProcessedVideo } from 'common/interfaces';

const sampleVideos: ProcessedVideo[] = [
  {
    id: 1,
    authorId: 1,
    name: 'One',
    author: 'Author One',
    highestQualityFormat: 'one 1080p',
    releaseDate: '2020-01-01',
    categories: ['Thriller'],
  },
];

const renderTable = (override?: Partial<React.ComponentProps<typeof VideosTable>>) =>
  render(
    <MemoryRouter>
      <VideosTable
        videos={sampleVideos}
        sortField={(override?.sortField as SortField) ?? 'name'}
        sortDirection={(override?.sortDirection as SortDirection) ?? 'asc'}
        onSort={override?.onSort ?? jest.fn()}
        onDelete={override?.onDelete ?? jest.fn()}
      />
    </MemoryRouter>
  );

describe('VideosTable', () => {
  it('renders rows', () => {
    const { getByText } = renderTable();
    expect(getByText('One')).toBeInTheDocument();
    expect(getByText('Author One')).toBeInTheDocument();
  });

  it('calls onSort when header clicked', async () => {
    const onSort = jest.fn();
    const { getByText } = renderTable({ onSort });
    await userEvent.click(getByText(/video name/i));
    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('confirms and calls onDelete', async () => {
    const onDelete = jest.fn();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { getByRole } = renderTable({ onDelete });

    await userEvent.click(getByRole('button', { name: /delete/i }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(1, 1);
    confirmSpy.mockRestore();
  });
});
