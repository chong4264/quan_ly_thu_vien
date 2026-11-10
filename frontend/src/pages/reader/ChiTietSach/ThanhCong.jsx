
export default function ThanhCong() {
  return (
    <>
<div className="fixed bottom-6 right-6 max-w-sm bg-inverse-surface text-inverse-on-surface p-space-md rounded-md shadow-xl translate-y-20 opacity-0 pointer-events-none transition-all duration-300 z-50 flex items-start gap-space-sm" id="toast-modal"> <span className="material-symbols-outlined text-secondary-fixed text-[24px]">check_circle</span> <div className="flex-1"> <h4 className="font-headline-sm text-body-lg font-bold text-inverse-on-surface" id="toast-title">Thành công</h4> <p className="font-body-sm text-body-sm text-inverse-on-surface/80" id="toast-msg">Yêu cầu giữ chỗ đã được gửi đến quầy thủ thư.</p> </div> <button className="text-inverse-on-surface/70 hover:text-inverse-on-surface" id="toast-close"> <span className="material-symbols-outlined text-[18px]">close</span> </button> </div>
    </>
  );
}
