import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { deletePatron, getPatron, listPatrons, patronForm, savePatron } from '../../../lib/patrons';
import PatronEditor from './PatronEditor';

const statuses = { active: 'Đang hoạt động', warning: 'Cảnh báo', locked: 'Khóa thẻ', expired: 'Hết hạn' };
const control = 'w-full h-10 px-3 border border-outline-variant rounded-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary';
const button = 'px-4 py-2 rounded-sm border border-outline-variant hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed';
const primary = `${button} bg-primary text-on-primary border-transparent hover:bg-primary-container`;
const typeName = (name) => name?.replace(/Học sinh/g, 'Sinh viên').replace(/Giáo viên/g, 'Giảng viên') || 'Chưa phân nhóm';

export default function QuanLyDocGia() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const status = params.get('status') || '';
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ key: '', data: [], pagination: { total: 0, page: 1, pageCount: 1 }, error: '' });
  const [editor, setEditor] = useState(null);
  const [mutation, setMutation] = useState('');
  const busy = useRef(false);
  const requestKey = JSON.stringify([q, status, page, refresh]);
  const loading = result.key !== requestKey;

  useEffect(() => {
    let active = true;
    listPatrons({ q, status, page }).then((response) => {
      if (active) setResult({ key: requestKey, data: response.data, pagination: response.meta.pagination, error: '' });
    }).catch((error) => { if (active) setResult({ key: requestKey, data: [], pagination: { total: 0, page: 1, pageCount: 1 }, error: error.message }); });
    return () => { active = false; };
  }, [q, status, page, refresh, requestKey]);

  function search(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setParams({ q: String(fields.get('q')).trim(), status: fields.get('status') });
    setRefresh((n) => n + 1);
  }
  function goToPage(nextPage) { setParams({ q, status, page: nextPage }); }

  async function mutate(patron, action) {
    if (busy.current) return;
    const isDelete = action === 'delete';
    if (isDelete && !window.confirm(`Xóa hồ sơ “${patron.fullName}”? Hồ sơ có lịch sử mượn hoặc yêu cầu mượn sẽ không thể xóa.`)) return;
    busy.current = true;
    setMutation(patron.documentId);
    try {
      if (isDelete) await deletePatron(patron.documentId);
      else {
        const { data } = await getPatron(patron.documentId);
        await savePatron(patron.documentId, { ...patronForm(data), cardStatus: data.cardStatus === 'locked' ? 'active' : 'locked' });
      }
      toast(isDelete ? 'Đã xóa hồ sơ độc giả' : 'Đã cập nhật trạng thái thẻ');
      setRefresh((n) => n + 1);
    } catch (error) { toast(error.message); }
    finally { busy.current = false; setMutation(''); }
  }

  return (
    <div className="space-y-6 text-on-surface">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div><p className="text-sm text-on-surface-variant">BẠN ĐỌC & HỒ SƠ</p><h1 className="text-2xl font-bold mt-1">Quản lý độc giả</h1><p className="mt-2 text-on-surface-variant">Cấp thẻ, quản lý định mức và liên kết tài khoản thư viện HaUI.</p></div>
        <button type="button" className={primary} disabled={!!mutation || !!editor} onClick={() => setEditor({ id: '', key: Date.now() })}>Thêm độc giả</button>
      </header>
      {editor && <PatronEditor key={editor.key} documentId={editor.id} onClose={() => setEditor(null)} onSaved={(message) => { setEditor(null); setRefresh((n) => n + 1); toast(message); }} />}
      <section className="bg-surface-container-lowest rounded-sm shadow-sm p-5 space-y-4" aria-label="Danh sách độc giả">
        <form key={`${q}|${status}`} onSubmit={search} className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-60 space-y-1"><span className="block text-sm">Tìm độc giả</span><input type="search" name="q" defaultValue={q} className={control} placeholder="Họ tên, mã sinh viên, mã thẻ hoặc email" /></label>
          <label className="space-y-1"><span className="block text-sm">Trạng thái thẻ</span><select name="status" defaultValue={status} className={control}><option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button className={primary}>Tìm kiếm</button><button type="button" className={button} onClick={() => { setParams({}); setRefresh((n) => n + 1); }}>Đặt lại</button>
        </form>
        <p role="status" className="text-sm text-on-surface-variant">{loading ? 'Đang tải danh sách…' : `Tìm thấy ${result.pagination.total} độc giả`}</p>
        {!loading && result.error && <p role="alert" className="p-3 bg-error-container text-on-error-container">{result.error} <button type="button" className="underline" onClick={() => setRefresh((n) => n + 1)}>Thử lại</button></p>}
        <div className="overflow-x-auto" aria-busy={loading}>
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-container-low"><tr>{['Độc giả', 'Nhóm / Lớp / Đơn vị', 'Thẻ thư viện', 'Tài khoản liên kết', 'Thao tác'].map((label) => <th key={label} className="p-3 whitespace-nowrap">{label}</th>)}</tr></thead>
            <tbody>
              {!loading && !result.error && result.data.length === 0 && <tr><td colSpan={5} className="p-8 text-center">Chưa có độc giả phù hợp.</td></tr>}
              {!loading && result.data.map((patron) => <tr key={patron.documentId} className="border-b border-surface-container">
                <td className="p-3 min-w-48"><p className="font-semibold">{patron.fullName}</p><p className="text-on-surface-variant mt-1">{patron.studentCode}</p><p className="mt-1">{patron.phone || patron.email || '—'}</p></td>
                <td className="p-3"><p>{typeName(patron.patronType?.name)}</p><p className="mt-1 text-on-surface-variant">{patron.className || '—'}</p></td>
                <td className="p-3 whitespace-nowrap"><p>{statuses[patron.cardStatus] || patron.cardStatus}</p><p className="mt-1 text-on-surface-variant">{patron.cardBarcode || 'Chưa cấp mã thẻ'}</p><p className="mt-1 text-on-surface-variant">{patron.cardExpiresAt ? `Hạn thẻ ${patron.cardExpiresAt}` : 'Không đặt hạn thẻ'}</p></td>
                <td className="p-3"><p>{patron.user?.username || 'Chưa liên kết'}</p><p className="mt-1 text-on-surface-variant">{patron.user?.email || ''}</p>{patron.user?.blocked && <p className="text-error">Tài khoản bị chặn</p>}</td>
                <td className="p-3 min-w-44"><div className="flex flex-wrap gap-2">
                  <button type="button" className="text-primary underline p-1 disabled:opacity-50" disabled={!!mutation || !!editor} onClick={() => setEditor({ id: patron.documentId, key: patron.documentId + Date.now() })}>Xem / Sửa</button>
                  <button type="button" className="text-primary underline p-1 disabled:opacity-50" disabled={!!mutation || !!editor} onClick={() => mutate(patron, 'status')}>{mutation === patron.documentId ? 'Đang xử lý…' : patron.cardStatus === 'locked' ? 'Mở thẻ' : 'Khóa thẻ'}</button>
                  <button type="button" className="text-error underline p-1 disabled:opacity-50" disabled={!!mutation || !!editor} onClick={() => mutate(patron, 'delete')}>Xóa</button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <nav aria-label="Phân trang độc giả" className="flex justify-between items-center gap-3">
          <span className="text-sm">Trang {result.pagination.page} / {result.pagination.pageCount}</span>
          <div className="flex gap-2"><button type="button" className={button} disabled={loading || result.pagination.page <= 1} onClick={() => goToPage(result.pagination.page - 1)}>Trang trước</button><button type="button" className={button} disabled={loading || result.pagination.page >= result.pagination.pageCount} onClick={() => goToPage(result.pagination.page + 1)}>Trang sau</button></div>
        </nav>
      </section>
    </div>
  );
}
