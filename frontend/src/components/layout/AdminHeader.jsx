import NavItem from "../common/NavItem";

export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest border-b border-surface-container z-40 flex items-center justify-between px-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-space-md">
        <div className="flex items-center bg-surface-container-low p-space-xs rounded-lg border border-surface-container">
          <NavItem
            to="tra-cuu-sach"
            className="px-space-md py-1 rounded text-on-surface-variant font-label-md text-label-md hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            Cổng Học sinh
          </NavItem>
          <NavItem
            to="dashboard-tong-quan"
            className="px-space-md py-1 rounded text-primary-container font-label-md text-label-md font-semibold bg-surface-container-lowest shadow-sm"
          >
            Quản trị Thư viện
          </NavItem>
        </div>
        <span className="text-outline">|</span>
        <span className="font-label-md text-label-md text-on-surface-variant hidden md:inline-block">
          THPT Chuyên Chu Văn An — Thư viện số
        </span>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="relative hidden sm:block w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            className="w-full h-8 pl-8 pr-3 bg-surface-container-low border border-surface-container rounded-sm font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:bg-surface-container-lowest transition-colors"
            placeholder="Tra cứu ISBN, bạn đọc, đầu sách..."
            type="text"
          />
        </div>
        <button
          className="relative p-space-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          title="Thông báo hệ thống"
          onClick={() => toast("Thông báo hệ thống")}
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[18px]">
            person
          </span>
        </div>
      </div>
    </header>
  );
}
