import { api, qs } from './api';

export async function fetchCatalog(path, sort = 'name:asc') {
  const records = [];
  let page = 1;
  let pageCount;
  do {
    const result = await api(`${path}?${qs({
      'pagination[page]': page,
      'pagination[pageSize]': 100,
      sort,
    })}`);
    records.push(...result.data);
    pageCount = result.meta.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);
  return records;
}
