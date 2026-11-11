import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api, qs } from '../../../lib/api';
import { fetchCatalog } from '../../../lib/catalog';
import { useToast } from '../../../context/ToastContext';

const STATUSES = {
  active: 'Đang lưu hành',
  low_stock: 'Sắp hết bản',
  restricted: 'Hạn chế mượn',
  discontinued: 'Ngừng lưu hành',
};
const PAGE_SIZE = 10;
const controlClass = 'h-10 px-3 rounded-sm border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';
const buttonClass = 'inline-flex items-center justify-center gap-2 px-4 h-10 rounded-sm border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed';

export default function QuanLyDauSachPage() {
  const toast = useToast();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const status = params.get('status') || '';
  const pageValue = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [result, setResult] = useState({ data: [], total: 0, pageCount: 0, queryKey: '' });
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const deleteBusy = useRef(false);
  const from = location.pathname + location.search;
  const queryKey = JSON.stringify([search, category, status, page, refresh]);
  const isLoading = loading || result.queryKey !== queryKey;

  useEffect(() => {
    let active = true;
    fetchCatalog('/categories')
      .then((rows) => { if (active) { setCategories(rows); setCategoryError(''); } })
      .catch((e) => { if (active) setCategoryError(e.message); });
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    let active = true;
    const query = {
      'pagination[page]': page,
      'pagination[pageSize]': PAGE_SIZE,
      'populate[category]': 'true',
      'sort[0]': 'createdAt:desc',
      'sort[1]': 'id:desc',
    };
    if (search) {
      ['title', 'author', 'isbn'].forEach((field, index) => {
        query[`filters[$or][${index}][${field}][$containsi]`] = search;
      });
    }
    if (category) query['filters[category][documentId][$eq]'] = category;
    if (status) query['filters[status][$eq]'] = status;
    api(`/books?${qs(query)}`)
      .then((response) => {
        if (active) {
          const lastPage = Math.max(1, response.meta.pagination.pageCount);
          if (page > lastPage) {
            setParams((previous) => {
              const next = new URLSearchParams(previous);
              next.set('page', String(lastPage));
              return next;
            }, { replace: true });
          }
          setResult({ data: response.data, ...response.meta.pagination, queryKey });
          setError('');
        }
      })
      .catch((e) => {
        if (active) {
          setResult({ data: [], total: 0, pageCount: 0, queryKey });
          setError(e.message);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, status, page, refresh, queryKey, setParams]);

  function navigateList(next) {
    setLoading(true);
    setParams(next);
    setRefresh((value) => value + 1);
  }

  function filter(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ['q', 'category', 'status']) {
      const value = fields.get(key).trim();
      if (value) next.set(key, value);
    }
    navigateList(next);
  }

  function goToPage(nextPage) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    navigateList(next);
  }

  async function removeBook(book) {
    if (deleteBusy.current || !window.confirm(`Xóa đầu sách “${book.title}”? Thao tác này sẽ xóa thông tin đầu sách.`)) return;
    deleteBusy.current = true;
    setDeleting(book.documentId);
    try {
      await api(`/books/${encodeURIComponent(book.documentId)}`, { method: 'DELETE' });
      toast('Đã xóa đầu sách');
      setLoading(true);
      setRefresh((value) => value + 1);
    } catch (e) {
      setError(e.message);
      toast(e.message);
    } finally {
      setDeleting(null);
      deleteBusy.current = false;
    }
  }

  return (
    <main className="pt-16 bg-surface min-h-screen text-on-surface">
      <div className="max-w-[1600px] mx-auto p-space-lg space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">BIÊN MỤC & TÀI LIỆU</p>
            <h1 className="text-2xl font-bold">Quản lý đầu sách</h1>
            <p className="mt-2 text-on-surface-variant">Tra cứu và cập nhật danh mục sách của thư viện.</p>
          </div>
          <Link to="/them-moi-sua-sach" state={{ from }} className={`${buttonClass} bg-primary text-on-primary hover:bg-primary-container border-transparent`}>
            <span className="material-symbols-outlined" aria-hidden="true">add</span>Thêm đầu sách
          </Link>
        </header>

        <section className="bg-surface-container-lowest rounded-sm p-5 shadow-sm space-y-4" aria-label="Danh mục đầu sách">
          <form key={`${search}|${category}|${status}`} onSubmit={filter} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-56 space-y-1">
              <span className="block text-sm font-medium">Tìm sách</span>
              <input name="q" defaultValue={search} disabled={deleting !== null} className={`${controlClass} w-full`} placeholder="Tên sách, tác giả hoặc ISBN" type="search" />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium">Thể loại</span>
              <select key={categories.length} name="category" defaultValue={category} disabled={deleting !== null} className={`${controlClass} max-w-64`}>
                <option value="">Tất cả thể loại</option>
                {categories.map((item) => <option key={item.documentId} value={item.documentId}>{item.name}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium">Trạng thái</span>
              <select name="status" defaultValue={status} disabled={deleting !== null} className={controlClass}>
                <option value="">Tất cả trạng thái</option>
                {Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <button type="submit" disabled={deleting !== null} className={`${buttonClass} bg-primary text-on-primary hover:bg-primary-container border-transparent`}>Tìm kiếm</button>
            <button type="button" disabled={deleting !== null} className={buttonClass} onClick={() => navigateList({})}>Đặt lại</button>
          </form>

          {categoryError && <p role="alert" className="text-error">Không tải được thể loại. {categoryError}</p>}
          {!isLoading && error && (
            <div role="alert" className="p-3 bg-error-container text-on-error-container rounded-sm flex flex-wrap items-center gap-3">
              <span>{error}</span>
              <button type="button" className="underline" onClick={() => { setLoading(true); setRefresh((value) => value + 1); }}>Thử lại</button>
            </div>
          )}
          <p aria-live="polite" className="text-sm text-on-surface-variant">
            {isLoading ? 'Đang tải danh mục…' : `Tìm thấy ${result.total} đầu sách`}
          </p>
          <div className="overflow-x-auto" aria-busy={isLoading}>
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>{['Đầu sách / Tác giả', 'ISBN', 'Thể loại', 'Năm XB', 'Trạng thái', 'Thao tác'].map((label) => <th scope="col" key={label} className="p-3 whitespace-nowrap">{label}</th>)}</tr>
              </thead>
              <tbody>
                {!isLoading && result.data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">Chưa có đầu sách phù hợp.</td></tr>}
                {!isLoading && result.data.map((book) => (
                  <tr key={book.documentId} className="border-b border-surface-container hover:bg-surface-container-low/50">
                    <td className="p-3 min-w-56">
                      <Link to={`/them-moi-sua-sach?id=${encodeURIComponent(book.documentId)}`} state={{ from }} className="font-semibold text-primary hover:underline">{book.title}</Link>
                      <p className="mt-1 text-on-surface-variant">{book.author}</p>
                    </td>
                    <td className="p-3 whitespace-nowrap">{book.isbn || '—'}</td>
                    <td className="p-3">{book.category?.name || 'Chưa phân loại'}</td>
                    <td className="p-3">{book.publishYear || '—'}</td>
                    <td className="p-3 whitespace-nowrap"><span className="bg-surface-container-low px-2 py-1 rounded-sm">{STATUSES[book.status] || book.status || '—'}</span></td>
                    <td className="p-3 whitespace-nowrap">
                      <Link to={`/them-moi-sua-sach?id=${encodeURIComponent(book.documentId)}`} state={{ from }} className="inline-block p-2 text-primary hover:underline" aria-label={`Sửa ${book.title}`}>Sửa</Link>
                      <button type="button" className="p-2 text-error hover:underline disabled:opacity-50" disabled={deleting !== null} onClick={() => removeBook(book)} aria-label={`Xóa ${book.title}`}>
                        {deleting === book.documentId ? 'Đang xóa…' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav aria-label="Phân trang đầu sách" className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-sm text-on-surface-variant">Trang {page} / {Math.max(1, result.pageCount)}</span>
            <div className="flex gap-2">
              <button type="button" className={buttonClass} disabled={isLoading || deleting !== null || page <= 1} onClick={() => goToPage(page - 1)}>Trang trước</button>
              <button type="button" className={buttonClass} disabled={isLoading || deleting !== null || page >= result.pageCount} onClick={() => goToPage(page + 1)}>Trang sau</button>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}
