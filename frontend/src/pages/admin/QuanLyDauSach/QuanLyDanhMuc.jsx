import { useToast } from '../../../context/ToastContext';

export default function QuanLyDanhMuc() {
  const toast=useToast();
  return (
    <>
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md"> <div className="space-y-1"> <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm"> <span>BIÊN MỤC & TÀI LIỆU</span> <span>/</span> <span className="text-primary font-bold">DANH MỤC ĐẦU SÁCH</span> </div> <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Quản lý danh mục đầu sách</h1> <p className="font-body-md text-body-md text-on-surface-variant">Kho dữ liệu số hóa thư viện trường THPT Chu Văn An • Cập nhật lần cuối: 10 phút trước</p> </div>  <div className="flex flex-wrap items-center gap-space-sm"> <button className="h-9 px-3 bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors rounded-sm shadow-sm flex items-center gap-1.5 font-label-md text-label-md" type="button" onClick={()=>toast("Import Excel / MARC21")}> <span className="material-symbols-outlined text-[18px] text-on-surface-variant">upload_file</span> <span>Import Excel / MARC21</span> </button> <button className="h-9 px-3 bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors rounded-sm shadow-sm flex items-center gap-1.5 font-label-md text-label-md" type="button" onClick={()=>toast("Xuất danh sách (CSV)")}> <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span> <span>Xuất danh sách (CSV)</span> </button> <button className="h-9 px-3.5 bg-primary-container hover:bg-primary text-on-primary transition-all rounded-sm shadow-sm flex items-center gap-1.5 font-label-md text-label-md font-semibold" type="button" onClick={()=>toast("Thêm đầu sách mới")}> <span className="material-symbols-outlined text-[18px]">add_circle</span> <span>Thêm đầu sách mới</span> </button> </div> </div>
    </>
  );
}
