import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/auth';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';
import { fmtDate, money } from '../../../lib/format';
import { displayName, roleName } from '../../../lib/user-profile';

const inputClass = 'w-full rounded-sm border border-outline-variant bg-surface px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60';
const statuses = { active: 'Hoạt động', warning: 'Cần lưu ý', locked: 'Đã khóa', expired: 'Hết hạn' };

function contactOf(profile) {
  return { fullName: profile?.patron?.fullName || '', phone: profile?.patron?.phone || '', address: profile?.patron?.address || '' };
}

function ProfileDetails({ user }) {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const savingRef = useRef(false);
  const [profile, setProfile] = useState(user.profile);
  const [state, setState] = useState(null);
  const [form, setForm] = useState(() => contactOf(user.profile));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    api('/patrons/me').then((data) => {
      if (!active) return;
      setProfile(data);
      setState(data.state);
      setForm(contactOf(data));
    }).catch((e) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  function change(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    if (savingRef.current || !profile?.linked) return;
    if (!form.fullName.trim()) { setSaveError('Vui lòng nhập họ tên'); return; }
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const data = await api('/patrons/me', { method: 'PUT', body: { data: form } });
      setProfile(data);
      setState(data.state);
      setForm(contactOf(data));
      await refreshUser();
      toast('Đã cập nhật hồ sơ cá nhân');
    } catch (e) {
      setSaveError(e.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const patron = profile?.patron;
  const accountFields = [
    ['Tên đăng nhập', user.username], ['Email đăng nhập', user.email],
    ['Vai trò', roleName(user)], ['Mã sinh viên / Cán bộ', patron?.studentCode],
    ['Lớp / Đơn vị', patron?.className], ['Mã thẻ thư viện', patron?.cardBarcode],
    ['Trạng thái thẻ', statuses[patron?.cardStatus] || 'Chưa cấp thẻ'],
    ['Hạn sử dụng thẻ', patron?.cardExpiresAt ? fmtDate(patron.cardExpiresAt) : 'Chưa thiết lập'],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 lg:px-8">
      <header className="flex items-center gap-4">
        <span className="material-symbols-outlined rounded-full bg-primary p-4 text-3xl text-on-primary" aria-hidden="true">person</span>
        <div><h1 className="text-2xl font-bold text-on-surface">Hồ sơ cá nhân</h1><p className="mt-1 text-on-surface-variant">{displayName(user)} · {roleName(user)}</p></div>
      </header>
      <section className="rounded-lg bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Thông tin tài khoản HaUI</h2>
        <dl className="grid gap-5 sm:grid-cols-2">
          {accountFields.map(([label, value]) => <div key={label}><dt className="text-sm text-on-surface-variant">{label}</dt><dd className="mt-1 break-words font-medium">{value || 'Chưa cập nhật'}</dd></div>)}
        </dl>
      </section>
      {loading && <p role="status">Đang tải hồ sơ thư viện…</p>}
      {error && <div role="alert" className="rounded-sm bg-error-container p-4 text-on-error-container"><p>{error}</p><button type="button" className="mt-2 underline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1); }}>Thử lại</button></div>}
      {!loading && !error && !profile?.linked && <p className="rounded-lg bg-surface-container-low p-4 text-on-surface-variant">Tài khoản chưa được liên kết hồ sơ thư viện. Liên hệ thủ thư để bổ sung mã sinh viên / cán bộ và thông tin thẻ.</p>}
      {!loading && !error && profile?.linked && (
        <>
          <section className="rounded-lg bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Thông tin cá nhân</h2>
            <form onSubmit={save} className="space-y-4">
              <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1"><span className="block text-sm font-medium">Họ và tên *</span><input name="fullName" value={form.fullName} onChange={change} required maxLength={150} autoComplete="name" className={inputClass} /></label>
                <label className="space-y-1"><span className="block text-sm font-medium">Số điện thoại</span><input name="phone" value={form.phone} onChange={change} type="tel" maxLength={30} autoComplete="tel" className={inputClass} /></label>
                <label className="space-y-1 sm:col-span-2"><span className="block text-sm font-medium">Địa chỉ liên hệ</span><textarea name="address" value={form.address} onChange={change} rows={3} maxLength={500} autoComplete="street-address" className={inputClass} /></label>
              </fieldset>
              {saveError && <p role="alert" className="rounded-sm bg-error-container p-3 text-on-error-container">{saveError}</p>}
              <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-sm bg-primary px-5 py-2 font-semibold text-on-primary disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu hồ sơ'}</button></div>
            </form>
          </section>
          <section className="rounded-lg bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Tình trạng mượn trả</h2>
            <dl className="grid gap-5 sm:grid-cols-3">
              <div><dt className="text-sm text-on-surface-variant">Sách đang mượn</dt><dd className="mt-1 text-xl font-semibold">{state?.borrowingCount ?? 0}</dd></div>
              <div><dt className="text-sm text-on-surface-variant">Sách quá hạn</dt><dd className="mt-1 text-xl font-semibold">{state?.overdueCount ?? 0}</dd></div>
              <div><dt className="text-sm text-on-surface-variant">Phí chưa thanh toán</dt><dd className="mt-1 text-xl font-semibold">{money(state?.unpaidFine)}</dd></div>
            </dl>
            {patron?.patronType && <p className="mt-5 text-sm text-on-surface-variant">Hạn mức trong hệ thống · {patron.patronType.maxBooks} cuốn · {patron.patronType.loanDays} ngày/lần mượn · Tối đa {patron.patronType.maxRenewals} lần gia hạn.</p>}
          </section>
        </>
      )}
    </div>
  );
}

export default function HoSoDocGia() {
  const { user } = useAuth();
  return <ProfileDetails key={user.id} user={user} />;
}
