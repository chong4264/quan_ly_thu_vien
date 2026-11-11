import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import UniversityBrand from '../../../components/common/UniversityBrand';
import { displayName, roleName } from '../../../lib/user-profile';

export default function SachMoiNhapThang({ children }) {
  const { user } = useAuth();
  const patron = user?.profile?.patron;
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-8">{children}</div>
      <aside className="space-y-5 lg:col-span-4">
        <section className="space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <UniversityBrand compact />
          <div className="border-t border-surface-container pt-4">
            <h2 className="font-semibold text-on-surface">{displayName(user)}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{roleName(user)}</p>
            {patron?.studentCode && <p className="mt-1 text-sm text-on-surface-variant">Mã sinh viên / cán bộ · {patron.studentCode}</p>}
          </div>
          <div className="flex flex-col gap-3 text-sm text-primary">
            <Link to="/sach-dang-muon" className="hover:underline">Sách đang mượn</Link>
            <Link to="/lich-su-muon" className="hover:underline">Lịch sử mượn trả</Link>
            <Link to="/ho-so-ca-nhan" className="hover:underline">Hồ sơ cá nhân</Link>
          </div>
        </section>
        <section className="rounded-xl bg-surface-container-low p-6 text-on-surface">
          <h2 className="font-semibold">Học liệu đại học</h2>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">Tìm giáo trình và tài liệu chuyên ngành theo tên sách, tác giả, ISBN hoặc mã phân loại DDC. Thông tin bản sao và tình trạng mượn được hiển thị trong chi tiết tài liệu.</p>
        </section>
      </aside>
    </div>
  );
}
