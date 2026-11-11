import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../../lib/api';
import Section1 from './Section1';
import DaiSoTuyenTinh from './DaiSoTuyenTinh';
import TaiLieuCungChuyen from './TaiLieuCungChuyen';

const Shell = ({ children }) => (
  <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
    {children}
  </div></div></main>
);

const Notice = ({ icon, text }) => (
  <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col items-center gap-3 text-on-surface-variant">
    <span className="material-symbols-outlined text-[44px] text-outline">{icon}</span>
    <p className="font-body-md text-body-md">{text}</p>
    <Link to="/tra-cuu-sach" className="h-10 px-5 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-md text-label-md font-semibold flex items-center">
      Quay lại Tra cứu sách
    </Link>
  </div>
);

/** Đường dẫn: /chi-tiet-sach?id=<documentId của đầu sách> */
export default function ChiTietSachPage() {
  const [sp] = useSearchParams();
  const id = sp.get('id') || '';
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    if (!id) return;
    const n = ++reqId.current;
    setLoading(true); setError(''); setBook(null); setRelated([]);
    window.scrollTo(0, 0);
    api(`/books/${encodeURIComponent(id)}/detail`)
      .then((r) => n === reqId.current && setBook(r.data))
      .catch((e) => n === reqId.current && setError(e.message))
      .finally(() => n === reqId.current && setLoading(false));
    // Mục gợi ý chỉ là phụ: lỗi thì bỏ qua, không chặn trang chính
    api(`/books/${encodeURIComponent(id)}/related?limit=4`)
      .then((r) => n === reqId.current && setRelated(r.data))
      .catch(() => {});
  }, [id]);

  if (!id) return <Shell><Notice icon="menu_book" text="Chưa chọn sách nào. Hãy tra cứu và bấm “Chi tiết” ở một đầu sách." /></Shell>;
  if (loading) {
    return (
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl animate-pulse">
          <div className="lg:col-span-4 h-[480px] bg-surface-container rounded-md" />
          <div className="lg:col-span-8 h-[480px] bg-surface-container rounded-md" />
        </div>
      </Shell>
    );
  }
  if (error || !book) return <Shell><Notice icon="search_off" text={error || 'Không tìm thấy đầu sách.'} /></Shell>;

  return (
    <Shell>
      <Section1 book={book} />
      <DaiSoTuyenTinh book={book} />
      <TaiLieuCungChuyen books={related} category={book.category} />
    </Shell>
  );
}
