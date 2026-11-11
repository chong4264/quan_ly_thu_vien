import { useRef, useState } from 'react';
import { api, qs } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { addDaysFromToday, fmtDate } from '../../lib/format';

export default function BorrowCart({ patron, onDone }) {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const submission = useRef(false);
  const scanPending = useRef(false);

  const add = async () => {
    const v = code.trim();
    if (!v || submission.current || scanPending.current) return;
    if (!patron) return toast('Hãy xác thực độc giả trước');
    if (!patron.canBorrow) return toast(patron.blockReason);
    scanPending.current = true;
    try {
      const c = await api(`/copies/lookup?${qs({ barcode: v })}`);
      if (!c.canBorrow) return toast(`${c.accessionNo}: ${c.blockReason}`);
      if (cart.some((x) => x.accessionNo === c.accessionNo)) return toast('Sách này đã có trong giỏ');
      if (cart.length >= patron.remaining) return toast(`Chỉ được mượn thêm ${patron.remaining} cuốn`);
      setCart((current) => current.some((copy) => copy.documentId === c.documentId) ? current : [...current, c]);
      setCode('');
      setReceipt(null);
    } catch (e) { toast(e.message); } finally { scanPending.current = false; }
  };

  const confirm = async () => {
    if (submission.current || scanPending.current || !patron || !cart.length) return;
    submission.current = true;
    setBusy(true);
    try {
      const r = await api('/loans/checkout', {
        method: 'POST',
        body: { patronBarcode: patron.cardBarcode || patron.studentCode, copyBarcodes: cart.map((c) => c.barcode), sendEmailReceipt: email },
      });
      setReceipt(r);
      setCart([]);
      toast(`Đã tạo phiếu ${r.loan.code}`);
      onDone();
    } catch (e) { toast(e.message); } finally { submission.current = false; setBusy(false); }
  };

  const due = patron?.patronType ? fmtDate(addDaysFromToday(patron.patronType.loanDays)) : '—';

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-[20px]">library_add</span>
        <span className="font-headline-sm text-headline-sm text-on-surface">2. Giỏ mượn sách</span>
      </div>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">qr_code_scanner</span>
        <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} disabled={!patron || busy}
          placeholder={patron ? 'Quét mã vạch sách, rồi nhấn Enter...' : 'Quét thẻ độc giả trước'}
          className="w-full h-9 pl-9 pr-3 bg-surface-container-low font-code-md text-code-md rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-container disabled:opacity-50" />
      </div>

      <div className="flex flex-col gap-1.5">
        {cart.length === 0 && <p className="text-center text-on-surface-variant font-body-sm text-body-sm py-6">Giỏ đang trống</p>}
        {cart.map((c, i) => (
          <div key={c.accessionNo} className="flex items-center justify-between gap-2 p-2 bg-surface-container-low rounded-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-code-md text-code-md text-outline">#{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <div className="truncate font-medium font-body-md text-body-md">{c.book?.title}</div>
                <div className="font-label-sm text-label-sm text-outline">{c.accessionNo} • {c.shelf?.code} • Hạn trả {due}</div>
              </div>
            </div>
            <button disabled={busy} onClick={() => setCart((current) => current.filter((x) => x.documentId !== c.documentId))} className="text-outline hover:text-error disabled:opacity-50" aria-label={`Bỏ ${c.book?.title} khỏi giỏ`}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        ))}
      </div>

      {receipt && (
        <div className="bg-secondary-container text-on-secondary-container rounded-lg p-space-md font-body-sm text-body-sm">
          Đã tạo phiếu <strong>{receipt.loan.code}</strong> cho {receipt.patron.fullName}: {receipt.items.map((i) => i.title).join(', ')}.
        </div>
      )}

      <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
        <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /> Gửi biên nhận qua email
      </label>
      <button onClick={confirm} disabled={busy || !cart.length || !patron}
        className="h-10 bg-primary text-on-primary rounded-lg font-label-lg disabled:opacity-50">
        {busy ? 'Đang xử lý...' : `Xác nhận mượn ${cart.length} cuốn`}
      </button>
    </div>
  );
}
