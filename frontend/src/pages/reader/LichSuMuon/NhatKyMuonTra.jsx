import { useToast } from '../../../context/ToastContext';

export default function NhatKyMuonTra() {
  const toast=useToast();
  return (
    <>
<div className="flex flex-col gap-space-sm"> <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md"> <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-primary-container transition-colors flex items-center gap-1"> <span className="material-symbols-outlined text-[16px]">school</span>
          Cổng Học sinh
        </a> <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span> <span className="text-on-surface font-semibold">Lịch sử mượn trả tài liệu</span> </div> <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md"> <div> <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Nhật ký mượn trả & Đọc tài liệu
          </h1> <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Tổng hợp toàn bộ 34 giao dịch mượn tài liệu học thuật, giáo trình và tài liệu bồi dưỡng qua các niên khóa của học sinh <strong className="text-on-surface">Trần Bảo Nam (12A1)</strong>.
          </p> </div> <div className="flex items-center gap-space-sm self-start lg:self-auto"> <button className="h-9 px-space-md bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-sm shadow-sm flex items-center gap-space-xs font-label-md text-label-md transition-all active:scale-[0.98]" id="btn-export" onClick={()=>toast("Xuất file trích lục (PDF/Excel)")}> <span className="material-symbols-outlined text-[18px] text-primary-container">file_download</span> <span>Xuất file trích lục (PDF/Excel)</span> </button> <a href="#" onClick={(e)=>e.preventDefault()} className="h-9 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-sm shadow-sm flex items-center gap-space-xs font-label-md text-label-md transition-all active:scale-[0.98]"> <span className="material-symbols-outlined text-[18px]">search</span> <span>Tìm sách mới</span> </a> </div> </div> </div>
    </>
  );
}
