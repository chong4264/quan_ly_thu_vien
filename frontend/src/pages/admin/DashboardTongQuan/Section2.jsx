export default function Section2({ overview }) {
  const {
    totalBooks = 0,
    totalCopies = 0,
    availableCopies = 0,
    borrowedCopies = 0,
    overdueCount = 0,
    activePatrons = 0,
  } = overview || {};

  const circulationRate =
    totalCopies > 0 ? ((borrowedCopies / totalCopies) * 100).toFixed(1) : "0.0";

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Tổng đầu sách
            </span>
            <div className="w-7 h-7 rounded-sm bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                auto_stories
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {totalBooks.toLocaleString("vi-VN")}
            </div>
            <div className="flex items-center gap-1 mt-1 font-body-sm text-body-sm text-secondary">
              <span className="material-symbols-outlined text-[14px]">
                library_books
              </span>
              <span className="text-on-surface-variant font-normal">
                Đầu sách hệ thống
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Tổng bản sao
            </span>
            <div className="w-7 h-7 rounded-sm bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                collections_bookmark
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {totalCopies.toLocaleString("vi-VN")}
            </div>
            <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
              <span>Có sẵn:</span>
              <span className="font-code-md text-code-md font-bold text-secondary">
                {availableCopies.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Độc giả tích cực
            </span>
            <div className="w-7 h-7 rounded-sm bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">
                group
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {activePatrons.toLocaleString("vi-VN")}
            </div>
            <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant truncate">
              Thẻ đang hoạt động
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Đang được mượn
            </span>
            <div className="w-7 h-7 rounded-sm bg-primary-fixed-dim flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                outbox
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg font-bold text-primary">
              {borrowedCopies.toLocaleString("vi-VN")}{" "}
              <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                cuốn
              </span>
            </div>
            <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Tỷ lệ lưu thông:{" "}
              <span className="font-semibold text-on-surface">
                {circulationRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-semibold">
              Sách quá hạn
            </span>
            <div className="w-7 h-7 rounded-sm bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">
                warning
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg font-bold text-error">
              {overdueCount.toLocaleString("vi-VN")}{" "}
              <span className="font-label-md text-label-md font-normal text-on-surface-variant">
                lượt
              </span>
            </div>
            <div className="mt-1 font-label-sm text-label-sm text-error flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">
                priority_high
              </span>
              Cần gửi nhắc nhở
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Kho lưu trữ
            </span>
            <div className="w-7 h-7 rounded-sm bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">
              {overview.processingCopies || 0}{" "}
              <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                xử lý
              </span>
            </div>
            <div className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Mất: {overview.lostCopies || 0} bản
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
