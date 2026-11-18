import { useToast } from '../../../context/ToastContext';

export default function Section4() {
  const toast=useToast();
  return (
    <>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md"> <div className="bg-surface-container-lowest rounded-sm p-space-md shadow-sm space-y-2"> <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-semibold"> <span className="material-symbols-outlined text-[20px]">nfc</span> <span>Đầu đọc RFID tại quầy</span> </div> <p className="font-body-sm text-body-sm text-on-surface-variant">
          Đặt thẻ sinh viên lên thiết bị quét để mở ngay hồ sơ lưu thông mà không cần nhập bàn phím.
        </p> <div className="flex items-center gap-2 pt-1"> <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" /> <span className="font-label-sm text-label-sm text-on-surface font-medium">Thiết bị HID USB: Sẵn sàng kết nối</span> </div> </div> <div className="bg-surface-container-lowest rounded-sm p-space-md shadow-sm space-y-2"> <div className="flex items-center gap-2 text-tertiary font-headline-sm text-headline-sm font-semibold"> <span className="material-symbols-outlined text-[20px]">notifications_active</span> <span>Thông báo SMS & Email tự động</span> </div> <p className="font-body-sm text-body-sm text-on-surface-variant">
          Hệ thống sẽ gửi email cảnh báo mượn sách trước 2 ngày và thông báo tin nhắn SMS tới phụ huynh khi quá hạn trên 7 ngày.
        </p> <a href="#" onClick={(e)=>e.preventDefault()} className="font-label-sm text-label-sm text-primary hover:underline inline-flex items-center gap-1 font-semibold">
          Cấu hình mẫu tin nhắn <span className="material-symbols-outlined text-[14px]">arrow_forward</span> </a> </div> <div className="bg-surface-container-lowest rounded-sm p-space-md shadow-sm space-y-2"> <div className="flex items-center gap-2 text-on-surface font-headline-sm text-headline-sm font-semibold"> <span className="material-symbols-outlined text-[20px] text-secondary">sync</span> <span>Đồng bộ hệ thống đào tạo</span> </div> <p className="font-body-sm text-body-sm text-on-surface-variant">
          Đã đồng bộ tự động 100% hồ sơ sinh viên chuyển lớp đầu năm học. Lần đồng bộ gần nhất: Hôm nay lúc 04:30 AM.
        </p> <button className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1 cursor-pointer" onClick={()=>toast("Kiểm tra đối soát dữ liệu")}> <span className="material-symbols-outlined text-[14px]">refresh</span> Kiểm tra đối soát dữ liệu
        </button> </div> </div>
    </>
  );
}
