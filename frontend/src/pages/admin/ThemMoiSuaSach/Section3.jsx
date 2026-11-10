import { useToast } from '../../../context/ToastContext';

export default function Section3() {
  const toast=useToast();
  return (
    <>
<div className="sticky bottom-0 z-30 bg-surface-container-lowest p-space-md shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md"> <div className="flex items-center gap-space-sm text-on-surface-variant"> <span className="material-symbols-outlined text-[18px] text-outline">history</span> <span className="font-body-sm text-body-sm">Bản nháp tự động lưu lúc <span className="font-semibold text-on-surface">14:26:08</span></span> <span className="text-outline">|</span> <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1"> <span className="w-2 h-2 rounded-full bg-secondary" />
          Máy quét mã vạch đã kết nối (COM3: Ready)
        </span> </div> <div className="flex items-center gap-space-sm">  <button className="h-9 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-sm transition-colors flex items-center gap-1.5" type="button" onClick={()=>toast("Hủy bỏ")}> <span className="material-symbols-outlined text-[18px]">close</span> <span>Hủy bỏ</span> </button>  <button className="h-9 px-space-md bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md rounded-sm transition-colors flex items-center gap-1.5" type="button" onClick={()=>toast("Lưu nháp")}> <span className="material-symbols-outlined text-[18px]">draft</span> <span>Lưu nháp</span> </button>  <button className="h-9 px-space-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md rounded-sm transition-colors flex items-center gap-space-xs shadow-md" id="btnSubmitForm" type="button" onClick={()=>toast("Lưu & Tạo mã vạch bản sao")}> <span className="material-symbols-outlined text-[18px]">save</span> <span className="font-semibold">Lưu & Tạo mã vạch bản sao</span> <span className="material-symbols-outlined text-[16px]">arrow_forward</span> </button> </div> </div>
    </>
  );
}
