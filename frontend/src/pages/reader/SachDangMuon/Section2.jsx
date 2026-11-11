import { money } from '../../../lib/format';

const StatShell = ({ children }) => (
  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
    {children}
  </div>
);

export default function Section2({ payload, loading }) {
  const summary = payload?.summary;
  const settings = payload?.settings;
  const linked = payload?.linked;
  const total = summary?.borrowingCount ?? 0;
  const max = summary?.maxBooks ?? 0;
  const pct = max > 0 ? Math.min(100, Math.round((total / max) * 100)) : 0;
  const dueSoon = summary?.dueSoonCount ?? 0;
  const overdue = summary?.overdueCount ?? 0;
  const fine = summary?.fine ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
      <StatShell>
        <div className="flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Tổng sách đang giữ</span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-headline-xl text-headline-xl text-on-surface">{loading ? '…' : linked === false ? '—' : total}</span>
              <span className="font-headline-sm text-headline-sm text-outline">/ {loading ? '…' : max} cuốn</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
        </div>
        <div className="mt-space-lg">
          <div className="flex justify-between items-center font-label-sm text-label-sm mb-1">
            <span className="text-on-surface-variant">Đã sử dụng {loading ? '…' : `${pct}%`} chỉ tiêu</span>
            <span className="font-code-md text-code-md text-primary font-semibold">Còn trống {summary?.remaining ?? 0}</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </StatShell>

      <StatShell>
        <div className="flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase text-tertiary">Sách sắp đến hạn</span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-headline-xl text-headline-xl text-tertiary">{loading ? '…' : dueSoon}</span>
              <span className="font-headline-sm text-headline-sm text-on-surface-variant">cuốn</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
        </div>
        <p className="mt-space-lg font-body-sm text-body-sm text-on-surface-variant">
          Ngưỡng nhắc hạn: <strong className="text-on-surface">{settings?.remindBeforeDays ?? 2} ngày</strong> trước hạn trả.
        </p>
      </StatShell>

      <StatShell>
        <div className="flex items-start justify-between">
          <div>
            <span className="font-label-sm text-label-sm uppercase text-error">Quá hạn &amp; phạt tạm tính</span>
            <div className="flex items-baseline gap-space-xs mt-space-xs">
              <span className="font-headline-xl text-headline-xl text-error">{loading ? '…' : overdue}</span>
              <span className="font-headline-sm text-headline-sm text-on-surface-variant">cuốn</span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${overdue > 0 ? 'bg-error-container text-error' : 'bg-surface-container text-secondary'}`}>
            <span className="material-symbols-outlined text-[24px]">{overdue > 0 ? 'warning' : 'check_circle'}</span>
          </div>
        </div>
        <p className="mt-space-lg font-body-sm text-body-sm text-on-surface-variant">
          {overdue > 0 ? <>Phí phạt tạm tính: <strong className="text-error">{money(fine)}</strong></> : 'Không phát sinh phí phạt quá hạn.'}
        </p>
      </StatShell>
    </div>
  );
}
