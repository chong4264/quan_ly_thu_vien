import { money } from '../../../lib/format';

const Card = ({ children }) => (
  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden">
    {children}
  </div>
);

export default function Section2({ payload, loading }) {
  const stats = payload?.stats;
  const rate = stats?.onTimeRate;
  const linked = payload?.linked;
  const returned = stats?.returned ?? 0;
  const onTime = stats?.returnedOnTime ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      <Card>
        <div className="flex flex-col gap-1 z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Tổng số lượt mượn</span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface font-bold">{loading ? '…' : linked === false ? '—' : stats?.total ?? 0}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">lượt</span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {loading ? 'Đang tải dữ liệu…' : `${stats?.borrowing ?? 0} đang mượn, ${stats?.overdue ?? 0} quá hạn, ${returned} đã trả`}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container z-10">
          <span className="material-symbols-outlined text-[26px]">library_books</span>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-surface-container-low rounded-full opacity-60 pointer-events-none" />
      </Card>

      <Card>
        <div className="flex flex-col gap-1 z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Tỷ lệ trả đúng hạn</span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-secondary font-bold">
              {loading ? '…' : rate == null ? '—' : `${rate}%`}
            </span>
            {!loading && rate != null && (
              <span className="px-1.5 py-0.5 rounded-sm bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                {rate >= 95 ? 'Uy tín cao' : rate >= 80 ? 'Đạt yêu cầu' : 'Cần cải thiện'}
              </span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {loading ? 'Đang tải dữ liệu…' : returned ? `${onTime}/${returned} lượt trả đúng hạn` : 'Chưa có lượt trả nào'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary z-10">
          <span className="material-symbols-outlined text-[26px]">verified_user</span>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-surface-container-low rounded-full opacity-60 pointer-events-none" />
      </Card>

      <Card>
        <div className="flex flex-col gap-1 z-10">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Đang lưu giữ &amp; phạt</span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface font-bold">{loading ? '…' : stats?.borrowing ?? 0}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">đang mượn</span>
          </div>
          <span className={`font-body-sm text-body-sm mt-1 ${stats?.overdue ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
            {loading
              ? 'Đang tải dữ liệu…'
              : stats?.overdue
                ? `${stats.overdue} sách quá hạn • Phạt tạm tính ${money(stats.totalFine)}`
                : `Không quá hạn • Phạt chưa thu ${money(stats?.unpaidFine ?? 0)}`}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center z-10 ${stats?.overdue ? 'text-error' : 'text-tertiary-container'}`}>
          <span className="material-symbols-outlined text-[26px]">{stats?.overdue ? 'warning' : 'menu_book'}</span>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-surface-container-low rounded-full opacity-60 pointer-events-none" />
      </Card>
    </div>
  );
}
