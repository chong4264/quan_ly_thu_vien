import { useEffect, useState } from 'react';
import { api, qs } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { money } from '../../lib/format';

/** Ô quét thẻ / tìm họ tên + thẻ thông tin độc giả. Dùng chung cho quầy mượn và quầy trả. */
export default function PatronLookup({ patron, onChange, refreshKey = 0 }) {
  const toast = useToast();
  const [input, setInput] = useState('');
  const [choices, setChoices] = useState([]);
  const [busy, setBusy] = useState(false);

  const find = async (params) => (await api(`/patrons/lookup?${qs(params)}`)).data;

  const scan = async () => {
    const v = input.trim();
    if (!v) return;
    setBusy(true);
    try {
      let list;
      try { list = await find({ barcode: v }); } catch { list = await find({ q: v }); }
      pick(list);
    } catch (e) { toast(e.message); } finally { setBusy(false); }
  };
  const searchByName = async () => {
    const v = input.trim();
    if (!v) return toast('Nhập họ tên hoặc mã sinh viên');
    setBusy(true);
    try { pick(await find({ q: v })); } catch (e) { toast(e.message); } finally { setBusy(false); }
  };
  const pick = (list) => {
    if (list.length === 1) { onChange(list[0]); setChoices([]); setInput(''); } else setChoices(list);
  };

  // Tải lại số liệu sau khi mượn / trả xong
  useEffect(() => {
    if (!refreshKey || !patron) return;
    find({ barcode: patron.cardBarcode || patron.studentCode }).then((l) => onChange(l[0])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const max = patron?.patronType?.maxBooks ?? 0;
  const pct = max ? Math.min(100, (patron.borrowingCount / max) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-[20px]">badge</span>
        <span className="font-headline-sm text-headline-sm text-on-surface">1. Xác thực Độc giả</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">barcode_scanner</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && scan()}
            placeholder="Quét mã thẻ hoặc nhập mã sinh viên, rồi nhấn Enter..." autoFocus
            className="w-full h-9 pl-9 pr-3 bg-surface-container-low font-code-md text-code-md rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-container" />
        </div>
        <button onClick={searchByName} disabled={busy}
          className="h-9 px-3 bg-surface-container hover:bg-surface-container-high rounded-sm flex items-center gap-1 font-label-md text-label-md">
          <span className="material-symbols-outlined text-[18px]">search</span>Tìm họ tên
        </button>
      </div>

      {choices.length > 1 && (
        <div className="bg-surface-container-low rounded-lg p-2 flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-outline px-1">Có {choices.length} kết quả, chọn một người:</span>
          {choices.map((c) => (
            <button key={c.documentId} onClick={() => { onChange(c); setChoices([]); setInput(''); }}
              className="text-left px-2 py-1.5 rounded-sm hover:bg-surface-container-high font-body-sm text-body-sm">
              <strong>{c.fullName}</strong> • {c.className} • {c.studentCode}
            </button>
          ))}
        </div>
      )}

      {!patron ? (
        <div className="bg-surface-container-low rounded-lg p-space-lg text-center text-on-surface-variant font-body-sm text-body-sm">
          Chưa có độc giả nào. Hãy quét thẻ để bắt đầu.
        </div>
      ) : (
        <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-md">
          <div className="flex gap-space-md">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-md text-headline-md shrink-0">
              {patron.fullName?.split(' ').pop()?.[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{patron.fullName}</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">Lớp {patron.className} • {patron.patronType?.name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-sm font-label-sm text-label-sm font-semibold ${patron.canBorrow ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                  {patron.canBorrow ? 'Hợp lệ' : 'Bị chặn mượn'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><span className="font-label-sm text-label-sm text-outline block">Mã sinh viên:</span><span className="font-code-md text-code-md font-semibold">{patron.studentCode}</span></div>
                <div><span className="font-label-sm text-label-sm text-outline block">Thẻ:</span><span className="font-code-md text-code-md font-semibold">{patron.cardBarcode}</span></div>
              </div>
            </div>
          </div>
          {!patron.canBorrow && <p className="text-error font-label-md text-label-md">{patron.blockReason}</p>}
          <div className="bg-surface-container-lowest p-space-sm rounded-md flex flex-col gap-space-xs">
            <div className="flex justify-between font-label-md text-label-md">
              <span className="font-semibold">Hạn mức mượn</span>
              <span className="font-bold text-primary-container">Đang mượn {patron.borrowingCount} / {max} cuốn</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden"><div className="bg-primary h-full" style={{ width: `${pct}%` }} /></div>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Còn lại: <strong className="text-secondary">{patron.remaining} lượt</strong></span>
              <span className={patron.unpaidFine > 0 ? 'text-error' : 'text-secondary'}>
                {patron.unpaidFine > 0 ? `Phạt chưa thu: ${money(patron.unpaidFine)}` : 'Không có phạt'}
              </span>
            </div>
          </div>
          <button onClick={() => onChange(null)} className="self-start font-label-sm text-label-sm text-outline hover:text-on-surface">Đổi độc giả khác</button>
        </div>
      )}
    </div>
  );
}
