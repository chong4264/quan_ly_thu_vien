import { Link } from 'react-router-dom';
import NavItem from '../common/NavItem';
import UniversityBrand from '../common/UniversityBrand';
import LogoutButton from '../common/LogoutButton';
import { useAuth } from '../../context/auth';
import { displayName, roleName } from '../../lib/user-profile';

const groups = [
  ['Tổng quan', [['dashboard-tong-quan', 'dashboard', 'Dashboard tổng quan']]],
  ['Nghiệp vụ lưu thông', [
    ['quay-muon-sach', 'output', 'Quầy mượn sách'],
    ['quay-tra-gia-han', 'input', 'Quầy trả & Gia hạn'],
    ['phieu-muon-tra', 'receipt_long', 'Phiếu mượn trả'],
    ['quan-ly-yeu-cau-muon', 'online_prediction', 'Yêu cầu mượn online'],
  ]],
  ['Biên mục & Tài liệu', [
    ['quan-ly-dau-sach', 'menu_book', 'Quản lý đầu sách'],
    ['them-moi-sua-sach', 'add_circle', 'Thêm mới / Sửa sách'],
    ['quan-ly-ban-sao', 'layers', 'Quản lý bản sao'],
    ['quan-ly-the-loai', 'category', 'Quản lý thể loại'],
  ]],
  ['Độc giả & Thống kê', [
    ['quan-ly-doc-gia', 'badge', 'Quản lý độc giả'],
    ['bao-cao-thong-ke', 'bar_chart', 'Báo cáo thống kê'],
    ['cau-hinh-he-thong', 'settings', 'Cấu hình hệ thống'],
  ]],
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-surface-container bg-surface-container-lowest">
      <Link to="/dashboard-tong-quan" className="flex h-20 shrink-0 items-center border-b border-surface-container px-4">
        <UniversityBrand compact />
      </Link>
      <div className="flex-1 overflow-y-auto p-3">
        <nav aria-label="Điều hướng thủ thư" className="space-y-4">
          {groups.map(([title, links]) => (
            <div key={title}>
              <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-outline">{title}</p>
              {links.map(([to, icon, label]) => (
                <NavItem key={to} to={to} active="bg-primary-container text-on-primary font-semibold"
                  className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icon}</span>{label}
                </NavItem>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-surface-container bg-surface-container-low p-4">
        <Link to="/ho-so-ca-nhan" className="min-w-0 text-sm hover:text-primary" aria-label="Hồ sơ cá nhân">
          <p className="truncate font-semibold">{displayName(user)}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{roleName(user)}</p>
        </Link>
        <LogoutButton compact />
      </div>
    </aside>
  );
}
