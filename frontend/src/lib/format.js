const pad = (n) => String(n).padStart(2, '0');
export const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
export const fmtTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${fmtDate(v)}`;
};
export const money = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n || 0))}đ`;
export const addDaysFromToday = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
export const CONDITION = { normal: 'Nguyên vẹn', scratched: 'Trầy xước nhẹ', damaged: 'Rách, hư hại', lost: 'Mất sách' };
export const LANGUAGE = { vie: 'Tiếng Việt', eng: 'Tiếng Anh', fra: 'Tiếng Pháp', zho: 'Tiếng Trung', rus: 'Tiếng Nga' };
export const COPY_CONDITION = { new: 'Mới', good: 'Tốt', worn: 'Đã cũ', damaged: 'Hư hại' };
export const CIRCULATION = { available: 'Có sẵn trên kệ', borrowed: 'Đang mượn', processing: 'Đang xử lý', lost: 'Đã mất' };
