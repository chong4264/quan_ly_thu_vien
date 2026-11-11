import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/auth';
import { createBorrowRequest } from '../../../lib/loan-requests';

export default function RequestButton({ book }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const lock = useRef(false);
  if (!['authenticated', 'reader'].includes(user?.role?.type)) return null;
  if (book.referenceOnly || !book.allowHomeLoan || book.availableCopies < 1 || ['restricted', 'discontinued'].includes(book.status)) return null;

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await createBorrowRequest(book.documentId, note.trim()); setSent(true); setOpen(false); }
    catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }

  return <div className="space-y-2">
    {sent ? <p role="status" className="text-secondary text-sm">Đã gửi yêu cầu. Mang thẻ đến quầy để thủ thư kiểm tra và giao sách.</p> :
      <button type="button" onClick={() => setOpen(!open)} disabled={busy} aria-expanded={open} className="w-full h-10 bg-secondary text-on-secondary rounded-sm font-semibold disabled:opacity-50">Đăng ký mượn online</button>}
    {open && !sent && <form onSubmit={submit} className="space-y-2 p-3 bg-surface-container-low rounded-sm">
      <label className="block text-sm font-medium">Ghi chú cho thủ thư (không bắt buộc)
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} disabled={busy} rows={2} className="w-full mt-1 p-2 border border-outline-variant rounded-sm bg-surface-container-lowest" />
      </label>
      <p className="text-sm text-on-surface-variant">Yêu cầu chưa giữ chỗ bản sao. Hạn trả bắt đầu khi thủ thư giao sách tại quầy.</p>
      <button disabled={busy} className="w-full h-10 bg-primary text-on-primary rounded-sm disabled:opacity-50">{busy ? 'Đang gửi…' : 'Gửi yêu cầu'}</button>
    </form>}
    {error && <p role="alert" className="text-error text-sm">{error}</p>}
    <Link to="/yeu-cau-muon" className="block text-center text-sm text-primary underline">Theo dõi yêu cầu mượn của tôi</Link>
  </div>;
}
