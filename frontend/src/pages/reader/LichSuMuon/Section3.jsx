export default function Section3({
  filters, counts, meta, search, loading,
  onSearch, onFilter, onRefresh, onClear,
}) {
  const hasFilter = !!search || filters.status !== 'all' || !!filters.from || !!filters.to;

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
      <div className="flex-1 flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm">
        <div className="relative w-full lg:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-surface-container-low rounded-sm font-body-sm text-body-sm text-on-surface placeholder-on-surface-variant focus:bg-surface-container-lowest focus:outline-none transition-all shadow-inner"
            placeholder="Tìm theo mã phiếu, tên sách, tác giả..."
            type="search"
            aria-label="Tìm kiếm lịch sử mượn"
          />
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative flex-1 sm:flex-initial min-w-[190px]">
            <select
              value={filters.status}
              onChange={(e) => onFilter({ status: e.target.value })}
              className="w-full h-9 pl-3 pr-8 bg-surface-container-low rounded-sm font-label-md text-label-md text-on-surface appearance-none focus:outline-none cursor-pointer"
              aria-label="Lọc trạng thái"
            >
              <option value="all">Tất cả trạng thái ({counts?.all ?? 0})</option>
              <option value="borrowing">Đang mượn ({counts?.borrowing ?? 0})</option>
              <option value="overdue">Quá hạn ({counts?.overdue ?? 0})</option>
              <option value="returned_ontime">Đã trả đúng hạn ({counts?.returned_ontime ?? 0})</option>
              <option value="returned_late">Đã trả trễ ({counts?.returned_late ?? 0})</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">expand_more</span>
          </div>

          <label className="flex items-center gap-1 bg-surface-container-low h-9 px-2 rounded-sm font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Từ</span>
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onFilter({ from: e.target.value })}
              className="bg-transparent font-code-md text-code-md text-on-surface focus:outline-none"
              aria-label="Ngày mượn từ"
            />
          </label>
          <label className="flex items-center gap-1 bg-surface-container-low h-9 px-2 rounded-sm font-label-sm text-label-sm text-on-surface-variant">
            <span>Đến</span>
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onFilter({ to: e.target.value })}
              className="bg-transparent font-code-md text-code-md text-on-surface focus:outline-none"
              aria-label="Ngày mượn đến"
            />
          </label>

          {hasFilter && (
            <button
              type="button"
              onClick={onClear}
              className="h-9 px-2 rounded-sm font-label-md text-label-md text-primary-container hover:bg-surface-container-low transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-space-sm justify-between xl:justify-end">
        <span className="font-label-md text-label-md text-on-surface-variant">
          Đang hiển thị <strong className="text-on-surface">{meta?.total ?? 0}</strong> / {counts?.all ?? 0} giao dịch
        </span>
        <button
          type="button"
          className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-sm transition-colors disabled:opacity-50"
          id="btn-refresh"
          title="Tải lại danh sách"
          onClick={onRefresh}
          disabled={loading}
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>sync</span>
        </button>
      </div>
    </div>
  );
}
