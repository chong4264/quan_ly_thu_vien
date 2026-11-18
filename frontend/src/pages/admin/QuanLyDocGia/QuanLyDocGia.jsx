import { useRef } from "react";

export default function QuanLyDocGia({
  totalPatrons = 0,
  onOpenAddModal,
  onImportCSV,
  onExportCards,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <span>Hệ thống quản trị</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span>Bạn đọc & Hồ sơ</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1">
            Quản lý độc giả & Thẻ thư viện
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Quản lý dữ liệu định danh {totalPatrons.toLocaleString("vi-VN")} tài
            khoản độc giả, đồng bộ RFID và giám sát luân chuyển tài liệu theo
            niên khóa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              upload_file
            </span>
            <span>Import từ CSDL Nhà trường</span>
          </button>

          <button
            className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={onExportCards}
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              contactless
            </span>
            <span>Xuất thẻ RFID</span>
          </button>

          <button
            className="h-9 px-4 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={onOpenAddModal}
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            <span>+ Thêm mới độc giả</span>
          </button>
        </div>
      </div>
    </>
  );
}
