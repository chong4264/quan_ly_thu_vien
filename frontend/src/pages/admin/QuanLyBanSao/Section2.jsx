import { useToast } from '../../../context/ToastContext';

export default function Section2() {
  const toast=useToast();
  return (
    <>
<div className="mx-space-xl mb-space-sm hidden" id="bulkActionBar"> <div className="bg-surface-container-highest px-space-md py-2 rounded-sm shadow flex items-center justify-between"> <div className="flex items-center gap-space-sm"> <span className="material-symbols-outlined text-primary text-[20px]">check_box</span> <span className="font-label-md text-label-md text-on-surface font-semibold">Đã chọn <span className="text-primary" id="selectedCount">3</span> bản sao lưu hành</span> </div> <div className="flex items-center gap-space-sm"> <button className="px-space-sm py-1 bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-sm transition-colors flex items-center gap-1 shadow-sm" onClick={()=>toast("In nhãn gáy sách")}> <span className="material-symbols-outlined text-[16px]">print</span> In nhãn gáy sách
        </button> <button className="px-space-sm py-1 bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-sm transition-colors flex items-center gap-1 shadow-sm" onClick={()=>toast("Di chuyển kệ")}> <span className="material-symbols-outlined text-[16px]">move_item</span> Di chuyển kệ
        </button> <button className="px-space-sm py-1 bg-surface-container-lowest text-error hover:bg-error-container font-label-sm text-label-sm rounded-sm transition-colors flex items-center gap-1 shadow-sm" onClick={()=>toast("Báo hỏng hàng loạt")}> <span className="material-symbols-outlined text-[16px]">report_problem</span> Báo hỏng hàng loạt
        </button> </div> </div> </div>
    </>
  );
}
