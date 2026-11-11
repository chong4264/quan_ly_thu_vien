import { useCallback, useEffect, useState } from 'react';
import { api, qs } from '../../../lib/api';
import { fmtDate, money } from '../../../lib/format';
import { useToast } from '../../../context/ToastContext';

const STATUS = {
  borrowing: ['Đang mượn', 'bg-secondary-container text-on-secondary-container'],
  overdue: ['Quá hạn', 'bg-error-container text-on-error-container'],
  returned: ['Đã hoàn trả', 'bg-surface-container-high text-on-surface-variant'],
};

export default function Section5({ filters, selected, setSelected, onData }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const result = await api(`/loans/admin-list?${qs({ ...filters, page: targetPage, pageSize: 10 })}`);
      const data = result.data || [];
      setRows(data); setTotal(result.meta?.pagination?.total || 0);
      setPageCount(result.meta?.pagination?.pageCount || 1); setSelected([]);
      onData?.(result.meta?.counts || {});
    } catch (error) { toast(error.message || 'Không tải được danh sách phiếu mượn'); }
    finally { setLoading(false); }
  }, [filters, page, toast, setSelected, onData]);

  useEffect(() => { setPage(1); }, [filters]);
  useEffect(() => { load(page); }, [load, page]);
  useEffect(() => { const refresh = () => load(page); window.addEventListener('loan-list:refresh', refresh); return () => window.removeEventListener('loan-list:refresh', refresh); }, [load, page]);

  const toggle = (id) => setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const visibleIds = rows.map(r => r.documentId).filter(Boolean);
  const allVisible = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));
  const toggleAll = () => setSelected(old => allVisible ? old.filter(id => !visibleIds.includes(id)) : [...new Set([...old, ...visibleIds])]);

  const printLoan = async (row) => {
    try {
      const data = await api(`/loans/${row.documentId}/print`);
      const safe = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const content = `<h2>PHIẾU MƯỢN ${safe(data.code)}</h2><p>Độc giả: ${safe(data.patron?.fullName)} (${safe(data.patron?.studentCode)})</p><p>Ngày mượn: ${safe(new Date(data.loanedAt).toLocaleString('vi-VN'))}</p><table border="1" cellspacing="0" cellpadding="6"><tr><th>Sách</th><th>Mã ĐKCB</th><th>Hạn trả</th><th>Ngày trả</th></tr>${(data.items || []).map(i => `<tr><td>${safe(i.bookTitle)}</td><td>${safe(i.accessionNo)}</td><td>${safe(fmtDate(i.dueDate))}</td><td>${safe(fmtDate(i.returnedAt))}</td></tr>`).join('')}</table><p>Thủ thư: ${safe(data.librarian || '')}</p>`;
      const w = window.open('', '_blank'); if (!w) return toast('Trình duyệt đang chặn cửa sổ in');
      w.document.write(`<html><head><title>${safe(data.code)}</title><meta charset="utf-8"><style>body{font:14px Arial;padding:24px}table{border-collapse:collapse;width:100%}th,td{padding:8px;text-align:left}</style></head><body>${content}</body></html>`); w.document.close(); w.focus(); w.print();
    } catch (e) { toast(e.message || 'Không thể tải phiếu in'); }
  };

  return <div className="px-margin-desktop mb-space-lg"><div className="max-w-[1600px] mx-auto bg-surface-container-lowest shadow-sm rounded-xl overflow-hidden">
    <div className="p-space-md flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><div><h2 className="font-headline-sm font-semibold">Danh sách phiếu mượn trả</h2><p className="text-on-surface-variant font-body-sm">Tìm thấy {total.toLocaleString('vi-VN')} phiếu</p></div><button onClick={() => load(page)} disabled={loading} className="h-9 px-3 bg-surface-container rounded-sm text-label-md disabled:opacity-50"><span className="material-symbols-outlined align-middle text-[17px] mr-1">refresh</span>Làm mới</button></div>
    <div className="overflow-x-auto"><table className="w-full border-collapse text-left min-w-[1120px]"><thead><tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase h-11"><th className="px-3"><input aria-label="Chọn tất cả phiếu trên trang" type="checkbox" checked={allVisible} onChange={toggleAll}/></th><th className="px-3">Mã phiếu</th><th className="px-3">Độc giả</th><th className="px-3">Tài liệu mượn & ĐKCB</th><th className="px-3">Ngày mượn / Hạn trả</th><th className="px-3">Ngày trả</th><th className="px-3">Thủ thư</th><th className="px-3 text-right">Tiền phạt</th><th className="px-3 text-center">Trạng thái</th><th className="px-3 text-center">Thao tác</th></tr></thead>
      <tbody className="font-body-sm">{loading ? <tr><td colSpan="10" className="p-8 text-center">Đang tải dữ liệu...</td></tr> : rows.map(row => { const overdue = row.items?.some(i => !i.returnedAt && i.dueDate && i.dueDate < new Date().toISOString().slice(0,10)); const state = overdue ? 'overdue' : row.status; const [label, cls] = STATUS[state] || STATUS.borrowing; return <tr key={row.documentId || row.code} className="border-t border-outline-variant/40 hover:bg-surface-container-low/50">
        <td className="px-3 py-3"><input aria-label={`Chọn ${row.code}`} type="checkbox" checked={selected.includes(row.documentId)} onChange={() => toggle(row.documentId)}/></td><td className="px-3 py-3"><strong className="text-primary font-code-md">{row.code}</strong></td><td className="px-3 py-3"><div className="font-semibold">{row.patron?.fullName || '—'}</div><div className="text-on-surface-variant">{row.patron?.studentCode} • {row.patron?.className}</div></td>
        <td className="px-3 py-3">{row.items?.map(i => <div key={i.loanItemId} className="mb-1"><div>{i.bookTitle || 'Không rõ tên sách'}</div><span className="text-on-surface-variant font-code-md">{i.accessionNo}</span>{i.renewCount > 0 && <span className="ml-2 text-secondary">Gia hạn {i.renewCount} lần</span>}</div>)}</td><td className="px-3 py-3">{fmtDate(row.loanedAt)}<div className="text-on-surface-variant">{row.items?.map(i => fmtDate(i.dueDate)).join(', ')}</div></td><td className="px-3 py-3">{row.items?.filter(i => i.returnedAt).map(i => fmtDate(i.returnedAt)).join(', ') || 'Chưa trả'}</td><td className="px-3 py-3">{row.librarian || '—'}</td><td className="px-3 py-3 text-right">{money(row.totalFine || 0)}</td><td className="px-3 py-3 text-center"><span className={`inline-flex px-2 py-1 rounded-sm font-label-sm ${cls}`}>{label}</span></td><td className="px-3 py-3 text-center"><button title="Xem chi tiết" onClick={() => setDetail(row)} className="p-2 hover:text-primary"><span className="material-symbols-outlined">visibility</span></button><button title="In phiếu" onClick={() => printLoan(row)} className="p-2 hover:text-primary"><span className="material-symbols-outlined">print</span></button></td></tr>; })}
      {!loading && !rows.length && <tr><td colSpan="10" className="p-8 text-center text-on-surface-variant">Không có phiếu mượn phù hợp.</td></tr>}</tbody></table></div>
    <div className="p-space-md flex items-center justify-between border-t border-outline-variant/40"><span className="font-body-sm text-on-surface-variant">Trang {page}/{pageCount} • {total} phiếu</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="h-8 px-3 bg-surface-container rounded-sm disabled:opacity-40">Trước</button><button disabled={page >= pageCount || loading} onClick={() => setPage(p => p + 1)} className="h-8 px-3 bg-surface-container rounded-sm disabled:opacity-40">Sau</button></div></div>
  </div>
  {detail && <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}><div role="dialog" aria-modal="true" className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto"><div className="p-5 border-b border-outline-variant/40 flex justify-between items-center"><div><h3 className="font-headline-sm font-semibold">Chi tiết phiếu {detail.code}</h3><p className="text-sm text-on-surface-variant">{detail.patron?.fullName} • {detail.patron?.studentCode}</p></div><button onClick={() => setDetail(null)} className="p-2"><span className="material-symbols-outlined">close</span></button></div><div className="p-5"><p className="mb-3">Ngày mượn: <strong>{fmtDate(detail.loanedAt)}</strong></p><div className="space-y-3">{detail.items?.map(i => <div key={i.loanItemId} className="p-3 rounded-lg bg-surface-container-low"><div className="font-semibold">{i.bookTitle}</div><div className="text-sm text-on-surface-variant">Mã ĐKCB: {i.accessionNo} • Hạn trả: {fmtDate(i.dueDate)}</div><div className="text-sm mt-1">{i.returnedAt ? `Đã trả ${fmtDate(i.returnedAt)}` : 'Chưa trả'} • Gia hạn: {i.renewCount} lần • Phạt: {money(i.fine)}</div></div>)}</div><p className="mt-4">Thủ thư: {detail.librarian || '—'} • Tổng phạt: <strong>{money(detail.totalFine || 0)}</strong></p></div><div className="p-4 border-t border-outline-variant/40 text-right"><button onClick={() => setDetail(null)} className="px-4 py-2 bg-primary text-on-primary rounded-sm">Đóng</button></div></div></div>}
  </div>;
}
