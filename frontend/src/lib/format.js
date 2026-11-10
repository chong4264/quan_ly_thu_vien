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
