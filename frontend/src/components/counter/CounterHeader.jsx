import { Link } from 'react-router-dom';

const on = 'flex items-center gap-1.5 px-space-md py-1.5 rounded-md font-label-md text-label-md font-semibold bg-surface-container-lowest text-primary-container shadow-sm transition-all';
const off = 'flex items-center gap-1.5 px-space-md py-1.5 rounded-md font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all';

export default function CounterHeader({ active, count }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[24px]">{active === 'borrow' ? 'output' : 'input'}</span>
        </div>
        <div>
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">Nghiệp vụ Lưu thông</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Quét thẻ độc giả và mã vạch sách để xử lý mượn trả</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-md">
        <div className="flex items-center bg-surface-container p-1 rounded-lg">
          <Link to="/quay-muon-sach" className={active === 'borrow' ? on : off}>
            <span className="material-symbols-outlined text-[18px]">file_upload</span>Quầy Mượn Sách
          </Link>
          <Link to="/quay-tra-gia-han" className={active === 'return' ? on : off}>
            <span className="material-symbols-outlined text-[18px]">file_download</span>Quầy Trả &amp; Gia Hạn
          </Link>
        </div>
        <div className="text-right">
          <div className="font-label-sm text-label-sm text-outline uppercase font-semibold">Giao dịch ca trực</div>
          <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{count ?? 0} <span className="font-body-sm text-body-sm text-outline font-normal">phiếu</span></div>
        </div>
      </div>
    </div>
  );
}
