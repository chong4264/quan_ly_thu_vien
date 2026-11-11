export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export const getToken = () => localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
export const getDeviceId = () => localStorage.getItem('authDeviceId') || sessionStorage.getItem('authDeviceId');
export const clearToken = () => {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem('jwt');
    storage.removeItem('authDeviceId');
  }
};

/** Gọi Strapi. path bắt đầu bằng "/", ví dụ api('/books'). Lỗi trả về là Error có message tiếng Việt. */
export async function api(path, { method = 'GET', body } = {}) {
  // Không gắn token cũ khi đăng nhập, tránh bị Strapi từ chối 401
  const token = path.startsWith('/auth/local') ? null : getToken();
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Không kết nối được máy chủ Strapi');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && token === getToken() && !path.startsWith('/auth/')) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    if (res.status === 403) {
      const message = data?.error?.message;
      throw new Error(message && message !== 'Forbidden' ? message : 'Tài khoản chưa được cấp quyền cho thao tác này');
    }
    throw new Error(data?.error?.message || `Lỗi ${res.status}`);
  }
  return data;
}

export const qs = (params) => new URLSearchParams(params).toString();

/** Ghép URL tương đối của Strapi (ví dụ /uploads/anh.jpg) thành URL đầy đủ. */
export const assetUrl = (url) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${API_URL}${url}`;
};

/** Ảnh bìa từ Strapi trả về đường dẫn tương đối (/uploads/...) nên cần ghép địa chỉ máy chủ */
export const coverUrl = (u) => (!u ? null : /^https?:/.test(u) ? u : `${API_URL}${u}`);
