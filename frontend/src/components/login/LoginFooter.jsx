export default function LoginFooter() {
  const stop = (e) => e.preventDefault();
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-space-lg">
      <div className="max-w-7xl mx-auto px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
          <span>© 2025 Thư viện số THPT Chuyên Chu Văn An • Cổng dịch vụ EduLib LMS</span>
        </div>
        <div className="flex items-center gap-space-lg font-label-md text-label-md">
          <a href="#" onClick={stop} className="flex items-center gap-space-xs hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">call</span><span>Hotline kỹ thuật: (024) 3823 3140</span>
          </a>
          <span className="hidden md:inline text-outline-variant">|</span>
          <a href="#" onClick={stop} className="hover:text-on-surface transition-colors">Chính sách thư viện</a>
          <a href="#" onClick={stop} className="hover:text-on-surface transition-colors">Hướng dẫn mượn trả</a>
        </div>
      </div>
    </footer>
  );
}
