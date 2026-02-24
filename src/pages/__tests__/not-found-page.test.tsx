import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { App } from 'App';

describe('NotFoundPage route', () => {
  it('renders 404 page for unknown paths', async () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to videos/i })).toHaveAttribute('href', '/videos');
  });
});
