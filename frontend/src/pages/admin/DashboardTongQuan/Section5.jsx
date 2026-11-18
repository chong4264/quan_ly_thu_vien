export default function Section5() {
  return (
    <>
      <div
        className="fixed bottom-5 right-5 bg-surface-container-lowest text-on-surface px-4 py-3 rounded-sm shadow-xl flex items-center gap-3 opacity-0 pointer-events-none transition-all duration-300 transform translate-y-2 z-50"
        id="toastNotification"
      >
        <div className="w-6 h-6 rounded-sm bg-secondary-fixed flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[16px]">
            check_circle
          </span>
        </div>
        <div
          className="font-body-sm text-body-sm font-medium"
          id="toastMessage"
        >
          Đã xử lý thao tác thành công!
        </div>
      </div>
    </>
  );
}
