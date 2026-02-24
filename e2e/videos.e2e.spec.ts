import { expect, test } from '@playwright/test';

// Escape arbitrary strings before placing them into RegExp patterns.
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRowByVideoName = (page: import('@playwright/test').Page, videoName: string) => {
  // Exact-match the name cell to avoid selecting "name updated" when looking for "name".
  const exactName = new RegExp(`^${escapeRegExp(videoName)}$`);
  return page
    .locator('tr')
    .filter({ has: page.locator('td', { hasText: exactName }) })
    .first();
};

const createVideo = async (page: import('@playwright/test').Page, title: string) => {
  // Shared setup helper so edit/delete tests are fully independent and can run alone.
  await page.goto('/videos');
  await expect(page.getByRole('heading', { name: /vmanager demo/i })).toBeVisible();

  await page.getByRole('button', { name: /add video/i }).click();
  await expect(page.getByRole('heading', { name: /add video/i })).toBeVisible();

  await page.getByLabel('Video name').fill(title);
  await page.getByLabel('Video author').selectOption({ label: 'Li Sun Chi' });
  await page.getByLabel('Video categories').selectOption([{ value: '1' }, { value: '2' }]);
  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page).toHaveURL(/\/videos$/);
  await expect(getRowByVideoName(page, title)).toBeVisible();
};

test('shows not found page for unknown route', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(page.getByRole('heading', { name: /404 - page not found/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /go to videos/i })).toBeVisible();
});

test('add a new video', async ({ page }) => {
  const createdTitle = `E2E Video ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await createVideo(page, createdTitle);
});

test('edit a video', async ({ page }) => {
  const createdTitle = `E2E Edit Source ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const editedTitle = `${createdTitle} Updated`;
  await createVideo(page, createdTitle);

  const row = getRowByVideoName(page, createdTitle);
  await row.getByRole('link', { name: /edit/i }).click();

  const nameInput = page.getByLabel('Video name');
  await expect(nameInput).toHaveValue(createdTitle);
  await nameInput.fill(editedTitle);
  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page).toHaveURL(/\/videos$/);
  await expect(getRowByVideoName(page, editedTitle)).toBeVisible();
});

test('delete a video', async ({ page }) => {
  const createdTitle = `E2E Delete Source ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await createVideo(page, createdTitle);

  const row = getRowByVideoName(page, createdTitle);
  page.once('dialog', (dialog) => dialog.accept());
  await row.getByRole('button', { name: /delete/i }).click();

  await expect(getRowByVideoName(page, createdTitle)).toHaveCount(0);
});

test('keeps video when delete confirmation is canceled', async ({ page }) => {
  const createdTitle = `E2E Cancel Delete ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await createVideo(page, createdTitle);

  const row = getRowByVideoName(page, createdTitle);
  page.once('dialog', (dialog) => dialog.dismiss());
  await row.getByRole('button', { name: /delete/i }).click();

  await expect(getRowByVideoName(page, createdTitle)).toBeVisible();
});

test('shows error for invalid edit route params', async ({ page }) => {
  await page.goto('/videos/not-a-number/1/edit');

  await expect(page.getByRole('alert')).toContainText(/invalid video id\./i);
  await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
});

test('shows list-level error when videos data request fails', async ({ page }) => {
  // Simulate backend failure to verify user-visible error handling in list page.
  await page.route('**/categories', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/videos');

  await expect(page.getByRole('alert')).toContainText(/failed to fetch categories/i);
});
