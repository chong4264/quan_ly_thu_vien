import { money } from '../../../lib/format';

export default function TuSachDangMuon({ payload, loading }) {
  const patron = payload?.patron;
  const summary = payload?.summary;
  const settings = payload?.settings;
  const linked = payload?.linked;
  const overdue = summary?.overdueCount ?? 0;
  const dueSoon = summary?.dueSoonCount ?? 0;

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
        <div>
          <div className="flex items-center gap-space-sm text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
            <span>HỆ THỐNG MƯỢN TRẢ THƯ VIỆN SỐ</span>
            <span className="text-outline">/</span>
            <span className="text-on-surface-variant">Đại học Công nghiệp Hà Nội</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-space-xs">
            Tủ sách đang mượn &amp; Gia hạn trực tuyến
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {linked
              ? <>Theo dõi thời hạn bản in thực tế của <strong className="text-on-surface">{patron.fullName}</strong> ({patron.className}) và gia hạn chu kỳ mượn khi đủ điều kiện.</>
              : 'Theo dõi thời hạn bản in thực tế và gia hạn chu kỳ mượn khi đủ điều kiện.'}
          </p>
        </div>

        <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg shadow-sm">
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Hạn mức lưu giữ</span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              {loading ? 'Đang tải…' : linked ? `${summary?.borrowingCount ?? 0} / ${summary?.maxBooks ?? 0} cuốn` : '—'}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">book</span>
          </div>
        </div>
      </div>

      {!loading && linked !== false && overdue > 0 && (
        <div className="bg-error-container text-on-error-container px-space-md py-space-sm rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[22px]">warning</span>
            <span className="font-body-md text-body-md font-semibold text-error">
              Cảnh báo quá hạn: Bạn có {String(overdue).padStart(2, '0')} tài liệu quá hạn. Phí phạt tạm tính hiện tại: {money(summary?.fine ?? 0)}.
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-error-container">
            Quy chế: Trễ quá {settings?.autoLockAfterDays ?? 30} ngày sẽ khóa tài khoản mượn
          </span>
        </div>
      )}

      {!loading && linked !== false && overdue === 0 && (
        <div className={`${dueSoon > 0 ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-low text-on-surface-variant'} px-space-md py-space-sm rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm`}>
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[22px]">{dueSoon > 0 ? 'timer' : 'verified'}</span>
            <span className="font-body-md text-body-md font-semibold">
              {dueSoon > 0
                ? `${dueSoon} tài liệu sắp đến hạn trong ${settings?.remindBeforeDays ?? 2} ngày tới.`
                : 'Không có tài liệu quá hạn. Bạn đang giữ sách trong hạn quy định.'}
            </span>
          </div>
          <span className="font-label-sm text-label-sm">
            Mức phạt quá hạn: {money(settings?.finePerDay ?? 1000)} / ngày / cuốn
          </span>
        </div>
      )}
    </div>
  );
}
