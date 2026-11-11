import { api, qs } from './api';

export const fetchMyLoans = () => api('/loan-items/me/current');

export const fetchMyLoanHistory = (params) => api(`/loan-items/me/history?${qs(params)}`);

export const renewMyLoan = (loanItemId) =>
  api(`/loan-items/me/${encodeURIComponent(loanItemId)}/renew`, { method: 'POST' });
