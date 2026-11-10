import { useToast } from '../../../context/ToastContext';

export default function Section4() {
  const toast=useToast();
  return (
    <>
<div className="sticky bottom-4 z-30 bg-inverse-surface/95 backdrop-blur text-inverse-on-surface p-space-md rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-md"> <div className="flex items-center gap-space-sm text-center sm:text-left"> <div className="w-9 h-9 rounded-sm bg-primary-container/20 text-inverse-primary flex items-center justify-center shrink-0"> <span className="material-symbols-outlined text-[20px]">info</span> </div> <div> <span className="font-label-md text-label-md font-semibold block text-inverse-on-surface">Hiệu lực cập nhật chính sách</span> <span className="font-body-sm text-body-sm text-outline-variant block">Các thay đổi sẽ có hiệu lực ngay lập tức cho toàn bộ các giao dịch mượn trả tiếp theo tại quầy.</span> </div> </div> <div className="flex items-center gap-space-sm shrink-0 w-full sm:w-auto justify-end"> <button className="flex-1 sm:flex-none px-4 py-2.5 bg-inverse-surface hover:bg-surface-variant/20 text-inverse-on-surface rounded-sm font-label-md text-label-md transition-colors" type="button" onClick={()=>toast("Hủy bỏ")}>
          Hủy bỏ
        </button> <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-md text-label-md font-bold shadow-md transition-all" type="button" onClick={()=>toast("Lưu và áp dụng cấu hình")}> <span className="material-symbols-outlined text-[18px]">verified</span> <span>Lưu và áp dụng cấu hình</span> </button> </div> </div>
    </>
  );
}
