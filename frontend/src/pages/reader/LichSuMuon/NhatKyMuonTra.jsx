import { Link } from 'react-router-dom';

export default function NhatKyMuonTra({ payload, loading }) {
  const patron = payload?.patron;
  const stats = payload?.stats;
  const linked = payload?.linked;

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
        <Link to="/tra-cuu-sach" className="hover:text-primary-container transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">school</span>
          Cổng Học sinh
        </Link>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">Lịch sử mượn trả tài liệu</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Nhật ký mượn trả &amp; Đọc tài liệu
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {loading && !payload
              ? 'Đang tải lịch sử mượn tài liệu…'
              : linked
                ? <>Tổng hợp toàn bộ <strong className="text-on-surface">{stats?.total ?? 0}</strong> giao dịch mượn tài liệu của học sinh <strong className="text-on-surface">{patron.fullName}</strong> ({patron.className}).</>
                : linked === false
                  ? 'Chưa thể hiển thị lịch sử vì tài khoản chưa được liên kết hồ sơ độc giả.'
                  : 'Tổng hợp toàn bộ giao dịch mượn tài liệu của tài khoản đang đăng nhập.'}
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start lg:self-auto">
          <Link
            to="/tra-cuu-sach"
            className="h-9 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-sm shadow-sm flex items-center gap-space-xs font-label-md text-label-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Tìm sách mới</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
