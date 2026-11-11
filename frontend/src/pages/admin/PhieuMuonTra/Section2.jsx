import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export default function Section2() {
  const toast = useToast();
  const [counts, setCounts] = useState({ all: 0, borrowing: 0, overdue: 0, renewed2plus: 0, returned: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api('/loans/status-counts')
      .then((data) => setCounts(data || {}))
      .catch((e) => toast(e.message || 'Không tải được thống kê phiếu mượn'))
      .finally(() => setLoading(false));
  }, [toast]);
  const cards = [
    ['Tổng số phiếu mượn', counts.all, 'auto_stories'],
    ['Đang mượn', counts.borrowing, 'schedule'],
    ['Quá hạn', counts.overdue, 'warning'],
    ['Đã hoàn trả', counts.returned, 'assignment_turned_in'],
  ];
  return <div className="px-margin-desktop py-space-lg">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-desktop">
      {cards.map(([label, value, icon]) => <div key={label} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
        <div><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">{label}</span><div className="font-headline-xl text-headline-xl font-bold text-on-surface mt-1">{loading ? '...' : Number(value || 0).toLocaleString('vi-VN')}</div><span className="font-body-sm text-body-sm text-on-surface-variant">Dữ liệu trực tiếp từ hệ thống</span></div>
        <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">{icon}</span></div>
      </div>)}
    </div>
    <p className="max-w-[1600px] mx-auto mt-2 text-right font-label-sm text-label-sm text-on-surface-variant">Phiếu có từ 2 lần gia hạn: {loading ? '...' : Number(counts.renewed2plus || 0).toLocaleString('vi-VN')}</p>
  </div>;
}
