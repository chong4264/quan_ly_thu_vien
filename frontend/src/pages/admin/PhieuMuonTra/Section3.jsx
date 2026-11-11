import { useState } from 'react';

export default function Section3({ filters, onChange, onApply, onReset, counts = {} }) {
  const [draft, setDraft] = useState(filters);
  const set = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  const apply = () => { onChange(draft); onApply(draft); };
  const reset = () => {
    const clean = { q: '', status: '', className: '', from: '', to: '' };
    setDraft(clean); onChange(clean); onReset(clean);
  };
  const quick = (status) => { const next = { ...draft, status }; setDraft(next); onChange(next); onApply(next); };
  const chip = (label, status, dot) => <button key={label} onClick={() => quick(status)} className={`px-2.5 py-1 rounded-sm font-label-sm text-label-sm flex items-center gap-1 ${draft.status === status ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}{label} ({Number(counts[status || 'all'] || 0).toLocaleString('vi-VN')})
  </button>;
  return <div className="px-margin-desktop mb-space-md"><div className="max-w-[1600px] mx-auto bg-surface-container-lowest p-space-md rounded-md shadow-sm">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm items-center">
      <div className="lg:col-span-4 relative"><span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span><input value={draft.q} onChange={e => set('q', e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} className="w-full h-9 pl-9 pr-3 bg-surface-container-low text-on-surface font-body-sm rounded-sm" placeholder="Mã phiếu, tên bạn đọc, mã thẻ, tên sách..." /></div>
      <select value={draft.status} onChange={e => set('status', e.target.value)} className="lg:col-span-2 w-full h-9 px-2.5 bg-surface-container-low text-on-surface rounded-sm"><option value="">Tất cả trạng thái</option><option value="borrowing">Đang mượn</option><option value="returned">Đã hoàn trả</option><option value="overdue">Quá hạn</option><option value="renewed2plus">Gia hạn từ 2 lần</option><option value="renewed">Đã gia hạn</option></select>
      <input value={draft.className} onChange={e => set('className', e.target.value)} className="lg:col-span-2 w-full h-9 px-2.5 bg-surface-container-low text-on-surface rounded-sm" placeholder="Lớp / Đơn vị" aria-label="Lọc theo lớp hoặc đơn vị" />
      <div className="lg:col-span-3 flex items-center gap-1.5"><input value={draft.from} onChange={e => set('from', e.target.value)} className="w-1/2 h-9 px-2 bg-surface-container-low rounded-sm" title="Từ ngày" type="date"/><span>→</span><input value={draft.to} onChange={e => set('to', e.target.value)} className="w-1/2 h-9 px-2 bg-surface-container-low rounded-sm" title="Đến ngày" type="date"/></div>
      <div className="lg:col-span-1 flex gap-1"><button className="flex-1 h-9 bg-primary text-on-primary rounded-sm" title="Áp dụng lọc" onClick={apply}><span className="material-symbols-outlined text-[18px]">filter_alt</span></button><button className="h-9 w-9 bg-surface-container rounded-sm" title="Đặt lại" onClick={reset}><span className="material-symbols-outlined text-[18px]">restart_alt</span></button></div>
    </div>
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-outline-variant/40 text-on-surface-variant font-label-sm"><strong className="uppercase tracking-wider">Phân loại nhanh:</strong>{chip('Tất cả','')}{chip('Đang mượn','borrowing','bg-secondary')}{chip('Quá hạn','overdue','bg-error')}{chip('Gia hạn lần 2+','renewed2plus','bg-tertiary')}{chip('Đã hoàn tất','returned','bg-outline')}</div>
  </div></div>;
}
