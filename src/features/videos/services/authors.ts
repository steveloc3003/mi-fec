import type { Author } from 'common/interfaces';

export const getAuthors = async (): Promise<Author[]> => {
  const response = await fetch(`${process.env.REACT_APP_API}/authors`);

  return response.json() as unknown as Author[];
};
