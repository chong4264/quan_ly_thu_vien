import { useEffect, useRef, useState } from 'react';
import { api, qs } from '../../../lib/api';
import BookCard from './BookCard';

const SORTS = [
  ['newest', 'Mới nhập trước'],
  ['title', 'Tên sách A → Z'],
  ['year', 'Năm xuất bản mới nhất'],
];

const GRID = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md';

/** Hiển thị "Sách mới nhập" khi chưa tìm gì, ngược lại hiển thị kết quả tra cứu có phân trang. */
export default function KetQuaTraCuu({ params, onChange }) {
  const searching = !!(params.q || params.category || params.language || params.browse);
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  const key = JSON.stringify(searching ? params : 'new');

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    const url = searching
      ? `/books/search?${qs(Object.fromEntries(Object.entries({
          q: params.q, category: params.category, language: params.language,
          available: params.available ? '1' : '', sort: params.sort, page: params.page, pageSize: 12,
        }).filter(([, v]) => v !== '' && v != null)))}`
      : '/books/new-arrivals?limit=8';
    api(url)
      .then((r) => {
        if (id !== reqId.current) return; // bỏ kết quả của lần gọi cũ
        setBooks(r.data); setMeta(r.meta); setError('');
      })
      .catch((e) => id === reqId.current && setError(e.message))
      .finally(() => id === reqId.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const pg = meta?.pagination;

  return (
    <section className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="w-2.5 h-6 bg-primary-container rounded-sm" />
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            {searching ? 'Kết quả tra cứu' : 'Sách mới nhập'}
          </h3>
          {meta && (
            <span className="font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-container px-2 py-0.5 rounded-sm font-semibold ml-2">
              {searching ? `${pg?.total ?? 0} đầu sách` : `${meta.recent30Days} đầu sách trong 30 ngày`}
            </span>
          )}
        </div>
        {searching ? (
          <select
            className="h-9 pl-3 pr-8 bg-surface-container-low rounded-sm font-label-md text-label-md text-on-surface focus:outline-none"
            value={params.sort}
            onChange={(e) => onChange({ sort: e.target.value })}
          >
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ) : (
          meta && (
            <button type="button" onClick={() => onChange({ browse: true })} className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold flex items-center gap-1 group">
              Xem tất cả ({meta.total})
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
          )
        )}
      </div>

      {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-surface-container" />
              <div className="p-space-md flex flex-col gap-2"><div className="h-4 bg-surface-container rounded" /><div className="h-3 w-2/3 bg-surface-container rounded" /></div>
            </div>
          ))}
        </div>
      ) : books.length ? (
        <div className={GRID}>{books.map((b) => <BookCard key={b.documentId} book={b} />)}</div>
      ) : (
        !error && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
            <p className="font-body-md text-body-md">
              {searching ? 'Không tìm thấy sách phù hợp. Thử đổi từ khóa hoặc bỏ bớt bộ lọc.' : 'Thư viện chưa có đầu sách nào.'}
            </p>
            {searching && params.available && (
              <button type="button" className="font-label-md text-label-md text-primary-container hover:text-primary font-semibold" onClick={() => onChange({ available: false })}>
                Hiện cả sách đang được mượn
              </button>
            )}
          </div>
        )
      )}

      {searching && pg && pg.pageCount > 1 && (
        <div className="flex items-center justify-center gap-space-md pt-space-sm">
          <button type="button" disabled={pg.page <= 1} onClick={() => onChange({ page: pg.page - 1 })} className="h-9 px-4 bg-surface-container-low hover:bg-surface-container rounded-sm font-label-md text-label-md text-on-surface disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>Trước
          </button>
          <span className="font-label-md text-label-md text-on-surface-variant">Trang {pg.page} / {pg.pageCount}</span>
          <button type="button" disabled={pg.page >= pg.pageCount} onClick={() => onChange({ page: pg.page + 1 })} className="h-9 px-4 bg-surface-container-low hover:bg-surface-container rounded-sm font-label-md text-label-md text-on-surface disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1">
            Sau<span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
