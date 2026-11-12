export default function GiaoDichLuuThong({
  recentLoans = [],
  dueSoonList = [],
  onRemind,
}) {
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Giao dịch lưu thông gần nhất */}
        <div className="xl:col-span-8 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    swap_horiz
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Giao dịch Lưu thông gần nhất
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Lượt mượn và trả tài liệu mới ghi nhận
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Mã phiếu</th>
                    <th className="py-2.5 px-3 font-semibold">Loại</th>
                    <th className="py-2.5 px-3 font-semibold">Độc giả</th>
                    <th className="py-2.5 px-3 font-semibold">
                      Tên tài liệu & ĐKCB
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                    <th className="py-2.5 px-3 font-semibold">Thủ thư</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {recentLoans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-on-surface-variant"
                      >
                        Chưa có giao dịch lưu thông nào gần đây.
                      </td>
                    </tr>
                  ) : (
                    recentLoans.map((item, idx) => {
                      const timeStr = item.time
                        ? new Date(item.time).toLocaleString("vi-VN")
                        : "";
                      const isBorrow = item.type === "mượn";
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-2.5 px-3 font-code-md text-code-md font-semibold text-primary">
                            {item.code}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-sm font-label-sm text-label-sm font-semibold ${
                                isBorrow
                                  ? "bg-primary-fixed text-primary"
                                  : "bg-secondary-fixed text-on-secondary-fixed"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-on-surface font-label-md text-label-md">
                              {item.patron?.fullName || "Khách vãng lai"}
                            </div>
                            <div className="font-code-md text-code-md text-outline">
                              {item.patron?.className}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-on-surface line-clamp-1">
                              {item.bookTitle}
                            </div>
                            <div className="font-code-md text-code-md text-outline font-mono">
                              ĐKCB: {item.accessionNo}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-on-surface-variant whitespace-nowrap text-xs">
                            {timeStr}
                          </td>
                          <td className="py-2.5 px-3 text-on-surface">
                            {item.librarian || "Hệ thống"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between border-t mt-3">
            <span>Hiển thị danh sách giao dịch thực tế từ cơ sở dữ liệu</span>
          </div>
        </div>

        {/* Cảnh báo quá hạn gấp 48 giờ */}
        <div className="xl:col-span-4 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-error-container flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[20px]">
                    notifications_active
                  </span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-1.5">
                    Cảnh báo quá hạn 48h
                    <span className="bg-error text-on-error font-code-md text-[11px] px-1.5 py-0.2 rounded-sm font-bold">
                      {dueSoonList.length}
                    </span>
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Ấn phẩm sắp đến hạn hoặc trễ hạn
                  </p>
                </div>
              </div>
              <button
                className="bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                onClick={() => onRemind(dueSoonList.map((i) => i.loanItemId))}
              >
                <span className="material-symbols-outlined text-[14px]">
                  send
                </span>
                Nhắc tất cả
              </button>
            </div>

            <div className="space-y-3 mt-4 max-h-[360px] overflow-y-auto">
              {dueSoonList.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">
                  Không có cảnh báo quá hạn nào trong 48 giờ tới.
                </div>
              ) : (
                dueSoonList.map((item) => (
                  <div
                    key={item.loanItemId}
                    className="p-3 bg-surface-container-low rounded-sm hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-md text-label-md font-bold text-on-surface">
                            {item.patron?.fullName || "Độc giả"}
                          </span>
                          <span className="bg-surface-container text-on-surface-variant font-code-md text-[11px] px-1 rounded-sm font-medium">
                            {item.patron?.className}
                          </span>
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface mt-0.5">
                          {item.bookTitle}
                        </div>
                        <div className="flex items-center gap-2 font-code-md text-code-md mt-1">
                          <span className="text-error font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">
                              schedule
                            </span>
                            {item.lateDays > 0
                              ? `Quá hạn: ${item.lateDays} ngày`
                              : `Còn lại: ${item.hoursLeft} giờ`}
                          </span>
                        </div>
                      </div>
                      <button
                        className="bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-sm transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm cursor-pointer"
                        onClick={() => onRemind([item.loanItemId])}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          sms
                        </span>
                        Nhắc nhở
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t">
            <span className="flex items-center gap-1 text-[12px]">
              <span className="material-symbols-outlined text-[16px] text-outline">
                info
              </span>
              Tự động quét từ hệ thống Strapi
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
