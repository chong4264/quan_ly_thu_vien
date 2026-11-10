
export default function TuSachDangMuon() {
  return (
    <>
<div className="flex flex-col gap-space-md"> <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm"> <div> <div className="flex items-center gap-space-sm text-primary font-label-md text-label-md"> <span className="material-symbols-outlined text-[18px]">collections_bookmark</span> <span>HỆ THỐNG MƯỢN TRẢ THƯ VIỆN SỐ</span> <span className="text-outline">/</span> <span className="text-on-surface-variant">THPT Chuyên Chu Văn An</span> </div> <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mt-space-xs">
            Tủ sách đang mượn & Gia hạn trực tuyến
          </h1> <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Theo dõi thời hạn bản in thực tế, thực hiện gia hạn chu kỳ mượn hoặc lập lịch hoàn trả tại quầy lưu thông.
          </p> </div>  <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-lg shadow-sm"> <div className="flex flex-col items-end"> <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Hạn mức lưu giữ</span> <span className="font-headline-sm text-headline-sm font-bold text-primary">2 / 5 cuốn</span> </div> <div className="w-10 h-10 rounded bg-primary-fixed text-primary flex items-center justify-center"> <span className="material-symbols-outlined text-[24px]">book</span> </div> </div> </div>  <div className="bg-error-container text-on-error-container px-space-md py-space-sm rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm shadow-sm"> <div className="flex items-center gap-space-sm"> <span className="material-symbols-outlined text-error text-[22px] animate-pulse">warning</span> <span className="font-body-md text-body-md font-semibold text-error">
            Cảnh báo quá hạn: Bạn có 01 tài liệu quá hạn 7 ngày. Phí phạt phát sinh hiện tại: 7.000 đ.
          </span> </div> <div className="flex items-center gap-space-md"> <span className="font-label-sm text-label-sm text-on-error-container">Quy chế: Trễ quá 15 ngày sẽ khóa tài khoản mượn</span> <a href="#" onClick={(e)=>e.preventDefault()} className="font-label-sm text-label-sm font-semibold underline text-error hover:opacity-80">Chi tiết</a> </div> </div> </div>
    </>
  );
}
