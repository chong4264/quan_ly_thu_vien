import { useEffect, useState } from 'react';
import { assetUrl } from '../../../lib/api';
import { CONDITION, fmtDate, fmtTime, money } from '../../../lib/format';

function Cover({ row, className = 'w-9 h-12' }) {
  const [broken, setBroken] = useState(false);
  const src = assetUrl(row.coverUrl);
  return (
    <div className={`${className} bg-surface-container-low flex-shrink-0 rounded-sm overflow-hidden shadow-xs`}>
      {src && !broken ? (
        <img className="w-full h-full object-cover" src={src} alt={`Bìa sách ${row.title}`} onError={() => setBroken(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container to-inverse-surface text-on-primary">
          <span className="material-symbols-outlined text-[18px]">auto_stories</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ row }) {
  if (row.status === 'borrowing') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-surface-container-high text-primary-container font-label-md text-label-md font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
        Đang mượn{row.daysLeft != null ? ` (còn ${row.daysLeft} ngày)` : ''}
      </span>
    );
  }
  if (row.status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-error-container text-on-error-container font-label-md text-label-md font-semibold">
        <span className="material-symbols-outlined text-[14px]">warning</span>
        Quá hạn {row.lateDays} ngày
      </span>
    );
  }
  if (row.status === 'returned_late') {
    return (
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold w-fit">
          <span className="material-symbols-outlined text-[13px]">warning</span>
          Đã trả trễ {row.lateDays} ngày
        </span>
        {row.fine > 0 && (
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
            Phạt: {money(row.fine)} • {row.fineCollected ? 'Đã thu' : 'Chưa thu'}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-surface-container-low text-secondary font-label-md text-label-md font-semibold">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        Đã trả đúng hạn
      </span>
      {row.fine > 0 && (
        <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Phạt: {money(row.fine)}</span>
      )}
    </div>
  );
}

function DetailRow({ label, value, accent }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col">
      <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
      <span className={`font-label-md text-label-md font-semibold ${accent || 'text-on-surface'}`}>{value ?? '—'}</span>
    </div>
  );
}

function DetailModal({ row, onClose }) {
  if (!row) return null;
  const returned = row.isReturned;
  const receipt = row.returnReceipt;
  const fineStatus = returned
    ? row.fine > 0
      ? row.fineCollected ? 'Đã thu' : 'Chưa thu'
      : 'Không phát sinh'
    : 'Sẽ chốt khi trả sách';

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-space-md" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết phiếu mượn"
        className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-space-md p-space-lg border-b border-surface-container">
          <div className="flex gap-space-md min-w-0">
            <Cover row={row} className="w-16 h-24" />
            <div className="min-w-0">
              <h2 className="font-headline-md text-headline-md text-on-surface truncate">{row.title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{row.author || 'Chưa cập nhật tác giả'}</p>
              <p className="font-label-sm text-label-sm text-outline mt-0.5">
                {row.accessionNo || 'Chưa có ĐKCB'} • {row.categoryName || row.ddcMain || 'Chưa phân loại'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-surface-container text-on-surface-variant" aria-label="Đóng chi tiết">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between gap-space-sm flex-wrap">
            <span className="font-code-md text-code-md bg-surface-container px-2 py-1 rounded-sm font-semibold">{row.loanCode || '—'}</span>
            <StatusBadge row={row} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
            <DetailRow label="Mã phiếu mượn" value={row.loanCode} />
            <DetailRow label="Mã đăng ký cá biệt" value={row.accessionNo} />
            <DetailRow label="Mã vạch bản sao" value={row.barcode} />
            <DetailRow label="Ngày mượn" value={fmtDate(row.loanedAt)} />
            <DetailRow label="Hạn trả" value={fmtDate(row.dueDate)} />
            <DetailRow label="Ngày trả thực tế" value={row.returnedAt ? fmtDate(row.returnedAt) : '—'} />
            <DetailRow label="Số lần gia hạn" value={`${row.renewCount} / ${row.maxRenewals}`} />
            <DetailRow label="Mã biên nhận trả" value={receipt?.code || (returned ? 'Không có biên nhận' : 'Chưa trả sách')} />
            <DetailRow label="Tình trạng sách khi trả" value={row.returnCondition ? CONDITION[row.returnCondition] || row.returnCondition : '—'} />
            <DetailRow label={returned ? 'Tiền phạt đã ghi nhận' : 'Phạt tạm tính'} value={money(row.fine)} accent={row.fine > 0 ? 'text-error' : 'text-on-surface'} />
            <DetailRow label="Tình trạng thu phạt" value={fineStatus} accent={returned && row.fine > 0 && !row.fineCollected ? 'text-error' : 'text-on-surface'} />
            <DetailRow label="Biên nhận trả lúc" value={receipt?.returnedAt ? fmtTime(receipt.returnedAt) : '—'} />
          </div>

          {receipt?.note && (
            <div className="bg-surface-container-low rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <strong className="text-on-surface">Ghi chú biên nhận: </strong>{receipt.note}
            </div>
          )}
          {returned && !receipt && (
            <div className="bg-surface-container-low rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface-variant">
              Bản ghi trả sách cũ không có biên nhận đính kèm. Các thông tin ngày trả và phạt vẫn được giữ nguyên.
            </div>
          )}
        </div>

        <div className="p-space-md border-t border-surface-container flex justify-end">
          <button onClick={onClose} className="h-9 px-space-md rounded-sm bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md">Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default function Section4({
  payload, loading, error, onRetry, onPage, onPageSize, onClear,
}) {
  const [detail, setDetail] = useState(null);
  const rows = payload?.data ?? [];
  const meta = payload?.meta;
  const page = meta?.page ?? 1;
  const pageCount = meta?.pageCount ?? 1;
  const total = meta?.total ?? 0;
  const pageSize = meta?.pageSize ?? 10;
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  useEffect(() => {
    if (!detail) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setDetail(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail]);

  const pages = [];
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  for (let i = firstPage; i <= Math.min(pageCount, firstPage + 4); i += 1) pages.push(i);

  return (
    <>
      <div className="bg-surface-container-lowest rounded-none shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider h-11">
                <th className="py-2.5 px-4 font-semibold w-36">Mã phiếu mượn</th>
                <th className="py-2.5 px-4 font-semibold min-w-[280px]">Tài liệu &amp; Bản sao ĐKCB</th>
                <th className="py-2.5 px-4 font-semibold w-28">Ngày mượn</th>
                <th className="py-2.5 px-4 font-semibold w-28">Hạn trả</th>
                <th className="py-2.5 px-4 font-semibold w-28">Ngày trả</th>
                <th className="py-2.5 px-4 font-semibold w-24 text-center">Gia hạn</th>
                <th className="py-2.5 px-4 font-semibold w-48">Trạng thái</th>
                <th className="py-2.5 px-4 font-semibold w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading && !rows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined align-middle mr-1 animate-spin">progress_activity</span>
                    Đang tải lịch sử mượn…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <p className="font-body-sm text-body-sm text-error mb-2">{error}</p>
                    <button onClick={onRetry} className="h-8 px-3 rounded-sm bg-error text-on-error font-label-md text-label-md">Thử lại</button>
                  </td>
                </tr>
              )}

              {!loading && !error && !rows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] block mb-1">search_off</span>
                    <p className="font-body-sm text-body-sm">Không có giao dịch nào khớp bộ lọc hiện tại.</p>
                    <button onClick={onClear} className="mt-2 font-label-md text-label-md text-primary-container underline">Xóa bộ lọc</button>
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr key={row.loanItemId} className="hover:bg-surface-container-low transition-colors h-14 bg-surface-container-lowest">
                  <td className="py-3 px-4">
                    <span className="font-code-md text-code-md text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded-sm inline-block">
                      {row.loanCode || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Cover row={row} />
                      <div className="min-w-0">
                        <span className="font-label-lg text-label-lg font-semibold text-on-surface truncate block">{row.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-code-md text-code-md text-on-surface-variant font-medium">{row.accessionNo || '—'}</span>
                          <span className="text-outline text-[12px]">•</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{row.author || 'Chưa cập nhật tác giả'}</span>
                        </div>
                        {row.categoryName && <span className="font-label-sm text-label-sm text-outline">{row.categoryName}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-body-md text-body-md text-on-surface">{fmtDate(row.loanedAt)}</td>
                  <td className={`py-3 px-4 font-body-md text-body-md font-semibold ${row.status === 'overdue' ? 'text-error' : 'text-on-surface'}`}>{fmtDate(row.dueDate)}</td>
                  <td className={`py-3 px-4 font-body-md text-body-md ${row.status === 'returned_late' ? 'text-error' : 'text-on-surface'}`}>
                    {row.returnedAt ? fmtDate(row.returnedAt) : <span className="text-outline">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-1.5 py-0.5 rounded-sm bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {row.renewCount} lần
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge row={row} /></td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="p-1 text-on-surface-variant hover:text-primary-container hover:bg-surface-container-low rounded-sm transition-colors"
                      title="Chi tiết phiếu"
                      onClick={() => setDetail(row)}
                    >
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="h-8 px-2 bg-surface-container-low rounded-sm font-label-md text-label-md text-on-surface focus:outline-none"
            >
              <option value="10">10 bản ghi / trang</option>
              <option value="20">20 bản ghi / trang</option>
              <option value="50">50 bản ghi / trang</option>
            </select>
            <span>{start}-{end} trong tổng số <strong className="text-on-surface">{total}</strong> bản ghi</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-sm bg-surface-container-low text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-sm font-label-md text-label-md ${
                  p === page
                    ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPage(page + 1)}
              disabled={page >= pageCount}
              className="w-8 h-8 flex items-center justify-center rounded-sm bg-surface-container-low text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <DetailModal row={detail} onClose={() => setDetail(null)} />
    </>
  );
}
