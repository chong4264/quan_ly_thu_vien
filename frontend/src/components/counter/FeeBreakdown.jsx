import { CONDITION, money } from '../../lib/format';

/** Bảng tính tiền: phạt trả muộn + bồi thường hư hỏng = tổng cần thu. Đổi theo tình trạng sách đang chọn. */
export default function FeeBreakdown({ lateDays, finePerDay, lateFine, condition, compensation, bookPrice }) {
  const total = lateFine + compensation;
  return (
    <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-label-md text-label-md text-on-surface">Phạt trả muộn</div>
          <div className="font-label-sm text-label-sm text-outline">
            {lateDays > 0 ? `${lateDays} ngày × ${money(finePerDay)}` : 'Trả đúng hạn'}
          </div>
        </div>
        <span className={`font-code-md text-code-md font-semibold ${lateFine > 0 ? 'text-error' : 'text-on-surface-variant'}`}>{money(lateFine)}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-label-md text-label-md text-on-surface">Bồi thường hư hỏng</div>
          <div className="font-label-sm text-label-sm text-outline">
            {condition === 'lost' ? `Mất sách • giá bìa ${money(bookPrice)}` : CONDITION[condition]}
          </div>
        </div>
        <span className={`font-code-md text-code-md font-semibold ${compensation > 0 ? 'text-error' : 'text-on-surface-variant'}`}>{money(compensation)}</span>
      </div>

      <div className="border-t border-outline-variant/50 pt-2 flex items-center justify-between">
        <span className="font-label-lg text-label-lg font-semibold text-on-surface">Tổng cần thu</span>
        {total > 0
          ? <span className="font-headline-sm text-headline-sm font-bold text-error">{money(total)}</span>
          : <span className="font-label-md text-label-md font-semibold text-secondary">Không phát sinh phí</span>}
      </div>
    </div>
  );
}
