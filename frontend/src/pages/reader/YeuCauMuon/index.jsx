import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { REQUEST_STATUS, cancelBorrowRequest, fetchMyRequests, requestDate } from '../../../lib/loan-requests';

const button = 'px-4 py-2 border border-outline-variant rounded-sm hover:bg-surface-container disabled:opacity-50';

function RequestList() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const lock = useRef(false);
  const queryKey = `${status}|${page}|${refresh}`;
  const loading = result?.key !== queryKey;
  useEffect(() => {
    let active = true;
    fetchMyRequests({ status, page, pageSize: 10 }).then((data) => {
      if (!active) return;
      if (page > Math.max(1, data.meta.pagination.pageCount)) setPage(Math.max(1, data.meta.pagination.pageCount));
      setResult({ ...data, key: queryKey }); setError('');
    }).catch((e) => { if (active) { setError(e.message); setResult({ data: [], key: queryKey }); } });
    return () => { active = false; };
  }, [status, page, refresh, queryKey]);

  async function cancel(request) {
    if (lock.current || !window.confirm(`Hủy yêu cầu mượn “${request.book?.title || 'sách'}”?`)) return;
    lock.current = true; setBusy(request.documentId);
    try { await cancelBorrowRequest(request.documentId); setRefresh((v) => v + 1); }
    catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(''); }
  }
  return <div className="space-y-5">
    <header className="flex flex-wrap justify-between gap-4 items-center">
      <div><h1 className="text-2xl font-bold">Yêu cầu mượn online</h1><p className="mt-2 text-on-surface-variant">Đăng ký ở trang chi tiết sách, sau đó mang thẻ đến quầy để nhận sách.</p></div>
      <Link to="/tra-cuu-sach" className={`${button} text-primary`}>Tra cứu sách</Link>
    </header>
    <p className="p-4 rounded-sm bg-secondary-container text-on-secondary-container text-sm">Yêu cầu không giữ chỗ bản sao và chưa phải phiếu mượn. Thủ thư kiểm tra thẻ, hạn mức và tình trạng sách khi giao. Bạn có thể hủy yêu cầu đang chờ.</p>
    <div className="bg-surface-container-lowest p-5 rounded-sm shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium">Trạng thái <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} disabled={!!busy} className="ml-2 border border-outline-variant rounded-sm p-2 bg-surface-container-lowest"><option value="">Tất cả</option>{Object.entries(REQUEST_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className={button} disabled={!!busy || loading} onClick={() => setRefresh((v) => v + 1)}>Làm mới</button>
      </div>
      {error && <p role="alert" className="text-error">{error} <button className="underline" onClick={() => setRefresh((v) => v + 1)}>Thử lại</button></p>}
      {loading ? <p role="status">Đang tải yêu cầu…</p> : result?.linked === false ? <p>Tài khoản chưa liên kết hồ sơ độc giả. Vui lòng liên hệ thủ thư cấp thẻ.</p> : <>
        {!result?.data?.length && !error && <p className="py-8 text-center text-on-surface-variant">Chưa có yêu cầu phù hợp.</p>}
        {result?.data?.map((r) => <article key={r.documentId} className="border border-outline-variant rounded-sm p-4 space-y-2">
          <div className="flex flex-wrap justify-between gap-2"><Link to={`/chi-tiet-sach?id=${encodeURIComponent(r.book?.documentId || '')}`} className="text-lg font-semibold text-primary hover:underline">{r.book?.title || 'Đầu sách đã được gỡ'}</Link><span className={`px-2 py-1 text-sm rounded-sm ${r.status === 'pending' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container'}`}>{REQUEST_STATUS[r.status] || r.status}</span></div>
          <p className="text-sm text-on-surface-variant">{r.book?.author} · Gửi lúc {requestDate(r.createdAt)}</p>
          {r.note && <p className="text-sm whitespace-pre-wrap">Ghi chú của bạn: {r.note}</p>}
          {r.responseNote && <p className="text-sm whitespace-pre-wrap">Phản hồi thủ thư: {r.responseNote}</p>}
          {r.processedAt && <p className="text-sm text-on-surface-variant">Xử lý lúc {requestDate(r.processedAt)}</p>}
          {r.loan && <p className="text-secondary text-sm">Phiếu mượn {r.loan.code}. <Link to="/sach-dang-muon" className="underline">Xem sách đang mượn</Link></p>}
          {r.status === 'pending' && <button disabled={!!busy} className={`${button} text-error`} onClick={() => cancel(r)}>{busy === r.documentId ? 'Đang hủy…' : 'Hủy yêu cầu'}</button>}
        </article>)}
      </>}
      <nav aria-label="Phân trang yêu cầu" className="flex items-center justify-between gap-3"><span className="text-sm">Trang {page} / {Math.max(1, result?.meta?.pagination?.pageCount || 1)} · {result?.meta?.pagination?.total || 0} yêu cầu</span><div className="flex gap-2"><button className={button} disabled={loading || !!busy || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button className={button} disabled={loading || !!busy || page >= (result?.meta?.pagination?.pageCount || 1)} onClick={() => setPage(page + 1)}>Sau</button></div></nav>
    </div>
  </div>;
}
export default function YeuCauMuonPage() {
  const { user } = useAuth();
  return <main className="pt-[108px] min-h-screen bg-surface text-on-surface"><div className="max-w-[1400px] mx-auto p-space-lg lg:p-space-xl"><RequestList key={user?.id} /></div></main>;
}
