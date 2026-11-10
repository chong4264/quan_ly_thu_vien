import { useCallback, useEffect, useState } from 'react';
import { api, qs } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { CONDITION, fmtDate, money } from '../../lib/format';

export default function ReturnList({ patron, onDone }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [opts, setOpts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [result, setResult] = useState(null);
  const [quick, setQuick] = useState('');

  const code = patron?.cardBarcode || patron?.studentCode;
  const load = useCallback(async () => {
    if (!code) return setItems([]);
    try { setItems((await api(`/loan-items/by-patron?${qs({ barcode: code })}`)).data); } catch (e) { toast(e.message); }
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setResult(null); }, [load]);

  const set = (id, patch) => setOpts((o) => ({ ...o, [id]: { condition: 'normal', collected: false, ...o[id], ...patch } }));
  const get = (id) => ({ condition: 'normal', collected: false, ...opts[id] });

  const doReturn = async (body, id) => {
    setBusyId(id);
    try {
      const r = await api('/loans/return', { method: 'POST', body });
      setResult(r);
      toast(`Đã trả sách, phiếu ${r.returnReceipt.code}`);
      await load();
      onDone();
    } catch (e) { toast(e.message); } finally { setBusyId(null); }
  };

  const renew = async (it) => {
    setBusyId(it.loanItemId);
    try {
      const r = await api(`/loan-items/${it.loanItemId}/renew`, { method: 'POST' });
      toast(`Gia hạn thành công, hạn mới ${fmtDate(r.newDueDate)}`);
      await load();
      onDone();
    } catch (e) { toast(e.message); } finally { setBusyId(null); }
  };

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-[20px]">assignment_return</span>
        <span className="font-headline-sm text-headline-sm text-on-surface">2. Sách đang mượn cần xử lý</span>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">qr_code_scanner</span>
        <input value={quick} onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && quick.trim()) { doReturn({ copyBarcode: quick.trim(), returnCondition: 'normal' }, 'quick'); setQuick(''); } }}
          placeholder="Trả nhanh: quét mã vạch sách (tình trạng nguyên vẹn), rồi nhấn Enter..."
          className="w-full h-9 pl-9 pr-3 bg-surface-container-low font-code-md text-code-md rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-container" />
      </div>

      {result && (
        <div className="bg-secondary-container text-on-secondary-container rounded-lg p-space-md font-body-sm text-body-sm">
          Phiếu <strong>{result.returnReceipt.code}</strong>: trễ {result.lateDays} ngày, phạt trễ {money(result.fine)}, bồi thường {money(result.compensation)}.
          {' '}<strong>Cần thu: {money(result.totalToCollect)}</strong>{result.fineCollected ? ' (đã thu)' : ''}
        </div>
      )}

      {!patron && <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-6">Quét thẻ độc giả để xem danh sách sách đang mượn.</p>}
      {patron && !items.length && <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-6">Độc giả này không có sách đang mượn.</p>}

      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const o = get(it.loanItemId);
          const late = it.lateDays > 0;
          return (
            <div key={it.loanItemId} className={`p-space-md rounded-lg flex flex-col gap-2 ${late ? 'bg-error-container/40' : 'bg-surface-container-low'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium font-body-md text-body-md truncate">{it.title}</div>
                  <div className="font-label-sm text-label-sm text-outline">{it.accessionNo} • Mượn {fmtDate(it.loanedAt)} • Hạn {fmtDate(it.dueDate)} • Đã gia hạn {it.renewCount}/{it.maxRenewals}</div>
                </div>
                {late && <span className="px-2 py-0.5 rounded-sm bg-error text-on-error font-label-sm text-label-sm font-semibold whitespace-nowrap">Trễ {it.lateDays} ngày • {money(it.fine)}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={o.condition} onChange={(e) => set(it.loanItemId, { condition: e.target.value })}
                  className="h-8 px-2 bg-surface-container-lowest rounded-sm font-label-md text-label-md">
                  {Object.entries(CONDITION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="flex items-center gap-1 font-label-md text-label-md">
                  <input type="checkbox" checked={o.collected} onChange={(e) => set(it.loanItemId, { collected: e.target.checked })} /> Đã thu phạt
                </label>
                <button disabled={busyId === it.loanItemId}
                  onClick={() => doReturn({ loanItemId: it.loanItemId, returnCondition: o.condition, fineCollected: o.collected }, it.loanItemId)}
                  className="h-8 px-3 bg-primary text-on-primary rounded-sm font-label-md text-label-md disabled:opacity-50">Xác nhận trả</button>
                <button disabled={!it.canRenew || busyId === it.loanItemId} onClick={() => renew(it)}
                  className="h-8 px-3 bg-surface-container hover:bg-surface-container-high rounded-sm font-label-md text-label-md disabled:opacity-40">Gia hạn</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
