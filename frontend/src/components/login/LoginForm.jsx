import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';

const ROLES = {
  reader: {
    tab: 'Sinh viên / Độc giả', icon: 'school', userIcon: 'account_circle',
    label: 'Tên đăng nhập / Email',
    placeholder: 'Nhập tên đăng nhập hoặc email tài khoản thư viện',
    hintIcon: 'info', hint: 'Sử dụng tài khoản thư viện đã được cấp',
    submit: 'Đăng nhập vào hệ thống',
  },
  staff: {
    tab: 'Cán bộ / Thủ thư', icon: 'badge', userIcon: 'badge',
    label: 'Mã Cán bộ / Tài khoản Thủ thư Quản trị',
    placeholder: 'Ví dụ: thuthu.haui',
    hintIcon: 'admin_panel_settings', hint: 'Phân quyền dành riêng cho Giảng viên, Cán bộ nhà trường & Thủ thư nghiệp vụ',
    submit: 'Đăng nhập Trang Quản trị Thư viện',
  },
};
const tabOn = 'bg-surface-container-lowest text-primary shadow-sm';
const tabOff = 'text-on-surface-variant hover:text-on-surface';
const inputCls = 'w-full h-9 pl-9 bg-surface text-on-surface rounded-sm font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm placeholder:text-outline-variant';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const userRef = useRef(null);
  const submitting = useRef(false);
  const [role, setRole] = useState('reader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null); // { icon, text, tone }
  const R = ROLES[role];

  const submit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const me = await login(username.trim(), password, remember, { requireStaff: role === 'staff' });
      navigate(role === 'staff' ? '/dashboard-tong-quan' : '/tra-cuu-sach', { replace: true });
      return me;
    } catch (err) {
      setError(err.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const scanCard = () => {
    setNotice({ icon: 'barcode_scanner', text: 'Đưa thẻ vào đầu đọc: mã thẻ sẽ tự điền vào ô tài khoản.' });
    userRef.current?.focus();
  };
  const sso = (name) => setNotice({ icon: 'info', text: `Đăng nhập qua ${name} chưa được cấu hình. Hãy dùng tài khoản thư viện.` });

  return (
    <div className="lg:col-span-6 p-space-lg sm:p-space-xl flex flex-col justify-center bg-surface-container-lowest">
      <div className="max-w-md w-full mx-auto space-y-space-lg">
        <div className="space-y-space-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Đăng nhập tài khoản</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Chọn chế độ đăng nhập đúng với tài khoản của bạn</p>
          </div>
          <div className="p-1 rounded-sm bg-surface-container-high flex items-center gap-1">
            {Object.entries(ROLES).map(([key, r]) => (
              <button key={key} type="button" disabled={busy} aria-pressed={role === key} onClick={() => { setRole(key); setError(''); }}
                className={`flex-1 py-1.5 px-space-sm rounded-sm font-label-md text-label-md transition-all flex items-center justify-center gap-space-xs ${role === key ? tabOn : tabOff}`}>
                <span className="material-symbols-outlined text-[18px]">{r.icon}</span><span>{r.tab}</span>
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <div className="p-space-sm rounded-sm bg-surface-container text-on-surface font-body-sm text-body-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">{notice.icon}</span><span>{notice.text}</span>
            </div>
            <button type="button" onClick={() => setNotice(null)} className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        <form className="space-y-space-md" onSubmit={submit}>
          <div className="space-y-space-xs">
            <label htmlFor="usernameInput" className="block font-label-lg text-label-lg text-on-surface">{R.label}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-space-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">{R.userIcon}</span>
              </div>
              <input id="usernameInput" ref={userRef} name="username" type="text" required autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)} placeholder={R.placeholder} className={`${inputCls} pr-space-md`} />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">{R.hintIcon}</span><span>{R.hint}</span>
            </p>
          </div>

          <div className="space-y-space-xs">
            <div className="flex items-center justify-between">
              <label htmlFor="passwordInput" className="block font-label-lg text-label-lg text-on-surface">Mật khẩu</label>
              <a className="font-label-md text-label-md text-primary hover:underline" href="#"
                onClick={(e) => { e.preventDefault(); setNotice({ icon: 'info', text: 'Liên hệ thủ thư (bộ phận thư viện) để đặt lại mật khẩu.' }); }}>Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-space-sm flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input id="passwordInput" name="password" required autoComplete="current-password" type={showPw ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu truy cập" className={`${inputCls} pr-10`} />
              <button type="button" title="Hiển thị hoặc ẩn mật khẩu" onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 right-0 pr-space-sm flex items-center text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-space-xs p-space-sm rounded-sm bg-error-container text-on-error-container font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">error</span><span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-space-xs cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded-sm accent-primary cursor-pointer" />
              <span className="font-label-md text-label-md text-on-surface-variant">Ghi nhớ phiên trên thiết bị này</span>
            </label>
            <div className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
              <span className="material-symbols-outlined text-[14px]">shield</span><span>Tài khoản thư viện HaUI</span>
            </div>
          </div>

          <button type="submit" disabled={busy}
            className="w-full h-9 px-space-md rounded-sm bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-space-xs shadow-sm disabled:opacity-70">
            <span className={`material-symbols-outlined text-[18px] ${busy ? 'animate-spin' : ''}`}>{busy ? 'progress_activity' : 'login'}</span>
            <span>{busy ? 'Đang xác thực thông tin...' : R.submit}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="w-full h-[1px] bg-surface-container-high" />
          <span className="absolute px-space-md bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hoặc tiếp tục với</span>
        </div>

        <div className="space-y-space-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <button type="button" onClick={() => sso('Microsoft 365 Education')}
              className="h-9 px-space-sm rounded-sm bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center gap-space-xs font-label-md text-label-md shadow-sm">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect fill="#f25022" height="9" width="9" x="1" y="1" /><rect fill="#7fba00" height="9" width="9" x="11" y="1" />
                <rect fill="#00a4ef" height="9" width="9" x="1" y="11" /><rect fill="#ffb900" height="9" width="9" x="11" y="11" />
              </svg>
              <span className="truncate">Microsoft 365 Edu</span>
            </button>
            <button type="button" onClick={() => sso('tài khoản nhà trường')}
              className="h-9 px-space-sm rounded-sm bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center justify-center gap-space-xs font-label-md text-label-md shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">school</span><span className="truncate">Tài khoản nhà trường</span>
            </button>
          </div>
          <button type="button" onClick={scanCard}
            className="w-full h-9 px-space-md rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center justify-center gap-space-xs font-label-md text-label-md">
            <span className="material-symbols-outlined text-[20px] text-secondary">contactless</span>
            <span>Quét thẻ thư viện / Mã vạch RFID để đăng nhập nhanh</span>
          </button>
        </div>

        <div className="p-space-md rounded-sm bg-surface-container-low text-center space-y-1">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Bạn là sinh viên mới trúng tuyển hoặc chưa có mã đọc?</p>
          <a href="#" onClick={(e) => { e.preventDefault(); setNotice({ icon: 'info', text: 'Liên hệ thủ thư để được cấp thẻ và tài khoản.' }); }}
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline">
            <span>Đăng ký mở thẻ thư viện trực tuyến</span><span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">domain</span><span>Thư viện HaUI</span></span>
          <a href="#" onClick={(e) => { e.preventDefault(); setNotice({ icon: 'info', text: 'Liên hệ thủ thư để được cấp lại mã thẻ.' }); }}
            className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">contact_support</span><span>Yêu cầu cấp lại mã thẻ</span>
          </a>
        </div>
      </div>
    </div>
  );
}
