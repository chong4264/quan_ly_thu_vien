export default function XuHuongMuonTra({
  trendData = [],
  topCategories = [],
  overview,
}) {
  const totalCopies = overview?.totalCopies || 1;
  const availableCopies = overview?.availableCopies || 0;
  const borrowedCopies = overview?.borrowedCopies || 0;

  const availablePct = Math.round((availableCopies / totalCopies) * 100);
  const borrowedPct = Math.round((borrowedCopies / totalCopies) * 100);
  const lostPct = Math.max(0, 100 - availablePct - borrowedPct);

  const maxTrendVal = Math.max(
    ...trendData.map((t) => Math.max(t.borrowed, t.returned)),
    10,
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Biểu đồ xu hướng mượn trả */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Xu hướng Mượn & Trả tài liệu
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Thống kê lưu thông theo các tháng gần nhất
              </p>
            </div>
            <div className="flex items-center gap-space-md font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary-container rounded-sm inline-block" />
                <span className="text-on-surface-variant font-medium">
                  Lượt mượn
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-secondary-fixed-dim rounded-sm inline-block" />
                <span className="text-on-surface-variant font-medium">
                  Lượt trả
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-64 relative flex items-end pt-4 pb-6 px-2">
            {trendData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
                Đang cập nhật dữ liệu xu hướng...
              </div>
            ) : (
              <div className="w-full h-full flex items-end justify-around gap-2">
                {trendData.map((item, idx) => {
                  const bHeight = Math.min(
                    180,
                    Math.round((item.borrowed / maxTrendVal) * 160),
                  );
                  const rHeight = Math.min(
                    180,
                    Math.round((item.returned / maxTrendVal) * 160),
                  );
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center flex-1 h-full justify-end group relative"
                    >
                      <div className="flex items-end gap-1 w-full justify-center h-[180px]">
                        <div
                          className="w-3 bg-primary-container rounded-t-sm transition-all hover:opacity-80"
                          style={{ height: `${bHeight}px` }}
                          title={`Mượn: ${item.borrowed}`}
                        />
                        <div
                          className="w-3 bg-secondary-fixed-dim rounded-t-sm transition-all hover:opacity-80"
                          style={{ height: `${rHeight}px` }}
                          title={`Trả: ${item.returned}`}
                        />
                      </div>
                      <span className="font-code-md text-code-md text-on-surface-variant font-medium pt-2 text-[11px] truncate">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low px-3 py-2 rounded-sm mt-2">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">
                insights
              </span>
              Dữ liệu được tổng hợp trực tiếp từ hệ thống kho lưu thông thực tế.
            </span>
          </div>
        </div>

        {/* Top 5 thể loại hot */}
        <div className="lg:col-span-3 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Top thể loại hot
              </h2>
              <span className="font-label-sm text-label-sm text-outline font-semibold uppercase">
                Lượt mượn
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Các chủ đề độc giả quan tâm nhất
            </p>

            <div className="space-y-3.5">
              {topCategories.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Chưa có dữ liệu thống kê thể loại.
                </p>
              ) : (
                topCategories.map((cat, idx) => {
                  const maxCount = topCategories[0]?.borrowCount || 1;
                  const pct = Math.round((cat.borrowCount / maxCount) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between font-label-md text-label-md mb-1">
                        <span className="text-on-surface font-medium truncate flex items-center gap-1.5">
                          <span className="font-code-md text-code-md w-4 font-bold text-primary">
                            #{idx + 1}
                          </span>
                          {cat.categoryName}
                        </span>
                        <span className="font-code-md text-code-md font-bold text-on-surface">
                          {cat.borrowCount}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-sm"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between border-t-0">
            <span>Danh mục phổ biến</span>
          </div>
        </div>

        {/* Tỷ lệ kho sách */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
              Tỷ lệ kho sách
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Hiện trạng phân bổ tài liệu
            </p>

            <div className="relative flex items-center justify-center my-3">
              <svg
                className="w-36 h-36 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.5"
                />
                <path
                  className="text-secondary stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${availablePct}, 100`}
                  strokeLinecap="butt"
                  strokeWidth="4.5"
                />
                <path
                  className="text-primary-container stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${borrowedPct}, 100`}
                  strokeDashoffset={`-${availablePct}`}
                  strokeLinecap="butt"
                  strokeWidth="4.5"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {availablePct}%
                </span>
                <span className="font-label-sm text-label-sm text-outline font-semibold">
                  TRÊN KỆ
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-on-surface font-body-sm text-body-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-secondary rounded-sm" />
                  Trên kệ sẵn sàng
                </span>
                <span className="font-code-md text-code-md font-bold">
                  {availablePct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary-container rounded-sm" />
                  Đang mượn ngoài
                </span>
                <span className="font-code-md text-code-md font-bold">
                  {borrowedPct}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-error rounded-sm" />
                  Xử lý / Mất
                </span>
                <span className="font-code-md text-code-md font-bold text-error">
                  {lostPct}%
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 font-label-sm text-label-sm text-outline uppercase tracking-wider text-center">
            Tổng bản sao: {totalCopies}
          </div>
        </div>
      </div>
    </>
  );
}
