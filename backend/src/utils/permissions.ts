import type { Core } from "@strapi/strapi";

/** Các API tra cứu sách dành cho mọi tài khoản đã đăng nhập */
export const READER_ACTIONS = [
  "api::book.book.search",
  "api::book.book.newArrivals",
  "api::book.book.facets",
  "api::book.book.detail",
  "api::book.book.related",
];

/**
 * Cấp quyền gọi API tra cứu cho mọi role (trừ Public). Chạy mỗi lần khởi động,
 * chỉ tạo quyền còn thiếu nên không ghi đè cấu hình đã chỉnh trong trang quản trị.
 */
export async function grantReaderPermissions(strapi: Core.Strapi) {
  const roles: any[] = await strapi.db.query("plugin::users-permissions.role").findMany();
  const permissions = strapi.db.query("plugin::users-permissions.permission");
  for (const role of roles) {
    if (role.type === "public") continue;
    for (const action of READER_ACTIONS) {
      const existing = await permissions.findOne({ where: { action, role: role.id } });
      if (!existing) await permissions.create({ data: { action, role: role.id } });
    }
  }
}
