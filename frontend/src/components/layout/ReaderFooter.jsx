import NavItem from '../common/NavItem';

export default function ReaderFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-lg"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-label-md text-label-md"><div>© 2025 THPT Chuyên Chu Văn An — Hệ thống Thư viện số EduLib LMS.</div><div className="flex items-center gap-space-md"><span className="font-label-sm text-label-sm text-outline">Hỗ trợ nghiệp vụ thư viện: (024) 3823 4567</span><span className="font-code-md text-code-md bg-surface-container-low px-space-sm py-0.5 rounded-sm border border-surface-container">v2.4.0</span></div></div></footer>
  );
}
