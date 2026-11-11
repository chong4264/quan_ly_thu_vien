import { api, qs } from './api';

export const REQUEST_STATUS = {
  pending: 'Chờ nhận tại quầy',
  fulfilled: 'Đã giao sách',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
};
export const fetchMyRequests = (query) => api(`/loan-requests/me?${qs(query)}`);
export const createBorrowRequest = (bookId, note) => api('/loan-requests', { method: 'POST', body: { bookId, note } });
export const cancelBorrowRequest = (id) => api(`/loan-requests/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: {} });
export const fetchAdminRequests = (query) => api(`/loan-requests/admin?${qs(query)}`);
export const fulfillBorrowRequest = (id, body) => api(`/loan-requests/${encodeURIComponent(id)}/fulfill`, { method: 'POST', body });
export const rejectBorrowRequest = (id, responseNote) => api(`/loan-requests/${encodeURIComponent(id)}/reject`, { method: 'POST', body: { responseNote } });
export const requestDate = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
