import { useToast } from '../../../context/ToastContext';

export default function CauHinhThamSo() {
  const toast=useToast();
  return (
    <>
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md"> <div className="space-y-space-xs">  <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant"> <span className="hover:text-primary transition-colors cursor-pointer">Phân hệ Quản trị</span> <span className="material-symbols-outlined text-[14px]">chevron_right</span> <span className="font-semibold text-primary">Cấu hình hệ thống</span> </nav> <div className="flex items-center gap-space-sm pt-1"> <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Cấu hình tham số hệ thống Thư viện</h1> <span className="bg-secondary/10 text-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1"> <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Hệ thống chuẩn v4.2
          </span> </div> <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
          Thiết lập chính sách mượn trả, khung định mức tiền phạt, tự động hóa gửi email cảnh báo và phân quyền người dùng tại Đại học Công nghiệp Hà Nội.
        </p> </div>  <div className="flex flex-wrap items-center gap-space-sm shrink-0 pt-2 lg:pt-0"> <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-sm text-on-surface-variant font-label-sm text-label-sm mr-1"> <span className="material-symbols-outlined text-[16px] text-secondary">cloud_done</span> <span>Đã đồng bộ lúc 10:42 AM</span> </div> <button className="inline-flex items-center gap-1 px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded-sm transition-colors shadow-sm" type="button" onClick={()=>toast("Khôi phục mặc định")}> <span className="material-symbols-outlined text-[16px]">restart_alt</span> <span>Khôi phục mặc định</span> </button> <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-sm transition-all shadow-sm" type="button" onClick={()=>toast("Lưu thay đổi (Ctrl+S)")}> <span className="material-symbols-outlined text-[18px]">save</span> <span>Lưu thay đổi (Ctrl+S)</span> </button> </div> </div>
    </>
  );
}
