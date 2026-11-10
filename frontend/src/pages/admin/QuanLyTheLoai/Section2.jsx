import { useToast } from '../../../context/ToastContext';

export default function Section2() {
  const toast=useToast();
  return (
    <>
<div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 hidden" id="modal-add-category"> <div className="bg-surface-container-lowest w-full max-w-lg rounded-sm shadow-xl flex flex-col overflow-hidden">  <div className="px-space-md py-3 bg-surface-container-low flex items-center justify-between"> <div className="flex items-center gap-2"> <span className="material-symbols-outlined text-primary text-[20px]">create_new_folder</span> <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Thêm thể loại & Mã DDC mới</span> </div> <button className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-error rounded-sm transition-colors" type="button"> <span className="material-symbols-outlined text-[20px]">close</span> </button> </div>  <form className="p-space-md space-y-4"> <div className="grid grid-cols-2 gap-3"> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
              Mã thể loại <span className="text-error">*</span> </label> <input className="w-full h-9 px-3 bg-surface-container-low text-on-surface font-code-md text-code-md rounded-sm focus:outline-none" readOnly type="text" defaultValue="CAT-09" /> </div> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
              Mã Khung Dewey (DDC) <span className="text-error">*</span> </label> <input className="w-full h-9 px-3 bg-surface-container-lowest text-on-surface font-code-md text-code-md rounded-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: 510-519" required type="text" /> </div> </div> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
            Tên phân nhóm thể loại <span className="text-error">*</span> </label> <input className="w-full h-9 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-primary" placeholder={"VD: Giải tích & Hình học không gian"} required type="text" /> </div> <div className="grid grid-cols-2 gap-3"> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
              Đại lớp chuẩn DDC
            </label> <select className="w-full h-9 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-sm shadow-inner focus:outline-none cursor-pointer"> <option>500 – Khoa học tự nhiên & Toán học</option> <option>000 – Khoa học máy tính & Tin tức</option> <option>300 – Khoa học xã hội</option> <option>800 – Văn học</option> </select> </div> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
              Vị trí khu vực lưu kho
            </label> <input className="w-full h-9 px-3 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-primary" placeholder="VD: Khu A — Tầng 1 (Kệ 11)" type="text" /> </div> </div> <div> <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1">
            Ghi chú biên mục & Phạm vi tài liệu
          </label> <textarea className="w-full p-2 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-sm shadow-inner focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Mô tả phạm vi các ấn phẩm được phân loại theo mã nhóm này..." rows="2" /> </div>  <div className="pt-2 flex items-center justify-end gap-2"> <button className="h-9 px-4 bg-surface-container-low text-on-surface-variant hover:bg-surface-container font-label-md text-label-md rounded-sm transition-colors" type="button" onClick={()=>toast("Hủy bỏ")}>
            Hủy bỏ
          </button> <button className="h-9 px-5 bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold rounded-sm shadow-sm transition-colors" type="submit">
            Lưu thể loại
          </button> </div> </form> </div> </div>
    </>
  );
}
