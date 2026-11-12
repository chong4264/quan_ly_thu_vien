export default function Section3({
  patrons = [],
  loading = false,
  pagination = { page: 1, pageSize: 10, pageCount: 1, total: 0 },
  filters,
  setFilters,
  selectedIds = [],
  setSelectedIds,
  onPageChange,
  onPageSizeChange,
  onEditPatron,
  onBulkStatus,
}) {
  const allSelected =
    patrons.length > 0 &&
    patrons.every((p) => selectedIds.includes(p.documentId));

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(patrons.map((p) => p.documentId));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (docId) => {
    setSelectedIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderStatusBadge = (status) => {
    if (status === "locked") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-label-sm text-label-sm bg-[#FEF2F2] text-[#991B1B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
          Đã khóa
        </span>
      );
    }
    if (status === "lost") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-label-sm text-label-sm bg-[#FFFBEB] text-[#92400E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#92400E]" />
          Báo mất thẻ
        </span>
      );
    }
    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-label-sm text-label-sm bg-surface-container text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-outline" />
          Hết hạn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-label-sm text-label-sm bg-[#ECFDF5] text-[#065F46]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]" />
        Hoạt động
      </span>
    );
  };

  const startRecord =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  return (
    <>
      <div className="bg-surface-container-lowest rounded-sm shadow-sm p-space-md space-y-space-md">
        {/* Thanh tìm kiếm & Bộ lọc */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-space-sm justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-space-sm">
            <div className="md:col-span-6 relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                className="w-full h-9 pl-9 pr-3 bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary rounded-sm transition-all"
                placeholder="Tìm theo tên học sinh, mã HS, barcode thẻ thư viện, SĐT..."
                type="text"
                value={filters.q}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, q: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-3">
              <input
                className="w-full h-9 px-3 bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary rounded-sm"
                placeholder="Lọc theo lớp (VD: 12A1)..."
                type="text"
                value={filters.className}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, className: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-3">
              <div className="relative">
                <select
                  className="w-full h-9 pl-3 pr-8 bg-surface-container-low font-body-sm text-body-sm text-on-surface appearance-none focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary rounded-sm cursor-pointer"
                  value={filters.status || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="all">Tất cả trạng thái thẻ</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="locked">Bị khóa</option>
                  <option value="lost">Báo mất thẻ</option>
                  <option value="expired">Thẻ hết hạn</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              className="h-9 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Đặt lại bộ lọc"
              onClick={() => setFilters({ q: "", className: "", status: "" })}
            >
              <span className="material-symbols-outlined text-[16px]">
                filter_alt_off
              </span>
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Thanh thao tác hàng loạt */}
        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-3 py-2 rounded-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-on-surface">Đã chọn:</span>
              <span className="bg-primary-container text-on-primary px-1.5 py-0.2 rounded-sm font-code-md text-code-md">
                {selectedIds.length}
              </span>{" "}
              độc giả
            </span>
            <span className="text-outline">|</span>
            <button
              className="text-secondary hover:underline font-label-sm text-label-sm cursor-pointer"
              onClick={() => onBulkStatus(selectedIds, "unlock")}
            >
              Mở khóa thẻ đã chọn
            </button>
            <button
              className="text-error hover:underline font-label-sm text-label-sm cursor-pointer"
              onClick={() => onBulkStatus(selectedIds, "lock")}
            >
              Khóa thẻ được chọn
            </button>
          </div>
          <div className="text-outline">
            Hiển thị {startRecord} - {endRecord} của{" "}
            {pagination.total.toLocaleString("vi-VN")} bản ghi
          </div>
        </div>

        {/* Bảng dữ liệu độc giả */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-10">
                <th className="w-10 px-3 text-center">
                  <input
                    className="rounded-sm accent-primary-container cursor-pointer"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-3">Học sinh / Độc giả</th>
                <th className="px-3">Mã HS & Lớp</th>
                <th className="px-3">Mã Thẻ / Barcode RFID</th>
                <th className="px-3">Liên hệ (Email & SĐT Phụ huynh)</th>
                <th className="px-3">Sách đang mượn</th>
                <th className="px-3">Trạng thái</th>
                <th className="px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Đang tải dữ liệu độc giả từ hệ thống...
                  </td>
                </tr>
              ) : patrons.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-on-surface-variant"
                  >
                    Không tìm thấy độc giả nào phù hợp.
                  </td>
                </tr>
              ) : (
                patrons.map((patron) => {
                  const isLocked = patron.cardStatus === "locked";
                  const isChecked = selectedIds.includes(patron.documentId);
                  return (
                    <tr
                      key={patron.documentId}
                      className={`hover:bg-surface-container-low/70 transition-colors ${
                        isLocked ? "bg-error-container/10" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          className="row-checkbox rounded-sm accent-primary-container cursor-pointer"
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(patron.documentId)}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0">
                            {getInitials(patron.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                              {patron.fullName}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {patron.patronType?.name || "Độc giả"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-code-md text-code-md text-on-surface font-semibold">
                          {patron.studentCode}
                        </div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">
                          {patron.className}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-container font-code-md text-code-md text-on-surface rounded-sm">
                          <span className="material-symbols-outlined text-[14px] text-outline">
                            barcode
                          </span>
                          <span>{patron.cardBarcode || "Chưa cấp"}</span>
                        </div>
                        <div
                          className={`font-label-sm text-label-sm flex items-center gap-0.5 mt-0.5 ${
                            isLocked ? "text-error" : "text-secondary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isLocked ? "lock" : "sensors"}
                          </span>
                          {isLocked ? "Đã khóa cổng từ" : "RFID Sẵn sàng"}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-body-sm text-body-sm text-on-surface truncate max-w-[210px]">
                          {patron.email || patron.phone || "—"}
                        </div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">
                          {patron.parentPhone
                            ? `PH: ${patron.parentPhone} ${patron.parentName ? `(${patron.parentName})` : ""}`
                            : "Chưa có SĐT PH"}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                            {patron.borrowingCount || 0}
                            <span className="text-on-surface-variant text-body-sm font-normal">
                              {" "}
                              cuốn
                            </span>
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {patron.cardExpiresAt
                            ? `Hạn thẻ: ${new Date(patron.cardExpiresAt).toLocaleDateString("vi-VN")}`
                            : "Không thời hạn"}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {renderStatusBadge(patron.cardStatus)}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-primary rounded-sm transition-colors cursor-pointer"
                            title="Sửa / Xem chi tiết hồ sơ"
                            onClick={() => onEditPatron(patron)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              badge
                            </span>
                          </button>
                          {isLocked ? (
                            <button
                              className="p-1 hover:bg-surface-container text-secondary hover:text-secondary rounded-sm transition-colors cursor-pointer"
                              title="Mở khóa thẻ"
                              onClick={() =>
                                onBulkStatus([patron.documentId], "unlock")
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                lock_open
                              </span>
                            </button>
                          ) : (
                            <button
                              className="p-1 hover:bg-surface-container text-on-surface-variant hover:text-error rounded-sm transition-colors cursor-pointer"
                              title="Khóa thẻ"
                              onClick={() =>
                                onBulkStatus([patron.documentId], "lock")
                              }
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                lock
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
            <span>Hiển thị mỗi trang:</span>
            <select
              className="h-8 px-2 bg-surface-container-low border border-transparent font-code-md text-code-md text-on-surface rounded-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10 bạn đọc / trang</option>
              <option value={20}>20 bạn đọc / trang</option>
              <option value={50}>50 bạn đọc / trang</option>
              <option value={100}>100 bạn đọc / trang</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="h-8 w-8 flex items-center justify-center rounded-sm bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              disabled={pagination.page <= 1}
              title="Trang trước"
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_left
              </span>
            </button>

            <span className="px-3 font-label-md text-label-md text-on-surface">
              Trang {pagination.page} / {Math.max(1, pagination.pageCount)}
            </span>

            <button
              className="h-8 w-8 flex items-center justify-center rounded-sm bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              disabled={pagination.page >= pagination.pageCount}
              title="Trang sau"
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
