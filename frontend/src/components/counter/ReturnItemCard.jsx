import { useEffect, useRef, useState } from 'react';
import { CONDITION, fmtDate, money } from '../../lib/format';
import FeeBreakdown from './FeeBreakdown';

const ORDER = ['normal', 'scratched', 'damaged', 'lost'];
const ICON = { normal: 'check_circle', scratched: 'brush', damaged: 'broken_image', lost: 'help' };
const NOTE = {
  damaged: 'Bản sao sẽ chuyển sang trạng thái chờ xử lý, chưa cho mượn lại.',
  lost: 'Bản sao sẽ được ghi nhận là đã mất.',
};

export default function ReturnItemCard({ it, finePerDay, highlighted, busy, onReturn, onRenew }) {
  const [condition, setCondition] = useState('normal');
  const [collected, setCollected] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (highlighted) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [highlighted]);

  const compensation = it.compensation?.[condition] ?? 0;
  const total = it.fine + compensation;
  const late = it.lateDays > 0;

  const pick = (c) => { setCondition(c); setCollected(false); }; // đổi tình trạng thì số tiền đổi, bỏ tick "đã thu"

  return (
    <div ref={ref} className={`p-space-md rounded-lg flex flex-col gap-space-md transition-shadow ${late ? 'bg-error-container/30' : 'bg-surface-container-low'} ${highlighted ? 'ring-2 ring-primary-container' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium font-body-md text-body-md truncate">{it.title}</div>
          <div className="font-label-sm text-label-sm text-outline">
            {it.accessionNo} • Mượn {fmtDate(it.loanedAt)} • Hạn {fmtDate(it.dueDate)} • Đã gia hạn {it.renewCount}/{it.maxRenewals}
          </div>
        </div>
        {late && <span className="px-2 py-0.5 rounded-sm bg-error text-on-error font-label-sm text-label-sm font-semibold whitespace-nowrap">Trễ {it.lateDays} ngày</span>}
      </div>

      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase mb-1.5">Tình trạng sách khi trả</div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {ORDER.map((c) => {
            const on = condition === c;
            const amount = it.compensation?.[c] ?? 0;
            return (
              <button key={c} type="button" onClick={() => pick(c)}
                className={`p-2 rounded-lg text-left transition-colors ${on ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'}`}>
                <div className="flex items-center gap-1 font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[16px]">{ICON[c]}</span>{CONDITION[c]}
                </div>
                <div className={`font-label-sm text-label-sm ${on ? 'text-on-primary-container' : amount ? 'text-error' : 'text-outline'}`}>
                  {amount ? `+${money(amount)}` : 'Không phạt thêm'}
                </div>
              </button>
            );
          })}
        </div>
        {NOTE[condition] && <p className="mt-1.5 font-label-sm text-label-sm text-on-surface-variant">{NOTE[condition]}</p>}
      </div>

      <FeeBreakdown lateDays={it.lateDays} finePerDay={finePerDay} lateFine={it.fine}
        condition={condition} compensation={compensation} bookPrice={it.bookPrice} />

      <div className="flex flex-wrap items-center gap-2">
        {total > 0 && (
          <label className="flex items-center gap-1.5 font-label-md text-label-md mr-auto">
            <input type="checkbox" checked={collected} onChange={(e) => setCollected(e.target.checked)} /> Đã thu đủ {money(total)}
          </label>
        )}
        <button disabled={busy} onClick={() => onReturn({ loanItemId: it.loanItemId, returnCondition: condition, fineCollected: collected })}
          className="h-9 px-4 bg-primary text-on-primary rounded-sm font-label-md text-label-md font-semibold disabled:opacity-50 ml-auto">
          {busy ? 'Đang xử lý...' : total > 0 ? `Xác nhận trả • thu ${money(total)}` : 'Xác nhận trả'}
        </button>
        <button disabled={!it.canRenew || busy} onClick={() => onRenew(it)}
          className="h-9 px-3 bg-surface-container hover:bg-surface-container-high rounded-sm font-label-md text-label-md disabled:opacity-40">Gia hạn</button>
      </div>
    </div>
  );
}
