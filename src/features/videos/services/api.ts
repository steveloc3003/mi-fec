import type { Author, Category } from 'common/interfaces';

const baseUrl = process.env.REACT_APP_API;

export const fetchAuthors = async (): Promise<Author[]> => {
  const response = await fetch(`${baseUrl}/authors`);
  if (!response.ok) throw new Error('Failed to fetch authors');
  return (await response.json()) as Author[];
};

export const fetchAuthorById = async (authorId: number): Promise<Author> => {
  const response = await fetch(`${baseUrl}/authors/${authorId}`);
  if (!response.ok) throw new Error('Failed to fetch author');
  return (await response.json()) as Author;
};

export const saveAuthor = async (author: Author): Promise<void> => {
  const response = await fetch(`${baseUrl}/authors/${author.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(author),
  });
  if (!response.ok) throw new Error('Failed to save author');
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${baseUrl}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return (await response.json()) as Category[];
};
