import { Link, useNavigate } from 'react-router-dom';
import { coverUrl } from '../../../lib/api';

export default function TaiLieuCungChuyen({ books, category }) {
  const navigate = useNavigate();
  if (!books.length) return null;

  return (
    <div className="mt-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-between gap-space-sm flex-wrap">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Tài liệu cùng chuyên đề</h2>
          {category && <p className="font-body-sm text-body-sm text-on-surface-variant">Các đầu sách khác thuộc thể loại {category.name}</p>}
        </div>
        {category && (
          <Link to={`/tra-cuu-sach?category=${category.documentId}`} className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
            Xem toàn bộ thể loại {category.name}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {books.map((b) => {
          const img = coverUrl(b.cover);
          const out = b.availableCopies === 0;
          const badge = b.referenceOnly || !b.allowHomeLoan
            ? ['bg-tertiary-fixed text-on-tertiary-fixed', 'Đọc tại chỗ']
            : out
              ? ['bg-tertiary-fixed text-on-tertiary-fixed', b.totalCopies ? 'Đang mượn hết' : 'Chưa có bản']
              : ['bg-secondary-fixed text-on-secondary-fixed', `Còn ${b.availableCopies} bản`];
          return (
            <div key={b.documentId} className="bg-surface-container-lowest p-space-md rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[1/1.35] w-full rounded-sm overflow-hidden bg-surface-container-high mb-space-sm">
                  {img ? (
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={img} alt={b.title} loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline"><span className="material-symbols-outlined text-[48px]">menu_book</span></div>
                  )}
                  <span className={`absolute top-2 right-2 ${badge[0]} font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm font-bold`}>{badge[1]}</span>
                </div>
                {b.ddcMain && <span className="font-code-md text-label-sm text-primary font-bold">DDC {b.ddcMain}</span>}
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1">{b.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">{[b.author, b.coAuthors].filter(Boolean).join(', ')}</p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline">{b.shelf ? `Kệ ${b.shelf}` : ''}</span>
                <button className="h-8 px-space-sm bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-sm font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick={() => navigate(`/chi-tiet-sach?id=${b.documentId}`)}>
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
