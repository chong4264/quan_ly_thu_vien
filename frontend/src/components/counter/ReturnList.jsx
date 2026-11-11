import { useCallback, useEffect, useState } from 'react';
import { api, qs } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { fmtDate, money } from '../../lib/format';
import ReturnItemCard from './ReturnItemCard';

export default function ReturnList({ patron, onDone }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [finePerDay, setFinePerDay] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [result, setResult] = useState(null);
  const [scan, setScan] = useState('');
  const [highlight, setHighlight] = useState(null);

  const code = patron?.cardBarcode || patron?.studentCode;
  const load = useCallback(async () => {
    if (!code) return setItems([]);
    try {
      const r = await api(`/loan-items/by-patron?${qs({ barcode: code })}`);
      setItems(r.data);
      setFinePerDay(r.finePerDay ?? 0);
    } catch (e) { toast(e.message); }
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setResult(null); setHighlight(null); }, [load]);

  const doReturn = async (body) => {
    setBusyId(body.loanItemId);
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

  // Quét mã sách: chọn đúng thẻ sách trong danh sách để thủ thư kiểm tra tình trạng và tiền phạt trước khi trả
  const findByScan = () => {
    const v = scan.trim();
    if (!v) return;
    if (!patron) return toast('Hãy quét thẻ độc giả trước');
    const it = items.find((i) => i.barcode === v || i.accessionNo === v);
    if (!it) return toast('Sách này không nằm trong danh sách đang mượn của độc giả');
    setHighlight(it.loanItemId);
    setScan('');
  };

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-[20px]">assignment_return</span>
        <span className="font-headline-sm text-headline-sm text-on-surface">2. Sách đang mượn cần xử lý</span>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">qr_code_scanner</span>
        <input value={scan} onChange={(e) => setScan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && findByScan()} disabled={!patron}
          placeholder={patron ? 'Quét mã vạch sách để chọn đúng cuốn, rồi nhấn Enter...' : 'Quét thẻ độc giả trước'}
          className="w-full h-9 pl-9 pr-3 bg-surface-container-low font-code-md text-code-md rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-container disabled:opacity-50" />
      </div>

      {result && (
        <div className="bg-secondary-container text-on-secondary-container rounded-lg p-space-md font-body-sm text-body-sm flex flex-col gap-0.5">
          <div>Đã tạo phiếu trả <strong>{result.returnReceipt.code}</strong></div>
          <div>Phạt trả muộn ({result.lateDays} ngày): <strong>{money(result.fine)}</strong> • Bồi thường hư hỏng: <strong>{money(result.compensation)}</strong></div>
          <div>Tổng cần thu: <strong>{money(result.totalToCollect)}</strong>{result.totalToCollect > 0 && (result.fineCollected ? ' (đã thu)' : ' (chưa thu)')}</div>
        </div>
      )}

      {!patron && <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-6">Quét thẻ độc giả để xem danh sách sách đang mượn.</p>}
      {patron && !items.length && <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-6">Độc giả này không có sách đang mượn.</p>}

      <div className="flex flex-col gap-space-md">
        {items.map((it) => (
          <ReturnItemCard key={it.loanItemId} it={it} finePerDay={finePerDay} highlighted={highlight === it.loanItemId}
            busy={busyId === it.loanItemId} onReturn={doReturn} onRenew={renew} />
        ))}
      </div>
    </div>
  );
}
