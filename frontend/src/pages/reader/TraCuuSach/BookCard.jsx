import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { coverUrl } from '../../../lib/api';

const TONE = {
  ok: { text: 'text-secondary', dot: 'bg-secondary' },
  low: { text: 'text-tertiary', dot: 'bg-tertiary' },
  out: { text: 'text-error', dot: 'bg-error' },
};

function availability(b) {
  if (b.referenceOnly || !b.allowHomeLoan) return { tone: 'low', label: 'Đọc tại chỗ' };
  if (b.availableCopies === 0) return { tone: 'out', label: b.totalCopies ? 'Hết bản' : 'Chưa có bản' };
  return { tone: b.availableCopies <= 1 ? 'low' : 'ok', label: `Còn ${b.availableCopies} bản` };
}

export default function BookCard({ book }) {
  const navigate = useNavigate();
  const toast = useToast();
  const av = availability(book);
  const tone = TONE[av.tone];
  const img = coverUrl(book.cover);
  const authors = [book.author, book.coAuthors].filter(Boolean).join(', ');

  const copyCallNumber = async () => {
    const v = book.callNumber || book.isbn;
    if (!v) return toast('Sách chưa có ký hiệu xếp giá');
    try {
      await navigator.clipboard.writeText(v);
      toast(`Đã sao chép ký hiệu: ${v}`);
    } catch {
      toast(`Ký hiệu xếp giá: ${v}`);
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      <div className="relative w-full aspect-[3/4] bg-surface-container overflow-hidden">
        {img ? (
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={img} alt={book.title} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-[56px]">menu_book</span>
          </div>
        )}
        {book.category && (
          <span className="absolute top-2 left-2 max-w-[60%] truncate bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm shadow-xs font-semibold">
            {book.category.name}
          </span>
        )}
        {book.ddcMain && (
          <span className="absolute top-2 right-2 bg-surface-container-lowest/95 text-secondary font-code-md text-code-md px-1.5 py-0.5 rounded-sm font-bold shadow-xs">
            DDC: {book.ddcMain}
          </span>
        )}
      </div>
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary-container transition-colors line-clamp-2" title={book.title}>
            {book.title}
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate" title={authors}>
            {authors}
            {book.publishYear ? ` • ${book.publishYear}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-space-sm pt-space-xs">
          <div className="flex items-center justify-between text-body-sm">
            <span className={`font-label-sm text-label-sm ${tone.text} flex items-center gap-1 font-semibold`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
              {av.label}
            </span>
            <span className="font-code-md text-code-md text-outline">Kệ: {book.shelf || '—'}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button className="h-8 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm rounded-sm transition-colors flex items-center justify-center" onClick={() => navigate(`/chi-tiet-sach?id=${book.documentId}`)}>
              Chi tiết
            </button>
            <button className="h-8 bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm rounded-sm font-semibold transition-colors flex items-center justify-center shadow-xs" title="Sao chép ký hiệu xếp giá để tìm sách trên kệ" onClick={copyCallNumber}>
              Chép ký hiệu
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
