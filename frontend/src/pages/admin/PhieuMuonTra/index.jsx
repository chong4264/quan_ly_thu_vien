import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, qs } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import QuanLyPhieuMuon from './QuanLyPhieuMuon';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import Section5 from './Section5';
import QuyCheMuonSach from './QuyCheMuonSach';

const DEFAULT_FILTERS = { q: '', status: '', className: '', from: '', to: '' };

export default function PhieuMuonTraPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => { api('/loans/status-counts').then(setCounts).catch(e => toast(e.message)); }, [toast]);

  const getSelectedLoans = useCallback(async () => {
    if (!selected.length) { toast('Vui lòng chọn ít nhất một phiếu'); return []; }
    const result = await api(`/loans/admin-list?${qs({ page: 1, pageSize: 100, ...filters, ids: selected.join(',') })}`);
    return (result.data || []).filter(row => selected.includes(row.documentId));
  }, [filters, selected, toast]);

  const remind = async () => {
    try {
      const loans = await getSelectedLoans(); if (!loans.length) return;
      const ids = loans.flatMap(r => (r.items || []).filter(i => !i.returnedAt).map(i => i.loanItemId));
      if (!ids.length) return toast('Các phiếu đã chọn không có sách đang mượn');
      const result = await api('/notifications/remind', { method: 'POST', body: { loanItemIds: ids } });
      toast(`Đã gửi ${result.sent?.length || 0} email; thất bại ${result.failed?.length || 0}`);
    } catch (e) { toast(e.message || 'Không gửi được email nhắc trả'); }
  };

  const renew = async () => {
    try {
      const loans = await getSelectedLoans(); if (!loans.length) return;
      const ids = loans.flatMap(r => (r.items || []).filter(i => !i.returnedAt).map(i => i.loanItemId));
      if (!ids.length) return toast('Không có lượt mượn đang hoạt động để gia hạn');
      if (!window.confirm(`Gia hạn theo thời hạn cấu hình cho ${ids.length} lượt mượn đã chọn?`)) return;
      const result = await api('/loan-items/bulk-renew', { method: 'POST', body: { ids } });
      toast(`Gia hạn thành công ${result.renewed?.length || 0}; thất bại ${result.failed?.length || 0}`);
      setSelected([]); window.dispatchEvent(new Event('loan-list:refresh'));
    } catch (e) { toast(e.message || 'Không gia hạn được'); }
  };

  const printSelected = async () => {
    try {
      const loans = await getSelectedLoans(); if (!loans.length) return;
      const w = window.open('', '_blank');
      if (!w) return toast('Trình duyệt đang chặn cửa sổ in. Hãy cho phép pop-up.');
      const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const docs = [];
      for (const loan of loans) {
        const data = await api(`/loans/${loan.documentId}/print`);
        docs.push(`<section><h2>PHIẾU MƯỢN ${esc(data.code)}</h2><p>Độc giả: ${esc(data.patron?.fullName)} (${esc(data.patron?.studentCode)})</p><p>Ngày mượn: ${esc(new Date(data.loanedAt).toLocaleString('vi-VN'))}</p><table><tr><th>Sách</th><th>Mã ĐKCB</th><th>Hạn trả</th></tr>${(data.items || []).map(i => `<tr><td>${esc(i.bookTitle)}</td><td>${esc(i.accessionNo)}</td><td>${esc(i.dueDate)}</td></tr>`).join('')}</table><p>Thủ thư: ${esc(data.librarian || '')}</p></section>`);
      }
      w.document.write(`<html><head><meta charset="utf-8"><title>In phiếu mượn</title><style>body{font:14px Arial;padding:24px}section{page-break-after:always}section:last-child{page-break-after:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #555;padding:8px;text-align:left}</style></head><body>${docs.join('')}</body></html>`);
      w.document.close(); w.focus(); w.print();
    } catch (e) { toast(e.message || 'Không in được phiếu'); }
  };

  const exportCsv = async () => {
    try {
      const first = await api(`/loans/admin-list?${qs({ ...filters, page: 1, pageSize: 100 })}`);
      const all = [...(first.data || [])];
      const pages = first.meta?.pagination?.pageCount || 1;
      for (let p = 2; p <= pages; p++) {
        const next = await api(`/loans/admin-list?${qs({ ...filters, page: p, pageSize: 100 })}`);
        all.push(...(next.data || []));
      }
      const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = [['Mã phiếu','Độc giả','Mã thẻ','Lớp','Ngày mượn','Sách','Mã ĐKCB','Hạn trả','Ngày trả','Số lần gia hạn','Tiền phạt','Trạng thái'].map(cell).join(',')];
      all.forEach(r => (r.items || []).forEach(i => lines.push([r.code,r.patron?.fullName,r.patron?.studentCode,r.patron?.className,r.loanedAt,i.bookTitle,i.accessionNo,i.dueDate,i.returnedAt,i.renewCount,i.fine,r.status].map(cell).join(','))));
      const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `bao-cao-muon-tra-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
      toast(`Đã xuất ${all.length} phiếu ra CSV`);
    } catch (e) { toast(e.message || 'Không xuất được báo cáo'); }
  };

  return <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full">
    <QuanLyPhieuMuon onExport={exportCsv} onPrint={printSelected} onCreate={() => navigate('/quay-muon-sach')} />
    <Section2 />
    <Section3 filters={filters} onChange={setFilters} onApply={() => setSelected([])} onReset={() => setSelected([])} counts={counts} />
    <Section4 selectedCount={selected.length} total={counts.all || 0} onRemind={remind} onRenew={renew} onPrint={printSelected} onClear={() => setSelected([])} />
    <Section5 filters={filters} selected={selected} setSelected={setSelected} />
    <QuyCheMuonSach />
  </div></main>;
}
