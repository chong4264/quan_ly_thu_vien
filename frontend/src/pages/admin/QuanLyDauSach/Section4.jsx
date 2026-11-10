import { useToast } from '../../../context/ToastContext';

export default function Section4() {
  const toast=useToast();
  return (
    <>
<div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-high px-space-md py-2.5 rounded-sm shadow-sm transition-all" id="bulkToolbar"> <div className="flex items-center gap-space-md"> <div className="flex items-center gap-2"> <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary font-code-md text-code-md">2</span> <span className="font-label-md text-label-md font-semibold text-on-surface">Đã chọn 2 đầu sách</span> </div> <span className="text-outline text-body-sm font-body-sm">|</span> <span className="text-on-surface-variant font-body-sm text-body-sm">Thao tác áp dụng cho các mục đã chọn trong phiên này:</span> </div> <div className="flex items-center gap-space-xs"> <button className="h-8 px-2.5 bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors rounded-sm font-label-sm text-label-sm flex items-center gap-1 shadow-sm" type="button" onClick={()=>toast("In mã vạch / RFID")}> <span className="material-symbols-outlined text-[16px] text-primary">qr_code_2</span> <span>In mã vạch / RFID</span> </button> <button className="h-8 px-2.5 bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors rounded-sm font-label-sm text-label-sm flex items-center gap-1 shadow-sm" type="button" onClick={()=>toast("Chuyển vị trí kệ")}> <span className="material-symbols-outlined text-[16px] text-on-surface-variant">move_up</span> <span>Chuyển vị trí kệ</span> </button> <button className="h-8 px-2.5 bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors rounded-sm font-label-sm text-label-sm flex items-center gap-1 shadow-sm" type="button" onClick={()=>toast("Xóa khỏi kho")}> <span className="material-symbols-outlined text-[16px]">delete_sweep</span> <span>Xóa khỏi kho</span> </button> <button className="h-8 px-2 bg-transparent text-outline hover:text-on-surface font-label-sm text-label-sm ml-1" id="clearSelectionBtn" title="Hủy chọn" type="button" onClick={()=>toast("Bỏ chọn")}>
        Bỏ chọn
      </button> </div> </div>
    </>
  );
}
