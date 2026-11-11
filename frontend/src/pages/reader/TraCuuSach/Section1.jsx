import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { displayName, roleName } from '../../../lib/user-profile';

export default function Section1() {
  const { user } = useAuth();
  const patron = user?.profile?.patron;
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-on-surface">Chào mừng, {displayName(user)}</h1>
        <p className="mt-2 text-sm text-on-surface-variant">{roleName(user)}{patron?.className ? ' · ' + patron.className : ''}{patron?.studentCode ? ' · ' + patron.studentCode : ''}</p>
        <p className="mt-2 text-on-surface-variant">Tra cứu tài liệu phục vụ học tập, giảng dạy và nghiên cứu tại Đại học Công nghiệp Hà Nội.</p>
      </div>
      <Link to="/sach-dang-muon" className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-on-primary"><span className="material-symbols-outlined" aria-hidden="true">auto_stories</span>Xem sách đang mượn</Link>
    </section>
  );
}
