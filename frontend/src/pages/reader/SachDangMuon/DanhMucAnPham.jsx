import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../../../lib/api';
import { fmtDate, money } from '../../../lib/format';
import { renewMyLoan } from '../../../lib/reader-loans';
import { useToast } from '../../../context/ToastContext';

const CARD_STATUS = {
  active: 'Đang hoạt động',
  warning: 'Cần chú ý',
  locked: 'Đang bị khóa',
  expired: 'Đã hết hạn',
};

function BookCover({ item }) {
  const [broken, setBroken] = useState(false);
  const src = assetUrl(item.coverUrl);
  return (
    <div className="w-24 sm:w-full h-36 sm:h-48 rounded shadow-sm overflow-hidden bg-surface-container">
      {src && !broken ? (
        <img
          className="w-full h-full object-cover"
          src={src}
          alt={`Bìa sách ${item.title}`}
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-container to-inverse-surface text-on-primary px-2 text-center">
          <span className="material-symbols-outlined text-[28px]">auto_stories</span>
          <span className="font-label-sm text-label-sm line-clamp-2">{item.title}</span>
        </div>
      )}
    </div>
  );
}

function RenewButton({ item, busy, onRenew }) {
  const disabled = busy || !item.canRenew;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRenew(item)}
        title={item.renewBlockedReason || `Gia hạn thêm ${item.renewDays} ngày`}
        className={`font-label-md text-label-md px-space-md h-9 rounded-sm flex items-center justify-center gap-space-xs transition-colors shadow-sm ${
          disabled
            ? 'bg-surface-container-high text-outline cursor-not-allowed'
            : 'bg-primary-container hover:bg-primary text-on-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">{item.canRenew ? 'update' : 'lock'}</span>
        <span>{busy ? 'Đang gia hạn…' : 'Gia hạn trực tuyến'}</span>
      </button>
      {item.renewBlockedReason && (
        <span className="font-label-sm text-label-sm text-on-surface-variant">{item.renewBlockedReason}</span>
      )}
    </div>
  );
}

export default function DanhMucAnPham({ payload, loading, error, onRetry, onReload }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const linked = payload?.linked;
  const items = payload?.data ?? [];
  const patron = payload?.patron;
  const settings = payload?.settings;
  const type = patron?.patronType;

  const renew = async (item) => {
    setBusyId(item.loanItemId);
    try {
      const result = await renewMyLoan(item.loanItemId);
      toast(`Gia hạn thành công, hạn mới ${fmtDate(result.newDueDate)}`);
    } catch (e) {
      toast(e.message);
    } finally {
      await onReload();
      setBusyId(null);
    }
  };

  if (error && !payload) {
    return (
      <div className="bg-error-container text-on-error-container rounded-xl p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-error">cloud_off</span>
          <div>
            <p className="font-body-md text-body-md font-semibold">Không tải được danh sách sách đang mượn</p>
            <p className="font-body-sm text-body-sm mt-0.5">{error}</p>
          </div>
        </div>
        <button onClick={onRetry} className="h-9 px-space-md rounded-sm bg-error text-on-error font-label-md text-label-md">Thử lại</button>
      </div>
    );
  }

  if (loading && !payload) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {[0, 1].map((n) => (
            <div key={n} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm animate-pulse flex gap-space-lg">
              <div className="w-24 h-36 rounded bg-surface-container" />
              <div className="flex-1 flex flex-col gap-3 py-2">
                <div className="h-4 w-32 bg-surface-container rounded" />
                <div className="h-6 w-2/3 bg-surface-container rounded" />
                <div className="h-4 w-1/2 bg-surface-container rounded" />
                <div className="h-16 w-full bg-surface-container rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm animate-pulse h-72" />
      </div>
    );
  }

  if (linked === false) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm text-center flex flex-col items-center gap-space-md">
          <div className="w-14 h-14 rounded-full bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">badge</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Chưa có hồ sơ độc giả</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl mx-auto">
              Tài khoản đăng nhập chưa được gắn với hồ sơ Patron trong Strapi. Thủ thư cần mở hồ sơ độc giả và chọn đúng tài khoản ở trường <strong>user</strong> để bật các tính năng mượn sách cá nhân.
            </p>
          </div>
          <Link to="/tra-cuu-sach" className="h-9 px-space-md rounded-sm bg-primary-container text-on-primary font-label-md text-label-md flex items-center">
            Tra cứu danh mục sách
          </Link>
        </div>
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Cần hỗ trợ?</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Liên hệ bàn thủ thư tại Thư viện để được liên kết tài khoản với hồ sơ độc giả.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
      <div className="lg:col-span-8 flex flex-col gap-space-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Danh mục ấn phẩm đang lưu giữ</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Thông tin chi tiết ấn phẩm, mã đăng ký cá biệt và trạng thái kiểm kê.</p>
          </div>
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider bg-surface-container px-space-sm py-1 rounded-sm">
            {loading ? 'Đang cập nhật…' : `${items.length} bản sao`}
          </span>
        </div>

        {error && payload && (
          <div className="bg-error-container text-on-error-container px-space-md py-space-sm rounded-lg font-body-sm text-body-sm flex items-center justify-between gap-space-sm">
            <span>Không cập nhật được dữ liệu mới nhất: {error}</span>
            <button onClick={onRetry} className="font-label-md text-label-md underline">Thử lại</button>
          </div>
        )}

        {!items.length ? (
          <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm text-center flex flex-col items-center gap-space-md">
            <span className="material-symbols-outlined text-[38px] text-outline">menu_book</span>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Không có sách đang mượn</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Bạn đang không giữ bản sao nào. Hãy tra cứu danh mục để tìm sách phù hợp.</p>
            </div>
            <Link to="/tra-cuu-sach" className="h-9 px-space-md rounded-sm bg-primary-container text-on-primary font-label-md text-label-md flex items-center">Tra cứu sách</Link>
          </div>
        ) : (
          items.map((item) => {
            const overdue = item.lateDays > 0;
            const statusClass = overdue
              ? 'bg-error-container text-error'
              : item.dueSoon
                ? 'bg-tertiary-fixed text-tertiary'
                : 'bg-secondary-container text-on-secondary-container';
            return (
              <div key={item.loanItemId} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col sm:flex-row gap-space-lg relative overflow-hidden transition-all hover:shadow-md">
                <div className="sm:w-36 w-full flex-shrink-0 flex sm:flex-col items-center gap-space-sm">
                  <BookCover item={item} />
                  <div className="flex-1 sm:w-full text-center">
                    <span className="inline-block w-full font-code-md text-code-md bg-surface-container-low text-on-surface px-1.5 py-0.5 rounded-sm">
                      {item.accessionNo || 'Chưa có ĐKCB'}
                    </span>
                    <span className="block font-label-sm text-label-sm text-outline mt-1">
                      {item.callNumber || item.ddcMain || 'Chưa phân loại'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
                      <span className={`${statusClass} font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]">{overdue ? 'warning' : 'timer'}</span>
                        {item.statusLabel}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">
                        Gia hạn lần {item.renewCount} / Tối đa {item.maxRenewals}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface leading-snug">{item.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Tác giả: {item.author || 'Chưa cập nhật'}
                      {item.publisher ? ` — ${item.publisher}` : ''}
                      {item.publishYear ? ` (${item.publishYear})` : ''}
                    </p>
                    <p className="font-label-sm text-label-sm text-outline mt-1">
                      Mã phiếu: <span className="font-code-md text-code-md text-on-surface">{item.loanCode || '—'}</span>
                      {item.categoryName ? ` • ${item.categoryName}` : ''}
                    </p>

                    <div className="mt-space-md bg-surface-container-low p-space-md rounded-lg">
                      <div className="flex justify-between items-center font-label-md text-label-md text-on-surface">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Ngày mượn</span>
                          <span className="font-code-md text-code-md font-semibold">{fmtDate(item.loanedAt)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className={`font-label-sm text-label-sm font-semibold ${overdue ? 'text-error' : 'text-tertiary'}`}>Hạn trả hiện tại</span>
                          <span className={`font-code-md text-code-md font-bold ${overdue ? 'text-error' : 'text-tertiary'}`}>{fmtDate(item.dueDate)}</span>
                        </div>
                      </div>
                      <div className="mt-space-sm">
                        <div className={`w-full ${overdue ? 'bg-error-container' : 'bg-surface-container-highest'} h-2 rounded-full overflow-hidden`}>
                          <div className={`${overdue ? 'bg-error' : item.dueSoon ? 'bg-tertiary' : 'bg-primary'} h-full rounded-full transition-all duration-500`} style={{ width: `${item.progress}%` }} />
                        </div>
                        <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
                          <span>Đã mượn {item.elapsedDays} ngày</span>
                          <span className={overdue ? 'text-error font-semibold' : item.dueSoon ? 'text-tertiary font-semibold' : ''}>
                            {overdue ? `Phạt tạm tính: ${money(item.fine)}` : `Chu kỳ ${item.cycleDays} ngày`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-space-lg pt-space-md flex flex-wrap items-start gap-space-sm">
                    <RenewButton item={item} busy={busyId === item.loanItemId} onRenew={renew} />
                    {overdue && (
                      <span className="font-label-sm text-label-sm text-error flex items-center gap-1 mt-2">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Vui lòng mang sách đến quầy để trả và thanh toán phạt.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm text-tertiary">
            <span className="material-symbols-outlined text-[24px]">gavel</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Quy định áp dụng cho hồ sơ</h3>
          </div>
          <div className="flex flex-col gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-start gap-space-sm">
              <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-primary font-bold flex-shrink-0">1</span>
              <div>
                <strong className="text-on-surface block font-label-md text-label-md">Hạn mức &amp; thời hạn:</strong>
                Mượn tối đa <strong>{type?.maxBooks ?? 0} cuốn</strong> cùng lúc, thời hạn <strong>{type?.loanDays ?? 0} ngày</strong> kể từ ngày mượn tại quầy.
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-primary font-bold flex-shrink-0">2</span>
              <div>
                <strong className="text-on-surface block font-label-md text-label-md">Gia hạn trực tuyến:</strong>
                Tối đa <strong>{type?.maxRenewals ?? 0} lần</strong>, mỗi lần <strong>+{type?.renewDays ?? 0} ngày</strong>. Chỉ áp dụng khi sách chưa quá hạn và thẻ còn hiệu lực.
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-error font-bold flex-shrink-0">3</span>
              <div>
                <strong className="text-error block font-label-md text-label-md">Phạt quá hạn:</strong>
                <strong>{money(settings?.finePerDay ?? 1000)} / ngày / cuốn</strong>, tính từ ngày kế tiếp của hạn trả. Thanh toán tại quầy thư viện.
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-error font-bold flex-shrink-0">4</span>
              <div>
                <strong className="text-error block font-label-md text-label-md">Nhắc hạn &amp; khóa mượn:</strong>
                Hệ thống nhắc trước <strong>{settings?.remindBeforeDays ?? 2} ngày</strong>. Giữ sách quá hạn trên <strong>{settings?.autoLockAfterDays ?? 30} ngày</strong> sẽ bị khóa quyền mượn mới.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm text-primary">
            <span className="material-symbols-outlined text-[22px]">badge</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Thẻ thư viện của bạn</h3>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Mã thẻ</span>
            <span className="font-code-md text-code-md text-on-surface">{patron?.cardBarcode || '—'}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Trạng thái</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">{CARD_STATUS[patron?.cardStatus] || patron?.cardStatus || '—'}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Hết hạn thẻ</span>
            <span className="font-code-md text-code-md text-on-surface">{fmtDate(patron?.cardExpiresAt)}</span>
          </div>
          <div className="flex justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant">Loại độc giả</span>
            <span className="font-label-md text-label-md text-on-surface">{type?.name || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
