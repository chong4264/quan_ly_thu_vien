import { useToast } from '../../../context/ToastContext';

export default function QuanLyDocGia() {
  const toast=useToast();
  return (
    <>
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md"> <div> <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider"> <span>Hệ thống quản trị</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span> <span>Bạn đọc & Hồ sơ</span> </div> <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-1">
          Quản lý độc giả & Thẻ thư viện
        </h1> <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Quản lý dữ liệu định danh 2,450 tài khoản độc giả, đồng bộ RFID và giám sát luân chuyển tài liệu theo niên khóa.
        </p> </div> <div className="flex flex-wrap items-center gap-space-sm"> <button className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer" onClick={()=>toast("Import từ CSDL Nhà trường")}> <span className="material-symbols-outlined text-[18px] text-primary">upload_file</span> <span>Import từ CSDL Nhà trường</span> </button> <button className="h-9 px-3 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer" onClick={()=>toast("Xuất thẻ RFID")}> <span className="material-symbols-outlined text-[18px] text-secondary">contactless</span> <span>Xuất thẻ RFID</span> </button> <button className="h-9 px-4 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-sm shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer" onClick={()=>toast("+ Thêm mới độc giả")}> <span className="material-symbols-outlined text-[18px]">person_add</span> <span>+ Thêm mới độc giả</span> </button> </div> </div>
    </>
  );
}
