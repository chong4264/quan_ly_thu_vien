import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { useToast } from '../../context/ToastContext';

export default function LogoutButton({ compact = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    const confirmed = await logout();
    navigate('/login', { replace: true });
    toast(confirmed ? 'Đã đăng xuất' : 'Đã đăng xuất trên thiết bị. Máy chủ chưa xác nhận kết thúc phiên.');
    setPending(false);
  }

  return (
    <button type="button" onClick={signOut} disabled={pending} title="Đăng xuất" aria-label="Đăng xuất"
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-outline-variant px-3 py-2 text-sm text-on-surface hover:bg-error-container hover:text-on-error-container disabled:opacity-50">
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
      {!compact && <span>{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}</span>}
    </button>
  );
}
