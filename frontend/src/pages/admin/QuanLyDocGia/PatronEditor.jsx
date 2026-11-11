import { useEffect, useRef, useState } from 'react';
import { getPatron, patronForm, patronOptions, savePatron } from '../../../lib/patrons';

const control = 'w-full h-10 px-3 border border-outline-variant rounded-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary';
const button = 'px-4 py-2 rounded-sm border border-outline-variant hover:bg-surface-container disabled:opacity-50';
const statuses = { active: 'Đang hoạt động', warning: 'Cảnh báo', locked: 'Khóa thẻ', expired: 'Hết hạn' };
const typeName = (name) => name?.replace(/Học sinh/g, 'Sinh viên').replace(/Giáo viên/g, 'Giảng viên') || 'Chưa phân nhóm';

export default function PatronEditor({ documentId, onClose, onSaved }) {
  const [state, setState] = useState({ loading: true, error: '', form: null, patron: null, types: [], users: [] });
  const [search, setSearch] = useState('');
  const [userResult, setUserResult] = useState({ search: '', users: [], error: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const busy = useRef(false);
  const form = state.form;

  useEffect(() => {
    let active = true;
    Promise.all([documentId ? getPatron(documentId) : Promise.resolve({ data: null }), patronOptions()])
      .then(([response, options]) => {
        if (active) setState({ loading: false, error: '', patron: response.data, form: patronForm(response.data || {}), types: options.patronTypes, users: options.users });
      }).catch((error) => { if (active) setState((s) => ({ ...s, loading: false, error: error.message })); });
    return () => { active = false; };
  }, [documentId]);

  useEffect(() => {
    if (!search.trim()) return;
    let active = true;
    const timer = setTimeout(() => {
      patronOptions(search.trim()).then((response) => {
        if (active) setUserResult({ search, users: response.users, error: '' });
      }).catch((error) => { if (active) setUserResult({ search, users: [], error: error.message }); });
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  const usersLoading = !!search.trim() && userResult.search !== search;
  const users = search.trim() ? (usersLoading ? [] : userResult.users) : state.users;
  const userChoices = selectedUser && !users.some((user) => user.id === selectedUser.id) ? [selectedUser, ...users] : users;
  const change = (event) => setState((s) => ({ ...s, form: { ...s.form, [event.target.name]: event.target.value } }));

  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await savePatron(documentId, form);
      onSaved(documentId ? 'Đã cập nhật hồ sơ độc giả' : 'Đã thêm độc giả');
    } catch (error) { setSaveError(error.message); setSaving(false); }
    finally { busy.current = false; }
  }

  return (
    <section className="rounded-sm bg-surface-container-lowest shadow-sm p-5 space-y-4" aria-label={documentId ? 'Chỉnh sửa độc giả' : 'Thêm độc giả'}>
      <div className="flex justify-between items-center gap-3"><h2 className="text-xl font-bold">{documentId ? 'Chỉnh sửa hồ sơ độc giả' : 'Thêm độc giả'}</h2><button type="button" onClick={onClose} disabled={saving} className={button}>Đóng</button></div>
      {state.loading && <p role="status">Đang tải hồ sơ…</p>}
      {state.error && <p role="alert" className="text-error">{state.error}</p>}
      {form && <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={saving} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 disabled:opacity-70">
          <label className="space-y-1"><span className="block text-sm">Mã sinh viên / cán bộ *</span><input name="studentCode" value={form.studentCode} onChange={change} required maxLength={60} className={control} /></label>
          <label className="space-y-1"><span className="block text-sm">Họ tên *</span><input name="fullName" value={form.fullName} onChange={change} required maxLength={150} className={control} /></label>
          <label className="space-y-1"><span className="block text-sm">Lớp / đơn vị</span><input name="className" value={form.className} onChange={change} maxLength={150} className={control} /></label>
          <label className="space-y-1"><span className="block text-sm">Nhóm độc giả *</span><select name="patronType" value={form.patronType} onChange={change} required className={control}><option value="">Chọn nhóm độc giả</option>{state.types.map((type) => <option key={type.documentId} value={type.documentId}>{typeName(type.name)} · {type.maxBooks} cuốn / {type.loanDays} ngày</option>)}</select></label>
          <label className="space-y-1"><span className="block text-sm">Mã thẻ thư viện</span><input name="cardBarcode" value={form.cardBarcode} onChange={change} maxLength={100} className={control} placeholder="Có thể tra cứu bằng mã sinh viên tại quầy" /></label>
          <label className="space-y-1"><span className="block text-sm">Trạng thái thẻ</span><select name="cardStatus" value={form.cardStatus} onChange={change} className={control}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="space-y-1"><span className="block text-sm">Ngày hết hạn thẻ</span><input type="date" name="cardExpiresAt" value={form.cardExpiresAt} onChange={change} className={control} /></label>
          <label className="space-y-1"><span className="block text-sm">Email liên hệ</span><input type="email" name="email" value={form.email} onChange={change} maxLength={254} className={control} /></label>
          <label className="space-y-1"><span className="block text-sm">Số điện thoại</span><input name="phone" value={form.phone} onChange={change} maxLength={30} className={control} /></label>
          <label className="space-y-1 md:col-span-2 lg:col-span-3"><span className="block text-sm">Địa chỉ</span><textarea name="address" value={form.address} onChange={change} maxLength={500} className={`${control} h-20 py-2`} /></label>
        </fieldset>
        <fieldset disabled={saving} className="border border-outline-variant rounded-sm p-4 space-y-3">
          <legend className="px-2 font-medium">Tài khoản truy cập thư viện</legend>
          {state.patron?.user ? <>
            <p>{state.patron.user.username} · {state.patron.user.email}</p>
            <p className="text-sm text-on-surface-variant">Liên kết tài khoản được giữ cố định để bảo vệ lịch sử mượn.</p>
            {state.patron.user.blocked && <p className="text-error">Tài khoản đăng nhập bị chặn. Quản trị viên có thể mở tại Strapi → User → Blocked.</p>}
          </> : <>
            <p className="text-sm text-on-surface-variant">Liên kết tài khoản User đã tạo trong Strapi để độc giả xem hồ sơ và mượn online. Hồ sơ chưa liên kết vẫn dùng được tại quầy.</p>
            <label className="block space-y-1"><span className="block text-sm">Tìm tài khoản chưa liên kết</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className={control} placeholder="Tên đăng nhập hoặc email" /></label>
            <label className="block space-y-1"><span className="block text-sm">Tài khoản</span><select name="userId" value={form.userId} onChange={(event) => { change(event); setSelectedUser(users.find((user) => user.id === Number(event.target.value)) || null); }} className={control}><option value="">Chưa liên kết tài khoản</option>{userChoices.map((user) => <option key={user.id} value={user.id}>{user.username} · {user.email}{user.blocked ? ' (đang bị chặn)' : ''}</option>)}</select></label>
            {usersLoading && <p className="text-sm" role="status">Đang tìm tài khoản…</p>}
            {!usersLoading && search.trim() && userResult.error && <p role="alert" className="text-error">{userResult.error}</p>}
          </>}
        </fieldset>
        {state.patron?.state && <p className="text-sm text-on-surface-variant">Đang mượn {state.patron.state.borrowingCount} cuốn · Quá hạn {state.patron.state.overdueCount} cuốn · Phí chưa thanh toán {Number(state.patron.state.unpaidFine).toLocaleString('vi-VN')} đ. {state.patron.state.blockReason}</p>}
        {saveError && <p role="alert" className="p-3 bg-error-container text-on-error-container">{saveError}</p>}
        <div className="flex gap-3"><button className={`${button} bg-primary text-on-primary`} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu hồ sơ'}</button><button type="button" className={button} disabled={saving} onClick={onClose}>Hủy</button></div>
      </form>}
    </section>
  );
}
