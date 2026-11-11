import { useEffect, useState } from "react";
import { AuthCtx } from './auth';
import { api, clearToken, getDeviceId, getToken } from "../lib/api";

const isStaffRole = (u) =>
  u?.role?.type === "librarian";
const ERRORS = {
  "Invalid identifier or password": "Sai tài khoản hoặc mật khẩu",
  "Your account has been blocked by the administrator":
    "Tài khoản đã bị khóa bởi quản trị viên",
  "Your account email is not confirmed": "Tài khoản chưa được xác nhận",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // Tải lại thông tin khi mở lại trang
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let active = true;
    api("/users/me?populate=role")
      .then((me) => { if (active && getToken() === token) setUser(me); })
      .catch(() => { if (active && getToken() === token) clearToken(); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Token hết hạn: api.js phát sự kiện này
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  /** Mỗi chế độ đăng nhập chỉ chấp nhận vai trò tương ứng của tài khoản. */
  const login = async (
    identifier,
    password,
    remember = true,
    { requireStaff = false } = {},
  ) => {
    let issuedToken;
    try {
      const deviceId = crypto.randomUUID();
      const { jwt } = await api("/auth/local", {
        method: "POST",
        body: { identifier, password, deviceId },
      });
      issuedToken = jwt;
      clearToken();
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("jwt", jwt);
      storage.setItem("authDeviceId", deviceId);
      const me = await api("/users/me?populate=role");
      const allowed = requireStaff
        ? isStaffRole(me)
        : ['authenticated', 'reader'].includes(me.role?.type);
      if (!allowed) {
        if (isStaffRole(me)) {
          throw new Error('Đây là tài khoản thủ thư. Vui lòng chọn Cán bộ / Thủ thư.');
        }
        if (['authenticated', 'reader'].includes(me.role?.type)) {
          throw new Error('Đây là tài khoản sinh viên / độc giả. Vui lòng chọn Sinh viên / Độc giả.');
        }
        throw new Error('Tài khoản chưa được cấp quyền cho chế độ đăng nhập này.');
      }
      setUser(me);
      return me;
    } catch (e) {
      if (issuedToken && getToken() === issuedToken) {
        try {
          await api('/auth/logout', { method: 'POST', body: { deviceId: getDeviceId() } });
        } catch {
          // Vẫn xóa phiên trên thiết bị khi máy chủ không phản hồi.
        }
        clearToken();
        setUser(null);
      }
      throw new Error(ERRORS[e.message] || e.message, { cause: e });
    }
  };

  const logout = async () => {
    const request = getToken()
      ? api('/auth/logout', { method: 'POST', body: { deviceId: getDeviceId() } })
      : Promise.resolve();
    clearToken();
    setUser(null);
    try {
      await request;
      return true;
    } catch {
      return false;
    }
  };

  const refreshUser = async () => {
    const token = getToken();
    const me = await api('/users/me?populate=role');
    if (token && getToken() === token) setUser(me);
    return me;
  };

  return (
    <AuthCtx.Provider
      value={{ user, loading, isStaff: isStaffRole(user), login, logout, refreshUser }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
