import { useToast } from "../../../context/ToastContext";

export default function BangDieuKhienThu({ onSync }) {
  const toast = useToast();
  const currentDate = new Date().toLocaleDateString("vi-VN");

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-1">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">
                home
              </span>
              Trang chủ
            </a>
            <span>/</span>
            <span className="text-on-surface font-semibold">
              Tổng quan quản trị thư viện
            </span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Bảng điều khiển Thư viện
            </h1>
            <span className="bg-secondary-fixed text-on-secondary-fixed font-code-md text-code-md px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              HỆ THỐNG TRỰC TUYẾN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="flex items-center bg-surface-container-lowest px-3 py-1.5 rounded-sm shadow-sm text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[16px] mr-1.5 text-outline">
              calendar_today
            </span>
            Hôm nay:{" "}
            <span className="font-semibold text-on-surface ml-1">
              {currentDate}
            </span>
          </div>
          <button
            className="bg-surface-container-lowest hover:bg-surface-container-low text-on-surface px-3 py-1.5 rounded-sm shadow-sm font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => toast("Tính năng xuất báo cáo Excel đang sẵn sàng")}
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              download
            </span>
            Xuất báo cáo
          </button>
          <button
            className="bg-primary-container hover:bg-primary text-on-primary px-3.5 py-1.5 rounded-sm shadow-sm font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => {
              if (onSync) onSync();
              toast("Đã đồng bộ dữ liệu mới nhất!");
            }}
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Đồng bộ dữ liệu
          </button>
        </div>
      </div>
    </>
  );
}
