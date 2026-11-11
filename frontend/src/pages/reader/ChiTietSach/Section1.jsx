import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';

export default function Section1({ book }) {
  const toast = useToast();

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Đã sao chép liên kết sách');
    } catch {
      toast('Không sao chép được, hãy copy địa chỉ trên thanh trình duyệt');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-md shadow-sm">
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap">
        <Link to="/tra-cuu-sach" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          Tra cứu sách
        </Link>
        {book.category && (
          <>
            <span className="text-outline">/</span>
            <Link to={`/tra-cuu-sach?category=${book.category.documentId}`} className="hover:text-primary transition-colors">
              {book.category.name}
            </Link>
          </>
        )}
        <span className="text-outline">/</span>
        <span className="text-on-surface font-semibold">Chi tiết sách</span>
      </nav>
      <div className="flex items-center gap-space-xs">
        {book.isbn && (
          <span className="font-code-md text-code-md bg-surface-container-low text-on-surface-variant px-space-sm py-1 rounded-sm">
            ISBN: {book.isbn}
          </span>
        )}
        <button
          className="h-9 px-space-sm bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-sm font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
          title="Sao chép liên kết chia sẻ"
          onClick={share}
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>
    </div>
  );
}
