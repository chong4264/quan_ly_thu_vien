import { createContext, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken } from "../lib/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const STAFF_ROLES = ["librarian"];

export const isStaffRole = (u) =>
  !!u && STAFF_ROLES.includes((u.role?.name || "").trim().toLowerCase());
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
    if (!getToken()) return;
    api("/users/me?populate=role")
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Token hết hạn: api.js phát sự kiện này
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  /** remember=false: token chỉ sống đến khi đóng trình duyệt. requireStaff: chỉ cho thủ thư / quản trị. */
  const login = async (
    identifier,
    password,
    remember = true,
    { requireStaff = false } = {},
  ) => {
    try {
      const { jwt } = await api("/auth/local", {
        method: "POST",
        body: { identifier, password },
      });
      clearToken();
      (remember ? localStorage : sessionStorage).setItem("jwt", jwt);
      const me = await api("/users/me?populate=role");
      console.log("ME =", me);
      if (requireStaff && !isStaffRole(me)) {
        clearToken();
        throw new Error("Tài khoản này không có quyền Cán bộ / Thủ thư");
      }
      setUser(me);
      return me;
    } catch (e) {
      throw new Error(ERRORS[e.message] || e.message);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthCtx.Provider
      value={{ user, loading, isStaff: isStaffRole(user), login, logout }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
