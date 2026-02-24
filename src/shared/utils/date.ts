export const formatDate = (value: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};
