import { useEffect, useRef, useState } from 'react';
import { REQUEST_STATUS, fetchAdminRequests, fulfillBorrowRequest, rejectBorrowRequest, requestDate } from '../../../lib/loan-requests';
import { useToast } from '../../../context/ToastContext';

const button = 'px-4 py-2 rounded-sm border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed';
const input = 'p-2 border border-outline-variant rounded-sm bg-surface-container-lowest w-full';

function ProcessingForm({ request, busy, onProcess }) {
  const [barcode, setBarcode] = useState('');
  const [responseNote, setResponseNote] = useState('');
  return <form className="grid md:grid-cols-[1fr_1fr_auto] items-end gap-3 pt-3 border-t border-outline-variant" onSubmit={(e) => { e.preventDefault(); onProcess(request, 'fulfill', { copyBarcode: barcode.trim(), responseNote: responseNote.trim() }); }}>
    <label className="text-sm font-medium">Mã vạch / ĐKCB của cuốn giao<input required maxLength={150} value={barcode} onChange={(e) => setBarcode(e.target.value)} disabled={busy} className={`${input} mt-1`} placeholder="Quét mã bản sao đúng đầu sách" /></label>
    <label className="text-sm font-medium">Ghi chú / lý do từ chối<input maxLength={500} value={responseNote} onChange={(e) => setResponseNote(e.target.value)} disabled={busy} className={`${input} mt-1`} /></label>
    <div className="flex flex-wrap gap-2"><button disabled={busy} type="submit" className={`${button} bg-primary text-on-primary hover:bg-primary-container`}>Giao sách & lập phiếu</button><button disabled={busy || !responseNote.trim()} type="button" className={`${button} text-error`} onClick={() => onProcess(request, 'reject', { responseNote: responseNote.trim() })}>Từ chối</button></div>
  </form>;
}

export default function QuanLyYeuCauMuonPage() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const lock = useRef(false);
  const key = JSON.stringify([status, q, page, refresh]);
  const loading = result?.key !== key;
  useEffect(() => {
    let active = true;
    fetchAdminRequests({ status, q, page, pageSize: 10 }).then((data) => {
      if (!active) return;
      if (page > Math.max(1, data.meta.pagination.pageCount)) setPage(Math.max(1, data.meta.pagination.pageCount));
      setResult({ ...data, key }); setError('');
    }).catch((e) => { if (active) { setError(e.message); setResult({ data: [], key }); } });
    return () => { active = false; };
  }, [status, q, page, refresh, key]);

  async function process(request, action, body) {
    if (lock.current) return;
    const message = action === 'fulfill' ? `Xác nhận đang giao “${request.book?.title}” cho ${request.patron?.fullName}? Thao tác này lập phiếu mượn và tính hạn trả từ hôm nay.` : `Từ chối yêu cầu của ${request.patron?.fullName} với lý do đã nhập?`;
    if (!window.confirm(message)) return;
    lock.current = true; setBusy(request.documentId); setError('');
    try {
      const data = action === 'fulfill' ? await fulfillBorrowRequest(request.documentId, body) : await rejectBorrowRequest(request.documentId, body.responseNote);
      toast(action === 'fulfill' ? `Đã giao sách. Phiếu ${data.receipt.loan.code}` : 'Đã từ chối yêu cầu');
      setRefresh((v) => v + 1);
    } catch (e) { setError(e.message); toast(e.message); }
    finally { lock.current = false; setBusy(''); }
  }
  return <main className="pt-16 min-h-screen bg-surface text-on-surface"><div className="max-w-[1600px] mx-auto p-space-lg space-y-5">
    <header><h1 className="text-2xl font-bold">Quản lý yêu cầu mượn online</h1><p className="mt-2 text-on-surface-variant">Kiểm tra thẻ và giao bản sao đúng đầu sách khi độc giả đến quầy.</p></header>
    <p className="p-4 bg-secondary-container text-on-secondary-container rounded-sm text-sm">Yêu cầu chưa giữ chỗ sách. Chỉ bấm “Giao sách & lập phiếu” khi đã giao sách cho độc giả. Hệ thống kiểm tra lại hạn mức, thẻ, sách quá hạn và bản sao trước khi lập phiếu.</p>
    <section className="bg-surface-container-lowest p-5 rounded-sm shadow-sm space-y-4">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setQ(new FormData(e.currentTarget).get('q').trim()); setPage(1); setRefresh((v) => v + 1); }}>
        <label className="flex-1 min-w-60 text-sm font-medium">Tìm kiếm<input name="q" type="search" className={`${input} mt-1`} placeholder="Tên sách, tên độc giả, mã sinh viên" disabled={!!busy} /></label>
        <label className="text-sm font-medium">Trạng thái<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} disabled={!!busy} className={`${input} mt-1`}><option value="">Tất cả</option>{Object.entries(REQUEST_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className={button} disabled={!!busy}>Tìm kiếm</button><button type="button" className={button} disabled={!!busy || loading} onClick={() => setRefresh((v) => v + 1)}>Làm mới</button>
      </form>
      {error && <p role="alert" className="text-error">{error} <button onClick={() => setRefresh((v) => v + 1)} className="underline">Tải lại</button></p>}
      {loading ? <p role="status">Đang tải yêu cầu…</p> : <>
        {!result?.data?.length && !error && <p className="py-8 text-center text-on-surface-variant">Chưa có yêu cầu phù hợp.</p>}
        {result?.data?.map((r) => <article key={r.documentId} className="p-4 border border-outline-variant rounded-sm space-y-3">
          <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold text-lg">{r.book?.title || 'Đầu sách đã gỡ'}</h2><p className="text-sm text-on-surface-variant">{r.book?.author} · ISBN {r.book?.isbn || '—'}</p></div><span className="text-sm bg-surface-container rounded-sm px-3 py-1 h-fit">{REQUEST_STATUS[r.status] || r.status}</span></div>
          <p className="text-sm"><strong>{r.patron?.fullName || 'Hồ sơ đã gỡ'}</strong> · Mã: {r.patron?.studentCode || '—'} · Thẻ: {r.patron?.cardBarcode || '—'} · SĐT: {r.patron?.phone || '—'}</p>
          <p className="text-sm text-on-surface-variant">Gửi lúc {requestDate(r.createdAt)}{r.processedAt && ` · Xử lý ${requestDate(r.processedAt)}`}{r.processedBy && ` · ${r.processedBy}`}</p>
          {r.note && <p className="text-sm whitespace-pre-wrap">Độc giả ghi chú: {r.note}</p>}{r.responseNote && <p className="text-sm whitespace-pre-wrap">Phản hồi: {r.responseNote}</p>}{r.loan && <p className="text-sm text-secondary">Đã lập phiếu mượn {r.loan.code}</p>}
          {r.status === 'pending' && <ProcessingForm request={r} busy={!!busy} onProcess={process} />}
        </article>)}
      </>}
      <nav aria-label="Phân trang yêu cầu" className="flex justify-between items-center gap-3"><span className="text-sm">Trang {page} / {Math.max(1, result?.meta?.pagination?.pageCount || 1)} · {result?.meta?.pagination?.total || 0} yêu cầu</span><div className="flex gap-2"><button className={button} disabled={loading || !!busy || page <= 1} onClick={() => setPage(page - 1)}>Trước</button><button className={button} disabled={loading || !!busy || page >= (result?.meta?.pagination?.pageCount || 1)} onClick={() => setPage(page + 1)}>Sau</button></div></nav>
    </section>
  </div></main>;
}
