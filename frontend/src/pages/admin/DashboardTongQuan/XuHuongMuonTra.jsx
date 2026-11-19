export default function XuHuongMuonTra({
  trend = [],
  topCategories = [],
  overview,
}) {
  // 1. Tính toán biểu đồ cột Xu hướng mượn & trả (6 tháng)
  const chartData = trend.length > 0 ? trend : [];
  const maxVal = Math.max(
    10,
    ...chartData.map((d) => Math.max(d.borrowed || 0, d.returned || 0)),
  );
  const svgHeight = 195;

  // Tìm tháng cao điểm
  const peakMonth = chartData.reduce(
    (best, cur) => ((cur.borrowed || 0) > (best.borrowed || 0) ? cur : best),
    { label: "--", borrowed: 0 },
  );

  // 2. Tính toán Top 5 thể loại hot
  const maxCategoryBorrow = Math.max(
    1,
    ...topCategories.map((c) => c.borrowCount || 0),
  );
  const barColors = [
    "bg-primary",
    "bg-primary-container",
    "bg-secondary",
    "bg-surface-tint",
    "bg-outline",
  ];

  // 3. Tính toán tỷ lệ kho sách (Donut chart)
  const totalCopies = overview?.totalCopies || 0;
  const availablePct =
    totalCopies > 0 ? ((overview.availableCopies || 0) / totalCopies) * 100 : 0;
  const borrowedPct =
    totalCopies > 0 ? ((overview.borrowedCopies || 0) / totalCopies) * 100 : 0;
  const issueCount =
    (overview?.processingCopies || 0) + (overview?.lostCopies || 0);
  const issuePct = totalCopies > 0 ? (issueCount / totalCopies) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      {/* Cột 1: Biểu đồ Xu hướng Mượn & Trả */}
      <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Xu hướng Mượn & Trả tài liệu
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Thống kê lưu thông {chartData.length || 6} tháng gần nhất
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
              <span className="w-3 h-3 bg-secondary rounded-sm inline-block" />
              <span className="text-on-surface-variant font-medium">
                Lượt trả
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-64 relative flex items-end pt-4 pb-6 px-2">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 600 200"
          >
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="3,3"
              x1="0"
              x2="600"
              y1="0"
              y2="0"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="3,3"
              x1="0"
              x2="600"
              y1="50"
              y2="50"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="3,3"
              x1="0"
              x2="600"
              y1="100"
              y2="100"
            />
            <line
              className="text-surface-container"
              stroke="currentColor"
              strokeDasharray="3,3"
              x1="0"
              x2="600"
              y1="150"
              y2="150"
            />
            <line
              className="text-outline-variant"
              stroke="currentColor"
              strokeWidth="1.5"
              x1="0"
              x2="600"
              y1="195"
              y2="195"
            />

            {chartData.map((item, idx) => {
              const step = 600 / Math.max(1, chartData.length);
              const centerX = idx * step + step / 2;
              const borrowH = Math.round(
                ((item.borrowed || 0) / maxVal) * svgHeight,
              );
              const returnH = Math.round(
                ((item.returned || 0) / maxVal) * svgHeight,
              );

              return (
                <g key={item.label || idx}>
                  <rect
                    className="fill-primary-container transition-all hover:opacity-80"
                    x={centerX - 24}
                    y={svgHeight - borrowH}
                    width="22"
                    height={borrowH}
                    rx="1"
                  >
                    <title>{`${item.label}: ${item.borrowed} lượt mượn`}</title>
                  </rect>
                  <rect
                    className="fill-secondary transition-all hover:opacity-80"
                    x={centerX + 2}
                    y={svgHeight - returnH}
                    width="22"
                    height={returnH}
                    rx="1"
                  >
                    <title>{`${item.label}: ${item.returned} lượt trả`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>

          <div className="absolute inset-x-2 bottom-0 flex justify-between font-code-md text-code-md text-on-surface-variant font-medium pt-2">
            {chartData.map((item, idx) => (
              <span
                key={item.label || idx}
                className={`flex-1 text-center ${
                  idx === chartData.length - 1 ? "font-bold text-primary" : ""
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low px-3 py-2 rounded-sm mt-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">
              insights
            </span>
            {peakMonth.borrowed > 0 ? (
              <>
                Đỉnh điểm mượn sách rơi vào{" "}
                <strong>Tháng {peakMonth.label}</strong> với{" "}
                {peakMonth.borrowed.toLocaleString("vi-VN")} lượt mượn.
              </>
            ) : (
              "Chưa có dữ liệu lưu thông trong giai đoạn này."
            )}
          </span>
        </div>
      </div>

      {/* Cột 2: Top 5 thể loại hot */}
      <div className="lg:col-span-3 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Top 5 thể loại hot
            </h2>
            <span className="font-label-sm text-label-sm text-outline font-semibold uppercase">
              Lượt mượn
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Các chủ đề độc giả quan tâm nhất
          </p>

          {topCategories.length === 0 ? (
            <div className="text-body-sm text-outline py-6 text-center">
              Chưa có dữ liệu mượn sách
            </div>
          ) : (
            <div className="space-y-3.5">
              {topCategories.map((cat, idx) => {
                const widthPct = Math.max(
                  8,
                  Math.round(
                    ((cat.borrowCount || 0) / maxCategoryBorrow) * 100,
                  ),
                );
                return (
                  <div key={cat.categoryName || idx}>
                    <div className="flex items-center justify-between font-label-md text-label-md mb-1">
                      <span className="text-on-surface font-medium truncate flex items-center gap-1.5">
                        <span
                          className={`font-code-md text-code-md w-4 font-bold ${
                            idx === 0 ? "text-primary" : "text-outline"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        {cat.categoryName}
                      </span>
                      <span className="font-code-md text-code-md font-bold text-on-surface ml-2">
                        {(cat.borrowCount || 0).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-sm overflow-hidden">
                      <div
                        className={`h-full ${barColors[idx % barColors.length]} rounded-sm transition-all duration-500`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-3 font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between border-t-0">
          <span>
            Hiển thị: <strong>Top {topCategories.length}</strong>
          </span>
        </div>
      </div>

      {/* Cột 3: Tỷ lệ kho sách */}
      <div className="lg:col-span-2 bg-surface-container-lowest p-space-md rounded-sm shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
            Tỷ lệ kho sách
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
            Hiện trạng phân bổ tài liệu
          </p>

          <div className="relative flex items-center justify-center my-3">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
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
              <path
                className="text-error stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray={`${issuePct}, 100`}
                strokeDashoffset={`-${availablePct + borrowedPct}`}
                strokeLinecap="butt"
                strokeWidth="4.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {Math.round(availablePct)}%
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
                {availablePct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary-container rounded-sm" />
                Đang mượn ngoài
              </span>
              <span className="font-code-md text-code-md font-bold">
                {borrowedPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-error rounded-sm" />
                Hỏng / Mất / Xử lý
              </span>
              <span className="font-code-md text-code-md font-bold text-error">
                {issuePct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 font-label-sm text-label-sm text-outline uppercase tracking-wider text-center">
          Tổng kho: {totalCopies.toLocaleString("vi-VN")} bản
        </div>
      </div>
    </div>
  );
}
