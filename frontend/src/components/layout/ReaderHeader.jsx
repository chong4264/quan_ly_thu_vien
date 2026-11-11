import { Link, useNavigate } from 'react-router-dom';
import NavItem from '../common/NavItem';
import UniversityBrand from '../common/UniversityBrand';
import LogoutButton from '../common/LogoutButton';
import { useAuth } from '../../context/auth';
import { displayName, roleName } from '../../lib/user-profile';

const links = [
  ['tra-cuu-sach', 'Tra cứu sách'], ['sach-dang-muon', 'Sách đang mượn'],
  ['yeu-cau-muon', 'Yêu cầu mượn'],
  ['lich-su-muon', 'Lịch sử mượn'], ['ho-so-ca-nhan', 'Hồ sơ cá nhân'],
];

export default function ReaderHeader() {
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  function search(event) {
    if (event.key !== 'Enter') return;
    const params = new URLSearchParams();
    if (event.currentTarget.value.trim()) params.set('q', event.currentTarget.value.trim());
    navigate('/tra-cuu-sach?' + params);
  }
  return (
    <header className="fixed top-0 z-50 w-full border-b border-surface-container bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 lg:px-margin-desktop">
        <Link to="/tra-cuu-sach" className="min-w-0"><UniversityBrand /></Link>
        <input aria-label="Tìm kiếm sách" className="hidden h-9 min-w-0 max-w-sm flex-1 rounded-sm border border-outline-variant bg-surface px-3 text-sm xl:block"
          type="search" placeholder="Tên sách, tác giả hoặc ISBN…" onKeyDown={search} />
        <div className="flex shrink-0 items-center gap-3">
          {isStaff && <Link to="/dashboard-tong-quan" className="hidden rounded-sm bg-surface-container-low px-3 py-2 text-sm text-primary lg:block">Quản trị thư viện</Link>}
          <Link to="/ho-so-ca-nhan" aria-label="Hồ sơ cá nhân" className="flex items-center gap-2">
            <span className="material-symbols-outlined rounded-full bg-primary p-2 text-on-primary" aria-hidden="true">person</span>
            <span className="hidden text-right text-sm md:block"><span className="block font-semibold">{displayName(user)}</span><span className="block text-xs text-on-surface-variant">{roleName(user)}</span></span>
          </Link>
          <LogoutButton compact />
        </div>
      </div>
      <nav aria-label="Điều hướng độc giả" className="border-t border-surface-container">
        <div className="mx-auto flex h-11 max-w-[1600px] items-center gap-6 overflow-x-auto px-4 lg:px-margin-desktop">
          {links.filter(([to]) => !isStaff || to !== 'yeu-cau-muon').map(([to, label]) => (
            <NavItem key={to} to={to} active="border-b-2 border-primary font-semibold text-primary"
              className="inline-flex h-full shrink-0 items-center text-sm text-on-surface-variant hover:text-primary">{label}</NavItem>
          ))}
        </div>
      </nav>
    </header>
  );
}
