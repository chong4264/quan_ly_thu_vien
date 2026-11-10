import { useToast } from '../../context/ToastContext';

export default function LoginHeader() {
  const toast = useToast();
  const soon = (msg) => (e) => { e.preventDefault(); toast(msg); };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">local_library</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-tight">EduLib LMS</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">THPT Chuyên Chu Văn An</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-space-lg">
          <a aria-current="page" className="transition-colors text-primary font-semibold" href="#" onClick={(e) => e.preventDefault()}>Đăng nhập</a>
          <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#" onClick={soon('Liên hệ thủ thư để được cấp tài khoản')}>Đăng ký tài khoản</a>
          <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#" onClick={soon('Liên hệ thủ thư để đặt lại mật khẩu')}>Khôi phục quyền truy cập</a>
        </nav>
        <div className="flex items-center gap-space-md">
          <button type="button" className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">language</span><span className="font-medium">VIE</span>
          </button>
          <a href="#" onClick={soon('Trung tâm hỗ trợ chưa mở')} title="Trung tâm hỗ trợ" className="flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">help_outline</span><span className="hidden sm:inline font-medium">Trợ giúp</span>
          </a>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
