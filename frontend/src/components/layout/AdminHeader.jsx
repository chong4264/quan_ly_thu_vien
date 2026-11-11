import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { displayName, roleName } from '../../lib/user-profile';
import LogoutButton from '../common/LogoutButton';

export default function AdminHeader() {
  const { user } = useAuth();
  return (
    <header className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-surface-container bg-surface-container-lowest px-4 shadow-sm">
      <Link to="/tra-cuu-sach" className="rounded-sm bg-surface-container-low px-3 py-2 text-sm text-primary hover:bg-surface-container">Cổng sinh viên</Link>
      <p className="hidden flex-1 truncate text-sm text-on-surface-variant xl:block">Đại học Công nghiệp Hà Nội · Thư viện số HaUI</p>
      <Link to="/ho-so-ca-nhan" className="hidden min-w-0 text-right text-sm sm:block" aria-label="Hồ sơ cá nhân">
        <p className="truncate font-semibold">{displayName(user)}</p>
        <p className="text-xs text-on-surface-variant">{roleName(user)}</p>
      </Link>
      <LogoutButton />
    </header>
  );
}
