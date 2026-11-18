import { useState } from "react";

export default function GiaoDichLuuThong({
  recentLoans = [],
  dueSoon = [],
  onRemind,
  loading,
}) {
  const [q, setQ] = useState("");

  const getInitials = (name) => {
    if (!name) return "ĐG";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatTime = (isoString) => {
    if (!isoString) return { time: "--:--", date: "--/--/----" };
    const d = new Date(isoString);
    return {
      time: d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: d.toLocaleDateString("vi-VN"),
    };
  };

  const filteredLoans = recentLoans.filter((item) => {
    if (!q.trim()) return true;
    const keyword = q.trim().toLowerCase();
    const searchStr = [
      item.code,
      item.patron?.fullName,
      item.patron?.className,
      item.bookTitle,
      item.accessionNo,
      item.librarian,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchStr.includes(keyword);
  });

  const handleRemindAll = () => {
    const ids = dueSoon.map((item) => item.loanItemId).filter(Boolean);
    onRemind?.(ids);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
      {/* Bảng trái: Giao dịch Lưu thông gần nhất */}
      <div className="xl:col-span-8 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
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
                  Lượt mượn và trả được ghi nhận mới nhất trên hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm">
              <div className="relative">
                <span className="material-symbols-outlined text-[16px] text-outline absolute left-2.5 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm tên, mã ĐKCB..."
                  className="pl-8 pr-3 py-1 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-primary w-48"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Độc giả</th>
                  <th className="py-2.5 px-3 font-semibold">Lớp / Đơn vị</th>
                  <th className="py-2.5 px-3 font-semibold">
                    Tên tài liệu & Mã ĐKCB
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                  <th className="py-2.5 px-3 font-semibold">Thủ thư</th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Loại GD
                  </th>
                </tr>
              </thead>
              <tbody className="divide-none">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-outline">
                      {loading
                        ? "Đang tải danh sách giao dịch..."
                        : "Không có giao dịch nào phù hợp"}
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((item, idx) => {
                    const { time, date } = formatTime(item.time);
                    const isBorrow = item.type === "mượn";

                    return (
                      <tr
                        key={`${item.code}-${idx}`}
                        className={`hover:bg-surface-container-low transition-colors ${
                          idx % 2 === 0
                            ? "bg-surface-container-lowest"
                            : "bg-surface-container-low/40"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold font-code-md text-[11px] ${
                                isBorrow
                                  ? "bg-surface-container-high text-primary"
                                  : "bg-secondary-fixed text-secondary"
                              }`}
                            >
                              {getInitials(item.patron?.fullName)}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface font-label-md text-label-md">
                                {item.patron?.fullName || "Khách vãng lai"}
                              </div>
                              <div className="font-code-md text-code-md text-outline">
                                {item.code}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-medium text-on-surface">
                          {item.patron?.className || "--"}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-medium text-on-surface line-clamp-1">
                            {item.bookTitle || "Tài liệu thư viện"}
                          </div>
                          <div className="font-code-md text-code-md text-on-surface-variant font-mono">
                            DKCB: {item.accessionNo || "--"}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-on-surface-variant whitespace-nowrap">
                          <div>{time}</div>
                          <div className="text-[11px] text-outline">{date}</div>
                        </td>

                        <td className="py-2.5 px-3 text-on-surface">
                          {item.librarian || "--"}
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isBorrow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm font-label-sm text-label-sm font-semibold bg-surface-container-highest text-primary">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1" />
                              Phiếu mượn
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm font-label-sm text-label-sm font-semibold bg-secondary-fixed text-on-secondary-fixed">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1" />
                              Đã trả sách
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between border-t-0 mt-3">
          <span>
            Hiển thị {filteredLoans.length} / {recentLoans.length} giao dịch gần
            nhất
          </span>
        </div>
      </div>

      {/* Cột phải: Cảnh báo quá hạn gấp 48 giờ */}
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
                  Cảnh báo hạn trả
                  <span className="bg-error text-on-error font-code-md text-[11px] px-1.5 py-0.2 rounded-sm font-bold">
                    {dueSoon.length}
                  </span>
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Sắp đến hạn trong 48h & đã quá hạn
                </p>
              </div>
            </div>

            <button
              disabled={dueSoon.length === 0}
              className="bg-error-container text-on-error-container hover:bg-error hover:text-on-error disabled:opacity-50 font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-sm transition-colors flex items-center gap-1"
              onClick={handleRemindAll}
            >
              <span className="material-symbols-outlined text-[14px]">
                send
              </span>
              Nhắc tất cả
            </button>
          </div>

          <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
            {dueSoon.length === 0 ? (
              <div className="p-6 text-center text-body-sm text-outline bg-surface-container-low rounded-sm">
                Không có độc giả nào sắp đến hạn hoặc quá hạn.
              </div>
            ) : (
              dueSoon.map((item) => {
                const isOverdue = (item.lateDays || 0) > 0;
                return (
                  <div
                    key={item.loanItemId}
                    className="p-3 bg-surface-container-low rounded-sm hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-label-md text-label-md font-bold text-on-surface">
                            {item.patron?.fullName || "Độc giả"}
                          </span>
                          {item.patron?.className && (
                            <span className="bg-surface-container text-on-surface-variant font-code-md text-[11px] px-1 rounded-sm font-medium">
                              {item.patron.className}
                            </span>
                          )}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface mt-0.5 line-clamp-1">
                          {item.bookTitle}
                        </div>
                        <div className="flex items-center gap-2 font-code-md text-code-md mt-1">
                          {isOverdue ? (
                            <span className="text-error font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">
                                schedule
                              </span>
                              Quá hạn: {item.lateDays} ngày
                            </span>
                          ) : (
                            <span className="text-tertiary font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">
                                hourglass_top
                              </span>
                              Còn lại: {item.hoursLeft} giờ
                            </span>
                          )}
                          {item.patron?.phone && (
                            <>
                              <span className="text-outline">|</span>
                              <span className="text-on-surface-variant">
                                {item.patron.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        className="bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-sm transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm"
                        onClick={() => onRemind?.([item.loanItemId])}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          sms
                        </span>
                        Nhắc nhở
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
          <span className="flex items-center gap-1 text-[12px]">
            <span className="material-symbols-outlined text-[16px] text-outline">
              info
            </span>
            Tự động lọc các phiếu trong ngưỡng 48h
          </span>
        </div>
      </div>
    </div>
  );
}
