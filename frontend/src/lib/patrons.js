import { api, qs } from './api';

export const listPatrons = (query) => api(`/patrons/manage?${qs(query)}`);
export const getPatron = (id) => api(`/patrons/manage/${encodeURIComponent(id)}`);
export const patronOptions = (q = '') => api(`/patrons/manage/options?${qs({ q })}`);
export const savePatron = (id, data) => api(id ? `/patrons/manage/${encodeURIComponent(id)}` : '/patrons/manage', { method: id ? 'PUT' : 'POST', body: { data } });
export const deletePatron = (id) => api(`/patrons/manage/${encodeURIComponent(id)}`, { method: 'DELETE' });

export function patronForm(p = {}) {
  return {
    studentCode: p.studentCode || '', fullName: p.fullName || '', className: p.className || '',
    cardBarcode: p.cardBarcode || '', email: p.email || '', phone: p.phone || '', address: p.address || '',
    cardStatus: p.cardStatus || 'active', cardExpiresAt: p.cardExpiresAt || '',
    patronType: p.patronType?.documentId || '', userId: p.user?.id || '',
  };
}
